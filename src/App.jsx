/**
 * App.jsx
 * Main application container and orchestrator.
 *
 * Thought process / runbook:
 * - This file handles user interactions (search, save location, unit toggle) and coordinates
 *   fetching weather data from Open-Meteo via client calls or via the serverless proxy (if used).
 * - For production we keep API keys server-side (see `api/weather.js`) and prefer proxy usage.
 * - Saved locations are stored with metadata (lat/lon, temp, weathercode) in localStorage so
 *   the left-hand preview can show a quick snapshot without re-fetching.
 * - Geolocation is requested on mount to show the user's current weather (if permitted).
 */
import React, { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import LoadingSpinner from './components/LoadingSpinner'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import UnitToggle from './components/UnitToggle'
import { I18nProvider, useTranslation } from './i18n.jsx'
import LanguageToggle from './components/LanguageToggle'
import SavedLocations from './components/SavedLocations'

// Open-Meteo endpoints
const GEOCODE_BASE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast'

function InnerApp() {
  return <AppContent />
}

function AppContent() {
  const { t } = useTranslation()
  // `weather` stores a small normalized object for the UI
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unit, setUnit] = useState(() => {
    try {
      return localStorage.getItem('unit') || 'C'
    } catch (e) {
      return 'C'
    }
  })
  const [hourly, setHourly] = useState(null)
  const [daily, setDaily] = useState(null)
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem('saved_locations')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try { localStorage.setItem('unit', unit) } catch (e) {}
  }, [unit])

  // on mount: optionally try to get geolocation and show current location
  useEffect(() => {
    if (!navigator || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // fetch forecast by coords and label it as Current Location
        fetchForecastByCoords(latitude, longitude, 'Current Location', '')
      },
      (err) => {
        // ignore geolocation errors silently
      },
      { maximumAge: 1000 * 60 * 5 }
    )
  }, [])

  // Search flow using Open-Meteo (no API key required):
  // 1) Geocode city -> lat/lon
  // 2) Fetch current_weather for lat/lon
  async function handleSearch(city) {
    setLoading(true)
    setError(null)
    setWeather(null)
    try {
      // 1) Geocoding (take first result)
      const geoRes = await fetch(`${GEOCODE_BASE}?name=${encodeURIComponent(city)}&count=1`)
      if (!geoRes.ok) throw new Error('Failed to lookup location')
      const geo = await geoRes.json()
      if (!geo.results || geo.results.length === 0) throw new Error('City not found')

      const place = geo.results[0]
      const lat = place.latitude
      const lon = place.longitude
      const displayName = place.name
      const country = place.country

      // 2) Forecast: request current, hourly and daily in one call
      // hourly variables: temperature_2m, weathercode, precipitation_probability
      // daily variables: temperature_2m_max, temperature_2m_min, weathercode
      const hourlyVars = ['temperature_2m', 'weathercode', 'precipitation_probability'].join(',')
      const dailyVars = ['temperature_2m_max', 'temperature_2m_min', 'weathercode'].join(',')
      const fUrl = `${FORECAST_BASE}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${hourlyVars}&daily=${dailyVars}&timezone=auto&forecast_days=7`
      const fRes = await fetch(fUrl)
      if (!fRes.ok) throw new Error('Failed to fetch weather')
      const f = await fRes.json()
      if (!f.current_weather) throw new Error('No current weather available')

      const cw = f.current_weather
      // Normalize weather object for the WeatherCard
      setWeather({
        name: displayName,
        country,
        lat,
        lon,
        temp: cw.temperature,
        weathercode: cw.weathercode,
        is_day: cw.is_day,
        time: cw.time,
        windspeed: cw.windspeed
      })

      // Build hourly array (time, temp, code, precip) — include next 24 hours starting from now
      if (f.hourly && f.hourly.time) {
        const times = f.hourly.time
        const temps = f.hourly.temperature_2m || []
        const codes = f.hourly.weathercode || []
        const precs = f.hourly.precipitation_probability || []
        const nowIdx = times.findIndex(t => new Date(t) >= new Date(cw.time))
        const start = nowIdx >= 0 ? nowIdx : 0
        const items = []
        for (let i = start; i < Math.min(times.length, start + 24); i++) {
          items.push({ time: times[i], temp: temps[i], code: codes[i], precip: precs[i] })
        }
        setHourly(items)
      } else {
        setHourly(null)
      }

      // Build daily array (date, min, max, code)
      if (f.daily && f.daily.time) {
        const dtimes = f.daily.time
        const dmax = f.daily.temperature_2m_max || []
        const dmin = f.daily.temperature_2m_min || []
        const dcode = f.daily.weathercode || []
        const dailyItems = dtimes.map((dt, idx) => ({ date: dt, max: dmax[idx], min: dmin[idx], code: dcode[idx] }))
        setDaily(dailyItems)
      } else {
        setDaily(null)
      }
    } catch (err) {
      const msg = err && err.message ? err.message : ''
      if (msg.includes('City not found')) setError(t('not_found'))
      else setError(t('error_fetch'))
    } finally {
      setLoading(false)
    }
  }

  async function fetchForecastByCoords(lat, lon, displayName = 'Current Location', country = '') {
    setLoading(true)
    setError(null)
    setWeather(null)
    try {
      const hourlyVars = ['temperature_2m', 'weathercode', 'precipitation_probability'].join(',')
      const dailyVars = ['temperature_2m_max', 'temperature_2m_min', 'weathercode'].join(',')
      const fUrl = `${FORECAST_BASE}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${hourlyVars}&daily=${dailyVars}&timezone=auto&forecast_days=7`
      const fRes = await fetch(fUrl)
      if (!fRes.ok) throw new Error('Failed to fetch weather')
      const f = await fRes.json()
      if (!f.current_weather) throw new Error('No current weather available')

      const cw = f.current_weather
      setWeather({
        name: displayName,
        country,
        lat,
        lon,
        temp: cw.temperature,
        weathercode: cw.weathercode,
        is_day: cw.is_day,
        time: cw.time,
        windspeed: cw.windspeed
      })

      if (f.hourly && f.hourly.time) {
        const times = f.hourly.time
        const temps = f.hourly.temperature_2m || []
        const codes = f.hourly.weathercode || []
        const precs = f.hourly.precipitation_probability || []
        const nowIdx = times.findIndex(t => new Date(t) >= new Date(cw.time))
        const start = nowIdx >= 0 ? nowIdx : 0
        const items = []
        for (let i = start; i < Math.min(times.length, start + 24); i++) {
          items.push({ time: times[i], temp: temps[i], code: codes[i], precip: precs[i] })
        }
        setHourly(items)
      } else setHourly(null)

      if (f.daily && f.daily.time) {
        const dtimes = f.daily.time
        const dmax = f.daily.temperature_2m_max || []
        const dmin = f.daily.temperature_2m_min || []
        const dcode = f.daily.weathercode || []
        const dailyItems = dtimes.map((dt, idx) => ({ date: dt, max: dmax[idx], min: dmin[idx], code: dcode[idx] }))
        setDaily(dailyItems)
      } else setDaily(null)
    } catch (err) {
      setError(t('error_fetch'))
    } finally {
      setLoading(false)
    }
  }

  function saveLocation(name) {
    try {
      if (!name || !weather) return
      // save full metadata from current weather
      const entry = { name: weather.name || name, country: weather.country, lat: weather.lat, lon: weather.lon, temp: weather.temp, weathercode: weather.weathercode, is_day: weather.is_day }
      const dedup = [entry, ...saved.filter(s => s.name !== entry.name)]
      setSaved(dedup)
      localStorage.setItem('saved_locations', JSON.stringify(dedup))
      setToast(`${t('save_location')}: ${entry.name}`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {}
  }

  function removeLocation(name) {
    try {
      const next = saved.filter(s => s.name !== name)
      setSaved(next)
      localStorage.setItem('saved_locations', JSON.stringify(next))
      setToast(`${t('remove')}: ${name}`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {}
  }


  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6">
      <div className="w-full max-w-6xl flex gap-6">
        {/* Left sidebar with saved locations */}
        <aside className="w-72">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('saved_locations')}</h2>
            </div>
            <SavedLocations items={saved} onSelect={(it) => {
              if (it && it.lat && it.lon) fetchForecastByCoords(it.lat, it.lon, it.name, it.country)
              else handleSearch(it.name)
            }} onRemove={removeLocation} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <UnitToggle unit={unit} setUnit={setUnit} />
            </div>
          </div>

          <SearchBar onSearch={handleSearch} placeholder={t('search_placeholder')} buttonText={t('search_button')} />

          <div className="mt-6">
            {loading && (
              <div className="py-8">
                <LoadingSpinner />
              </div>
            )}
            {error && (
              <div className="py-4 bg-red-50 border border-red-100 text-red-700 rounded-md text-center">{error}</div>
            )}
            {weather && (
              <div>
                <div className="flex items-center justify-end gap-2 mb-2">
                  <button onClick={() => saveLocation(weather.name)} className="px-3 py-1 rounded bg-sky-600 text-white text-sm shadow">{t('save_location')}</button>
                </div>
                <WeatherCard data={weather} unit={unit} />
              </div>
            )}

            {hourly && (
              <div className="mt-6">
                <HourlyForecast data={hourly} unit={unit} />
              </div>
            )}

            {daily && (
              <div className="mt-6">
                <DailyForecast data={daily} unit={unit} />
              </div>
            )}
          </div>
        </main>

      </div>

      {toast && (
        <div className="fixed left-6 bottom-6 bg-slate-800 text-white px-4 py-2 rounded shadow-lg">{toast}</div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <InnerApp />
    </I18nProvider>
  )
}
