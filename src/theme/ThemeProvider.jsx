import React, { createContext, useContext, useEffect, useState } from 'react'
import tokens from '../components/ui/tokens'

const ThemeContext = createContext()

function applyCssVars(vars = {}) {
  const root = typeof document !== 'undefined' ? document.documentElement : null
  if (!root) return
  Object.keys(vars).forEach(k => {
    root.style.setProperty(k, vars[k])
  })
}

const lightVars = {
  '--bg-1': '#f8fafc',
  '--bg-2': '#eef2ff',
  '--card': 'rgba(255,255,255,0.9)',
  '--muted': '#6b7280',
  '--glass': 'rgba(255,255,255,0.6)',
  '--space-xs': '6px',
  '--space-sm': '12px',
  '--space-md': '16px',
  '--space-lg': '24px',
  '--radius-sm': '8px',
  '--radius-md': '12px',
  '--font-base': '16px',
  '--font-lg': '20px'
}

const darkVars = {
  '--bg-1': '#0b1220',
  '--bg-2': '#071427',
  '--card': 'rgba(12,18,28,0.85)',
  '--muted': '#9ca3af',
  '--glass': 'rgba(20,25,35,0.55)',
  '--space-xs': '6px',
  '--space-sm': '12px',
  '--space-md': '16px',
  '--space-lg': '24px',
  '--radius-sm': '8px',
  '--radius-md': '12px',
  '--font-base': '16px',
  '--font-lg': '20px'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light' } catch (e) { return 'light' }
  })

  useEffect(() => {
    // apply base tokens (from tokens.js) as CSS vars if any
    // tokens exports spacing, typography, layout, icon but are Tailwind-class strings;
    // we still apply our base CSS vars defined above.
    applyCssVars(theme === 'dark' ? darkVars : lightVars)
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('theme', theme) } catch (e) {}
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, tokens }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export default ThemeProvider
