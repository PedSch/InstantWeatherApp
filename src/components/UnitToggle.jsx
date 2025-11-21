import React from 'react'

export default function UnitToggle({ unit, setUnit }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white/60 rounded-md p-0.5 sm:p-1 shadow-sm">
      <button
        onClick={() => setUnit('C')}
        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition ${unit === 'C' ? 'bg-sky-600 text-white shadow' : 'bg-transparent text-slate-700'}`}
        aria-pressed={unit === 'C'}
      >
        °C
      </button>
      <button
        onClick={() => setUnit('F')}
        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition ${unit === 'F' ? 'bg-sky-600 text-white shadow' : 'bg-transparent text-slate-700'}`}
        aria-pressed={unit === 'F'}
      >
        °F
      </button>
    </div>
  )
}
