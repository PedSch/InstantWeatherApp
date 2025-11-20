/**
 * SavedLocations.jsx
 * Component that renders saved city previews in the left sidebar.
 *
 * Thought process:
 * - Saved entries hold lightweight metadata so the UI can show a preview (icon + temp)
 *   without making a network request when rendering the list.
 * - Clicking 'Open' will load the full forecast using coordinates when available.
 * - Removal updates localStorage and shows a brief toast (handled by App).
 */
import React from 'react'
import { getIcon } from '../icons/WeatherIcons'
import { useTranslation } from '../i18n.jsx'

// items: array of saved objects: { name, country, lat, lon, temp, weathercode, is_day }
export default function SavedLocations({ items = [], onSelect = () => {}, onRemove = () => {}, title, removeLabel }) {
  const { t } = useTranslation()
  title = title || t('saved_locations')
  removeLabel = removeLabel || t('remove')

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-500">{title}</div>
      </div>
      {(!items || items.length === 0) ? (
        <div className="p-4 rounded bg-white/80 text-slate-600 shadow-sm">
          <div className="text-sm">{t('no_saved_locations')}</div>
          <div className="text-xs text-slate-400">{t('no_saved_hint')}</div>
        </div>
      ) : (
          <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <div key={i} className="saved-item flex items-center gap-3 bg-white/80 rounded-md px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-md">
                  {getIcon(it.weathercode, it.is_day ? 1 : 0, 'w-6 h-6')}
                </div>
                <div className="text-sm text-slate-700 text-left">
                  <div className="font-medium">{it.name}{it.country ? `, ${it.country}` : ''}</div>
                  <div className="text-xs text-slate-400">{it.temp ? `${Math.round(it.temp)}°` : ''}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm rounded bg-white/60" onClick={() => onSelect(it)}>{t('open')}</button>
                <button title={removeLabel} className="text-xs text-red-500" onClick={() => onRemove(it.name)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
