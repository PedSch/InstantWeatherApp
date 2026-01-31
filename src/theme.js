import React from 'react'

// Theme toggle helper (light/dark)
export function setTheme(mode) {
  // Toggle class on the <body> so our CSS rules (body.dark) apply correctly
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.toggle('dark', mode === 'dark')
  }
  try { localStorage.setItem('theme', mode) } catch (e) {}
}

export function getTheme() {
  try {
    return localStorage.getItem('theme') || 'light'
  } catch (e) {
    return 'light'
  }
}

export function useTheme() {
  // Simple React hook for theme
  const [theme, setThemeState] = React.useState(getTheme())
  React.useEffect(() => {
    setTheme(theme)
  }, [theme])
  return [theme, setThemeState]
}
