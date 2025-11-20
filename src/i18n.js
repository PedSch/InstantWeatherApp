import React, { createContext, useContext, useEffect, useState } from 'react'

const TRANSLATIONS = {
  en: {
    title: 'ACTIVO Weather',
    search_placeholder: 'Search city (e.g. London, New York)',
    search_button: 'Search',
    loading: 'Loading...',
    hourly: 'Hourly',
    daily_forecast: '7-Day Forecast',
    save_location: 'Save',
    saved_locations: 'Saved',
    remove: 'Remove',
    day: 'Day',
    night: 'Night',
    wind: 'Wind',
    not_found: 'City not found',
    error_fetch: 'Failed to fetch weather',
  },
  es: {
    title: 'ACTIVO Weather',
    search_placeholder: 'Buscar ciudad (p. ej. Londres, Nueva York)',
    search_button: 'Buscar',
    loading: 'Cargando...',
    hourly: 'Por hora',
    daily_forecast: 'Pronóstico 7 días',
    save_location: 'Guardar',
    saved_locations: 'Guardadas',
    remove: 'Eliminar',
    day: 'Día',
    night: 'Noche',
    wind: 'Viento',
    not_found: 'Ciudad no encontrada',
    error_fetch: 'Error al obtener el clima',
  },
  ca: {
    title: 'ACTIVO Weather',
    search_placeholder: 'Cerca ciutat (p. ex. Londres, Nova York)',
    search_button: 'Cerca',
    loading: 'Carregant...',
    hourly: 'Per hora',
    daily_forecast: 'Previsió 7 dies',
    save_location: 'Desa',
    saved_locations: 'Desades',
    remove: 'Elimina',
    day: 'Dia',
    night: 'Nit',
    wind: 'Vent',
    not_found: 'Ciutat no trobada',
    error_fetch: 'Error en obtenir el temps',
  },
  pt: {
    title: 'ACTIVO Weather',
    search_placeholder: 'Pesquisar cidade (ex. Londres, Nova Iorque)',
    search_button: 'Pesquisar',
    loading: 'Carregando...',
    hourly: 'Por hora',
    daily_forecast: 'Previsão 7 dias',
    save_location: 'Salvar',
    saved_locations: 'Salvas',
    remove: 'Remover',
    day: 'Dia',
    night: 'Noite',
    wind: 'Vento',
    not_found: 'Cidade não encontrada',
    error_fetch: 'Falha ao obter o clima',
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

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, setLocale, t } },
    children
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}

export default I18nContext
