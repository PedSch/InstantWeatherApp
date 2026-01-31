import React from 'react'
import { getIcon } from '../icons/WeatherIcons'
import { useTranslation } from '../i18n.jsx'

function formatDay(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

function toUnit(tempC, unit) {
  if (unit === 'F') return Math.round((tempC * 9) / 5 + 32)
  return Math.round(tempC)
}

export default function DailyForecast({ data = [], unit = 'C' }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-700 mb-4">{t('daily_forecast')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {data.map((d, i) => (
          <div key={i} className="bg-white/80 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col items-center card-transition hover:scale-[1.02] min-h-[120px] justify-center">
            <div className="text-sm text-slate-500">{formatDay(d.date)}</div>
            <div className="text-2xl mt-1">{getIcon(d.code, 1, 'w-7 h-7 sm:w-8 sm:h-8')}</div>
            <div className="mt-2 text-sm text-slate-600">{toUnit(d.max, unit)}° / {toUnit(d.min, unit)}°</div>
          </div>
        ))}
      </div>
    </div>
  )
}
