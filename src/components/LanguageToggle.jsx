import React from 'react'
import { useTranslation } from '../i18n.jsx'

export default function LanguageToggle() {
  const { locale, setLocale } = useTranslation()
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-sky-600 text-white' : 'bg-white/60'}`}
        aria-pressed={locale === 'en'}
      >EN</button>
      <button
        onClick={() => setLocale('es')}
        className={`px-2 py-1 rounded ${locale === 'es' ? 'bg-sky-600 text-white' : 'bg-white/60'}`}
        aria-pressed={locale === 'es'}
      >ES</button>
      <button
        onClick={() => setLocale('ca')}
        className={`px-2 py-1 rounded ${locale === 'ca' ? 'bg-sky-600 text-white' : 'bg-white/60'}`}
        aria-pressed={locale === 'ca'}
      >CA</button>
      <button
        onClick={() => setLocale('pt')}
        className={`px-2 py-1 rounded ${locale === 'pt' ? 'bg-sky-600 text-white' : 'bg-white/60'}`}
        aria-pressed={locale === 'pt'}
      >PT</button>
    </div>
  )
}
