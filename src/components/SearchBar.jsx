/**
 * SearchBar.jsx
 * Controlled input for searching cities.
 *
 * Thought process:
 * - Keep this component focused: controlled input + submit callback. Use i18n for placeholders
 *   and buttons so language switching updates the UI immediately.
 */
import React, { useState } from 'react'
import { useTranslation } from '../i18n.jsx'
import Button from './ui/Button'

// SearchBar component: controlled input + submit button with improved UI.
// Props:
// - onSearch(city: string): called when user submits a non-empty city.
export default function SearchBar({ onSearch, placeholder, buttonText }) {
  const [value, setValue] = useState('')
  const { t } = useTranslation()

  function submit(e) {
    e.preventDefault()
    const text = value.trim()
    if (!text) return
    onSearch(text)
    setValue('')
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <input
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
          placeholder={placeholder || t('search_placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="city"
        />
      </div>
      <Button
        type="submit"
        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg shadow hover:from-sky-600 hover:to-indigo-700 transition-transform transform hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
      >
        {buttonText || t('search_button')}
      </Button>
    </form>
  )
}
