import React from 'react'

export default function UnitToggle({ unit, setUnit }) {
  return (
    <div className="flex items-center gap-2 bg-white/60 rounded-md p-1 shadow-sm">
      <button
        onClick={() => setUnit('C')}
        className={`px-3 py-1 rounded-md transition ${unit === 'C' ? 'bg-sky-600 text-white shadow' : 'bg-transparent text-slate-700'}`}
        aria-pressed={unit === 'C'}
      >
        °C
      </button>
      <button
        onClick={() => setUnit('F')}
        className={`px-3 py-1 rounded-md transition ${unit === 'F' ? 'bg-sky-600 text-white shadow' : 'bg-transparent text-slate-700'}`}
        aria-pressed={unit === 'F'}
      >
        °F
      </button>
    </div>
  )
}
