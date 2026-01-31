/**
 * weatherService.js
 * Fetch and normalize weather data from Open-Meteo (geocode + forecast).
 * Single source for API URLs and response normalization.
 */

const GEOCODE_BASE = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast'

const HOURLY_VARS = ['temperature_2m', 'weathercode', 'precipitation_probability'].join(',')
const DAILY_VARS = ['temperature_2m_max', 'temperature_2m_min', 'weathercode'].join(',')

/**
 * Geocode a city name to lat/lon. Returns first result or null.
 * @param {string} city
 * @returns {Promise<{ latitude: number, longitude: number, name: string, country: string } | null>}
 */
export async function geocodeCity(city) {
  const res = await fetch(`${GEOCODE_BASE}?name=${encodeURIComponent(city)}&count=1`)
  if (!res.ok) throw new Error('Failed to lookup location')
  const data = await res.json()
  if (!data.results || data.results.length === 0) throw new Error('City not found')
  const place = data.results[0]
  return {
    latitude: place.latitude,
    longitude: place.longitude,
    name: place.name,
    country: place.country ?? ''
  }
}

/**
 * Fetch forecast for lat/lon. Returns raw API response.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
export async function fetchForecast(lat, lon) {
  const url = `${FORECAST_BASE}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=${HOURLY_VARS}&daily=${DAILY_VARS}&timezone=auto&forecast_days=7`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather')
  const data = await res.json()
  if (!data.current_weather) throw new Error('No current weather available')
  return data
}

/**
 * Normalize API forecast response to UI shape: { weather, hourly, daily }.
 * @param {object} api - Raw Open-Meteo forecast response
 * @param {string} displayName
 * @param {string} country
 * @returns {{ weather: object, hourly: array|null, daily: array|null }}
 */
export function normalizeForecast(api, displayName, country) {
  const cw = api.current_weather
  const lat = api.latitude
  const lon = api.longitude

  const weather = {
    name: displayName,
    country,
    lat,
    lon,
    temp: cw.temperature,
    weathercode: cw.weathercode,
    is_day: cw.is_day,
    time: cw.time,
    windspeed: cw.windspeed
  }

  let hourly = null
  if (api.hourly && api.hourly.time) {
    const times = api.hourly.time
    const temps = api.hourly.temperature_2m || []
    const codes = api.hourly.weathercode || []
    const precs = api.hourly.precipitation_probability || []
    const nowIdx = times.findIndex(t => new Date(t) >= new Date(cw.time))
    const start = nowIdx >= 0 ? nowIdx : 0
    hourly = []
    for (let i = start; i < Math.min(times.length, start + 24); i++) {
      hourly.push({ time: times[i], temp: temps[i], code: codes[i], precip: precs[i] })
    }
  }

  let daily = null
  if (api.daily && api.daily.time) {
    const dtimes = api.daily.time
    const dmax = api.daily.temperature_2m_max || []
    const dmin = api.daily.temperature_2m_min || []
    const dcode = api.daily.weathercode || []
    daily = dtimes.map((dt, idx) => ({
      date: dt,
      max: dmax[idx],
      min: dmin[idx],
      code: dcode[idx]
    }))
  }

  return { weather, hourly, daily }
}

/**
 * Search by city name: geocode then fetch and normalize.
 * @param {string} city
 * @returns {Promise<{ weather, hourly, daily }>}
 */
export async function searchByCity(city) {
  const name = typeof city === 'string' ? city.trim() : ''
  if (!name) throw new Error('City not found')
  const geo = await geocodeCity(name)
  const api = await fetchForecast(geo.latitude, geo.longitude)
  return normalizeForecast(api, geo.name, geo.country)
}

/**
 * Fetch forecast by coordinates and return normalized result.
 * @param {number} lat
 * @param {number} lon
 * @param {string} displayName
 * @param {string} country
 * @returns {Promise<{ weather, hourly, daily }>}
 */
export async function fetchByCoords(lat, lon, displayName = 'Current Location', country = '') {
  const api = await fetchForecast(lat, lon)
  return normalizeForecast(api, displayName, country)
}
