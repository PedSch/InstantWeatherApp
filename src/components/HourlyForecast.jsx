import React from 'react'
import { getIcon } from '../icons/WeatherIcons'
import { useTranslation } from '../i18n.jsx'

function formatHour(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: 'numeric' })
}

function toUnit(tempC, unit) {
  if (unit === 'F') return Math.round((tempC * 9) / 5 + 32)
  return Math.round(tempC)
}

export default function HourlyForecast({ data = [], unit = 'C' }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="text-sm font-medium text-slate-600 mb-3">{t('hourly')}</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-3 sm:gap-4 items-center pb-2">
          {data.map((h, i) => (
            <div key={i} className="min-w-[64px] sm:min-w-[78px] bg-white/80 rounded-lg p-3 sm:p-4 text-center shadow-sm card-transition hover:scale-[1.03]">
              <div className="text-xs text-slate-400">{formatHour(h.time)}</div>
              <div className="text-lg font-medium mt-1">{toUnit(h.temp, unit)}°</div>
              <div className="mt-1" aria-hidden>{getIcon(h.code, 1, 'w-8 h-8')}</div>
              <div className="text-xs text-slate-400 mt-1">{h.precip ?? 0}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
