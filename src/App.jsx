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
import MapPreview from './components/MapPreview'
import ShareButton from './components/ShareButton'
import LoadingSpinner from './components/LoadingSpinner'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import UnitToggle from './components/UnitToggle'
import { I18nProvider, useTranslation } from './i18n.jsx'
import { fetchFunFact } from './funFact.js'
import { fetchTrivia } from './trivia.js'
import LanguageToggle from './components/LanguageToggle'
import ThemeToggle from './components/ThemeToggle'
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
  const [funFact, setFunFact] = useState(null)
  const [trivia, setTrivia] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showGeoPrompt, setShowGeoPrompt] = useState(false)
  const [showSavedDrawer, setShowSavedDrawer] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('unit', unit) } catch (e) {}
  }, [unit])

  // On mount: ask for geolocation permission with custom message
  useEffect(() => {
    if (!navigator || !navigator.geolocation) return
    // Show a small CODEWITHDRO banner (UI) if not yet prompted. We won't auto-display results
    // until the user accepts browser permission. This keeps behavior explicit.
    // We track a flag so we don't spam the user every reload.
    const prompted = localStorage.getItem('geo_prompted')
    if (!prompted) {
      // show a small in-app prompt (rendered below) by setting state
      setShowGeoPrompt(true)
    }
  }, [])

  // Search flow using Open-Meteo (no API key required):
  // 1) Geocode city -> lat/lon
  // 2) Fetch current_weather for lat/lon
  async function handleSearch(city) {
    setLoading(true)
    setError(null)
    setWeather(null)
    setFunFact(null)
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

      // Fetch fun fact for this location
      fetchFunFact(displayName, country).then(fact => setFunFact(fact))

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
    setFunFact(null)
    try {
      const hourlyVars = ['temperature_2m', 'weathercode', 'precipitation_probability'].join(',')
      const dailyVars = ['temperature_2m_max', 'temperature_2m_min', 'weathercode'].join(',')
      const fUrl = `${FORECAST_BASE}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${hourlyVars}&daily=${dailyVars}&timezone=auto&forecast_days=7`
      const fRes = await fetch(fUrl)
      if (!fRes.ok) throw new Error('Failed to fetch weather')
      const f = await fRes.json()
      if (!f.current_weather) throw new Error('No current weather available')

      const cw = f.current_weather
      // Fetch fun fact for this location
      fetchFunFact(displayName, country).then(fact => setFunFact(fact))
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

  function handleAllowGeo() {
    setShowGeoPrompt(false)
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          fetchForecastByCoords(latitude, longitude, 'Your Location', '')
        },
        (err) => {
          setToast('Geolocation denied or failed')
          setTimeout(() => setToast(null), 2500)
        },
        { maximumAge: 1000 * 60 * 5 }
      )
    } catch (e) {
      // ignore
    }
    localStorage.setItem('geo_prompted', '1')
  }

  function handleDeclineGeo() {
    setShowGeoPrompt(false)
    localStorage.setItem('geo_prompted', '1')
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
      setToast(`${t('removed')}: ${name}`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {}
  }

  // Notify current weather via native/local notifications or Web Notification
  async function notifyWeather() {
    try {
      if (!weather) return
      const title = `${weather.name}`
      const cond = `${Math.round(weather.temp)}°${unit} • ${weather.is_day ? t('day') : t('night')}`
      // dynamic import of native helper
      const mod = await import('./native.js')
      const res = await mod.scheduleLocalNotification({ title: `Weather — ${title}`, body: cond })
      // show small toast to indicate the platform used
      if (res.platform === 'capacitor') setToast('Notification scheduled (native)')
      else if (res.platform === 'web') setToast('Notification sent (web)')
      else setToast('Unable to send notification')
      setTimeout(() => setToast(null), 2000)
    } catch (e) {
      // ignore
    }
  }


  return (
    <React.Fragment>
      <header className="header-blur fixed top-0 left-0 w-full z-10 py-3 px-6 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight">{t('title')}</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>
      <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 pt-20">
        <div className="w-full max-w-6xl flex gap-6 flex-col md:flex-row">
          {/* Left sidebar with saved locations */}
          <aside className="hidden md:block w-72">
            <div className="card glass mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('saved_locations')}</h2>
              </div>
              <SavedLocations items={saved} onSelect={(it) => {
                if (it && it.lat && it.lon) fetchForecastByCoords(it.lat, it.lon, it.name, it.country)
                else handleSearch(it.name)
              }} onRemove={removeLocation} />
            </div>
          </aside>
          {/* Mobile saved locations drawer toggle */}
          <div className="md:hidden w-full mb-2">
            <div className="flex items-center justify-end">
              <button className="px-3 py-2 rounded bg-sky-600 text-white text-sm" onClick={() => setShowSavedDrawer(true)}>
                {t('saved_locations')}
              </button>
            </div>
          </div>
          {/* Geo permission banner */}
          {showGeoPrompt && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-md flex items-center gap-4">
                <div className="text-sm">CODEWITHDRO requests your location to show local weather.</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded bg-sky-600 text-white text-sm" onClick={handleAllowGeo}>Allow</button>
                  <button className="px-3 py-1 rounded bg-white border" onClick={handleDeclineGeo}>No thanks</button>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 max-w-3xl">
            <div className="card glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">{t('title')}</h1>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
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
                {/* Only show weather/fact if a location is selected/searched */}
                {weather ? (
                  <div>
                    <div className="flex items-center justify-end gap-2 mb-2 flex-wrap">
                      <button onClick={() => saveLocation(weather.name)} className="px-3 py-1 rounded bg-sky-600 text-white text-sm shadow">{t('save_location')}</button>
                      <button onClick={() => notifyWeather()} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm shadow">{t('notify')}</button>
                      <ShareButton text={`${weather.name}, ${weather.country}: ${Math.round(weather.temp)}°${unit}. ${funFact ? funFact : ''}`}/>
                    </div>
                    <WeatherCard data={weather} unit={unit} />
                    <MapPreview lat={weather.lat} lon={weather.lon} name={weather.name} />
                    <div className="mt-4 p-4 rounded-lg bg-white/70 shadow text-slate-700">
                      <div className="font-semibold mb-1">{t('fun_fact')}</div>
                      <div className="text-sm">{funFact ? funFact : t('no_fact')}</div>
                    </div>
                    {/* Trivia panel */}
                    <div className="mt-4 p-4 rounded-lg bg-white/70 shadow text-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{t('trivia')}</div>
                          <div className="text-xs text-slate-500">{trivia && `${trivia.category} • ${trivia.difficulty}`}</div>
                        </div>
                      {trivia ? (
                        <div>
                          <div className="text-sm mb-2">{trivia.question}</div>
                          <div className="flex flex-col gap-2">
                            {trivia.choices.map((c, i) => (
                              <button key={i} className={`text-left px-3 py-2 rounded ${showAnswer && c === trivia.correct ? 'bg-emerald-100' : 'bg-white/60'}`} onClick={() => setShowAnswer(true)}>
                                {c}
                              </button>
                            ))}
                          </div>
                          {showAnswer && (
                            <div className="mt-2 text-sm text-slate-700">{t('answer')}: <strong>{trivia.correct}</strong></div>
                          )}
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1 rounded bg-sky-600 text-white text-sm" onClick={() => { setTrivia(null); setShowAnswer(false); }}>{t('new')}</button>
                            <ShareButton text={trivia.question + ' — ' + t('answer') + ': ' + trivia.correct} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">{t('no_trivia')}. <button className="underline" onClick={async () => { const q = await fetchTrivia(); if (q) setTrivia(q); }}>{t('load_trivia')}</button></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-12 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold mb-2 text-slate-700">🌤️ Welcome to Instant Weather!</div>
                    <div className="text-lg mb-4">Search for any city or select a saved location to see weather, fun facts, and more.</div>
                    <div className="max-w-md w-full">
                      <SearchBar onSearch={handleSearch} placeholder={t('search_placeholder')} buttonText={t('search_button')} />
                    </div>
                  </div>
                )}
                {hourly && weather && (
                  <div className="mt-6">
                    <HourlyForecast data={hourly} unit={unit} />
                  </div>
                )}
                {daily && weather && (
                  <div className="mt-6">
                    <DailyForecast data={daily} unit={unit} />
                  </div>
                )}
              </div>
            </div>
          </main>

        </div>

        {toast && (
          <div className="fixed left-6 bottom-6 bg-slate-800 text-white px-4 py-2 rounded shadow-lg">{toast}</div>
        )}

        {/* Mobile saved locations drawer */}
        {showSavedDrawer && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setShowSavedDrawer(false)} />
            <div className="ml-auto w-80 bg-white h-full p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t('saved_locations')}</h3>
                <button className="px-2 py-1" onClick={() => setShowSavedDrawer(false)}>Close</button>
              </div>
              <SavedLocations items={saved} onSelect={(it) => {
                setShowSavedDrawer(false)
                if (it && it.lat && it.lon) fetchForecastByCoords(it.lat, it.lon, it.name, it.country)
                else handleSearch(it.name)
              }} onRemove={(n) => { removeLocation(n); }} />
            </div>
          </div>
        )}
        <footer className="footer-blur fixed bottom-0 left-0 w-full z-10 py-2 px-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Instant Weather
        </footer>
      </div>
    </React.Fragment>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <InnerApp />
    </I18nProvider>
  )
}
