/**
 * useWeather.js
 * Fetch and hold current weather, hourly, daily; expose search and fetch-by-coords.
 */

import { useState, useCallback } from 'react'
import { searchByCity, fetchByCoords } from '../services/weatherService'

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [hourly, setHourly] = useState(null)
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearResult = useCallback(() => {
    setWeather(null)
    setError(null)
    setHourly(null)
    setDaily(null)
  }, [])

  const search = useCallback(async (city) => {
    setLoading(true)
    setError(null)
    setWeather(null)
    setHourly(null)
    setDaily(null)
    try {
      const { weather: w, hourly: h, daily: d } = await searchByCity(city)
      setWeather(w)
      setHourly(h)
      setDaily(d)
    } catch (err) {
      const msg = err && err.message ? err.message : ''
      setError(msg.includes('City not found') ? (onErrorMsg?.('not_found') ?? 'City not found') : (onErrorMsg?.('error_fetch') ?? 'Failed to fetch weather'))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchByCoordinates = useCallback(async (lat, lon, displayName = 'Your Location', country = '', onErrorMsg) => {
    setLoading(true)
    setError(null)
    setWeather(null)
    setHourly(null)
    setDaily(null)
    try {
      const { weather: w, hourly: h, daily: d } = await fetchByCoords(lat, lon, displayName, country)
      setWeather(w)
      setHourly(h)
      setDaily(d)
    } catch (err) {
      setError('error_fetch')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    weather,
    hourly,
    daily,
    loading,
    error,
    setError,
    clearResult,
    search,
    fetchByCoordinates
  }
}
