/**
 * useSavedLocations.js
 * Persist saved locations in localStorage; expose list and add/remove actions.
 */

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'saved_locations'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function useSavedLocations() {
  const [saved, setSaved] = useState(loadSaved)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch (e) {}
  }, [saved])

  const addLocation = useCallback((entry) => {
    if (!entry || !entry.name) return
    setSaved(prev => {
      const dedup = [entry, ...prev.filter(s => s.name !== entry.name)]
      return dedup
    })
  }, [])

  const removeLocation = useCallback((name) => {
    setSaved(prev => prev.filter(s => s.name !== name))
  }, [])

  return { saved, addLocation, removeLocation }
}
