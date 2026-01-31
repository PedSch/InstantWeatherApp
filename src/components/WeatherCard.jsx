/**
 * WeatherCard.jsx
 * Presentational component for the current weather snapshot.
 *
 * Thought process:
 * - Receives a normalized `data` object from App with fields curated from the
 *   upstream API. Keeps rendering logic simple and delegates translations to `useTranslation()`.
 */
import React from 'react'
import { getIcon } from '../icons/WeatherIcons'
import { useTranslation } from '../i18n.jsx'
import Card from './ui/Card'

// WeatherCard expects a normalized object from App:
// { name, country, temp, weathercode, is_day, time, windspeed }
export default function WeatherCard({ data, unit = 'C' }) {
  const { t } = useTranslation()
  const { name, country, temp, weathercode, is_day, time, windspeed } = data
  const tempDisplay = unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)

  return (
    <Card className="bg-gradient-to-b from-white/80 to-slate-50 rounded-2xl shadow-lg p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 card-transition card-elevate fade-up">
      <div className="flex-none bg-slate-100 rounded-xl p-4 sm:p-5 flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28">
        {getIcon(weathercode, is_day, 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20')}
      </div>
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">
              {name}{country ? `, ${country}` : ''}
            </div>
            <div className="text-sm text-slate-400">{time}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">{tempDisplay}°{unit}</div>
            <div className="text-sm text-slate-500">{is_day ? t('day') : t('night')}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-slate-600">{/* description derived from code visually */}</div>
          <div className="text-sm text-slate-500">{t('wind')}: {windspeed} km/h</div>
        </div>
      </div>
    </Card>
  )
}
