/**
 * i18n.jsx
 * Lightweight in-app internationalization provider.
 *
 * Thought process:
 * - Keep translations local and simple for this demo app to avoid adding a heavy
 *   dependency. This makes it easy to edit or add languages inline.
 * - Persist user's chosen locale to localStorage so the preference survives reloads.
 * - Export `useTranslation()` so components can pull `t()` and `locale` directly.
 */
import React, { createContext, useContext, useEffect, useState } from 'react'

const TRANSLATIONS = {
  en: {
    title: 'Instant Weather',
    search_placeholder: 'Search city (e.g. London, New York)',
    search_button: 'Search',
    loading: 'Loading...',
    hourly: 'Hourly',
    daily_forecast: '7-Day Forecast',
    save_location: 'Save',
    saved_locations: 'Saved',
    open: 'Open',
    remove: 'Remove',
    day: 'Day',
    night: 'Night',
    wind: 'Wind',
    removed: 'Removed',
    not_found: 'City not found',
    error_fetch: 'Failed to fetch weather',
    fun_fact: 'Fun Fact',
    no_fact: 'No fun fact found for this location.',
  },
  es: {
    title: 'Tiempo Instantáneo',
    search_placeholder: 'Buscar ciudad (p. ej. Londres, Nueva York)',
    search_button: 'Buscar',
    loading: 'Cargando...',
    hourly: 'Por hora',
    daily_forecast: 'Pronóstico 7 días',
    save_location: 'Guardar',
    saved_locations: 'Guardadas',
    open: 'Abrir',
    remove: 'Eliminar',
    day: 'Día',
    night: 'Noche',
    wind: 'Viento',
    removed: 'Eliminado',
    not_found: 'Ciudad no encontrada',
    error_fetch: 'Error al obtener el clima',
    fun_fact: 'Dato curioso',
    no_fact: 'No se encontró un dato curioso para este lugar.',
  },
  ca: {
    title: 'Temps Instantani',
    search_placeholder: 'Cerca ciutat (p. ex. Londres, Nova York)',
    search_button: 'Cerca',
    loading: 'Carregant...',
    hourly: 'Per hora',
    daily_forecast: 'Previsió 7 dies',
    save_location: 'Desa',
    saved_locations: 'Desades',
    open: 'Obrir',
    remove: 'Elimina',
    day: 'Dia',
    night: 'Nit',
    wind: 'Vent',
    removed: 'Eliminat',
    not_found: 'Ciutat no trobada',
    error_fetch: 'Error en obtenir el temps',
    fun_fact: 'Curiositat',
    no_fact: 'No s’ha trobat cap curiositat per aquest lloc.',
  },
  pt: {
    title: 'Clima Instantâneo',
    search_placeholder: 'Pesquisar cidade (ex. Londres, Nova Iorque)',
    search_button: 'Pesquisar',
    loading: 'Carregando...',
    hourly: 'Por hora',
    daily_forecast: 'Previsão 7 dias',
    save_location: 'Salvar',
    saved_locations: 'Salvas',
    open: 'Abrir',
    remove: 'Remover',
    day: 'Dia',
    night: 'Noite',
    wind: 'Vento',
    removed: 'Removido',
    not_found: 'Cidade não encontrada',
    error_fetch: 'Falha ao obter o clima',
    fun_fact: 'Curiosidade',
    no_fact: 'Nenhuma curiosidade encontrada para este local.',
  }
}

const I18nContext = createContext({ locale: 'en', setLocale: () => {}, t: (k) => k })

export function I18nProvider({ children, defaultLocale = 'en' }) {
  const [locale, setLocale] = useState(defaultLocale)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale')
      if (saved) setLocale(saved)
    } catch (e) {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('locale', locale) } catch (e) {}
  }, [locale])

  function t(key) {
    return (TRANSLATIONS[locale] && TRANSLATIONS[locale][key]) || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}

export default I18nContext
