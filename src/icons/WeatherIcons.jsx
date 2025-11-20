import React from 'react'

function Sun({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="4.5" fill="#FFD24C" />
      <g stroke="#FFD24C" strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 1.75v2.5" />
        <path d="M12 19.75v2.5" />
        <path d="M4.22 4.22l1.77 1.77" />
        <path d="M17.01 17.01l1.77 1.77" />
        <path d="M1.75 12h2.5" />
        <path d="M19.75 12h2.5" />
        <path d="M4.22 19.78l1.77-1.77" />
        <path d="M17.01 6.99l1.77-1.77" />
      </g>
    </svg>
  )
}

function Cloud({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.75 1.75A3.5 3.5 0 007 18z" fill="#CBD5E1" />
    </svg>
  )
}

function Rain({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 13h10a4 4 0 000-8 5.5 5.5 0 00-10.75 1.75A3.5 3.5 0 007 13z" fill="#CBD5E1" />
      <g fill="#60A5FA">
        <path d="M9.2 17.5c-.5.9-.2 1.7.7 2.1.9.4 1.9 0 2.4-.9.5-.9.2-1.7-.7-2.1-.9-.4-1.9 0-2.4.9z" />
        <path d="M14.2 17.5c-.5.9-.2 1.7.7 2.1.9.4 1.9 0 2.4-.9.5-.9.2-1.7-.7-2.1-.9-.4-1.9 0-2.4.9z" />
      </g>
    </svg>
  )
}

function Snow({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 13h10a4 4 0 000-8 5.5 5.5 0 00-10.75 1.75A3.5 3.5 0 007 13z" fill="#E6EEF8" />
      <g stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15v3" />
        <path d="M10 16l4 0" />
        <path d="M11 14l2 2" />
      </g>
    </svg>
  )
}

function Thunder({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 13h10a4 4 0 000-8 5.5 5.5 0 00-10.75 1.75A3.5 3.5 0 007 13z" fill="#CBD5E1" />
      <path d="M13 11l-2 4h3l-2 5" fill="#FBBF24" />
    </svg>
  )
}

function Fog({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="10" width="18" height="2" rx="1" fill="#E6EEF8" />
      <rect x="3" y="14" width="12" height="2" rx="1" fill="#E6EEF8" />
      <path d="M7 13h10a4 4 0 000-8 5.5 5.5 0 00-10.75 1.75A3.5 3.5 0 007 13z" fill="#CBD5E1" />
    </svg>
  )
}

export function getIcon(code, isDay = 1, className = 'w-12 h-12') {
  // Map WMO codes to icon components
  if (code === 0) return <Sun className={className} />
  if (code === 1 || code === 2 || code === 3) return <Cloud className={className} />
  if ([45, 48].includes(code)) return <Fog className={className} />
  if ([51,53,55,56,57,61,63,65,80,81,82].includes(code)) return <Rain className={className} />
  if ([71,73,75,77,85,86].includes(code)) return <Snow className={className} />
  if ([95,96,99].includes(code)) return <Thunder className={className} />
  return <Cloud className={className} />
}

export default Sun
