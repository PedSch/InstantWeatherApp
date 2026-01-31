import React from 'react'
import { useTranslation } from '../i18n.jsx'

// Simple accessible spinner using Tailwind classes
export default function LoadingSpinner({ size = 2 }) {
  const { t } = useTranslation()
  const px = `${size}rem`
  return (
    <div role="status" className="flex justify-center">
      <svg
        aria-hidden="true"
        className={`animate-spin text-sky-500`}
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: px, height: px }}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-30" />
        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" />
      </svg>
      <span className="sr-only">{t('loading')}</span>
    </div>
  )
}
