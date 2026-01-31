import React from 'react'
import { getIcon } from '../../icons/WeatherIcons'

// Small Icons export for UI primitives. Exposes a `Weather` icon wrapper that
// delegates to the project's existing `getIcon` helper. Additional icons can
// be exported from here later to provide a single import point.

export function WeatherIcon({ code, isDay = 1, className = '' }) {
  return getIcon(code, isDay, className)
}

export default { WeatherIcon }
