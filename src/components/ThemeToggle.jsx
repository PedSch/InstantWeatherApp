import React from 'react'
import { useTheme } from '../theme.js'

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  return (
    <button
      className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm shadow"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? '🌞' : '🌙'}
    </button>
  )
}
