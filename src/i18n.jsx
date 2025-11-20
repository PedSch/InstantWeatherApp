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
    title: 'ACTIVO Weather',
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
    trivia: 'Trivia',
    load_trivia: 'Load a trivia question',
    no_trivia: 'No trivia loaded',
    answer: 'Answer',
    new: 'New',
    no_saved_locations: 'No saved locations yet.',
    no_saved_hint: 'Search a city and press "Save" to save it here.',
    geo_prompt: 'CODEWITHDRO requests your location to show local weather.',
    geo_allow: 'Allow',
    geo_deny: 'No thanks',
    close: 'Close',
    welcome_title: '🌤️ Welcome to ACTIVO Weather!',
    welcome_subtitle: 'Search for any city or select a saved location to see weather, fun facts, and more.',
    notify: 'Notify',
    share: 'Share'
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
    trivia: 'Trivia',
    load_trivia: 'Cargar una pregunta de trivia',
    no_trivia: 'No hay trivia cargada',
    answer: 'Respuesta',
    new: 'Nuevo',
    no_saved_locations: 'No hay ubicaciones guardadas aún.',
    no_saved_hint: 'Busca una ciudad y presiona "Guardar" para guardarla aquí.',
    geo_prompt: 'CODEWITHDRO solicita tu ubicación para mostrar el clima local.',
    geo_allow: 'Permitir',
    geo_deny: 'No, gracias',
    close: 'Cerrar',
    welcome_title: '🌤️ ¡Bienvenido a ACTIVO Weather!',
    welcome_subtitle: 'Busca cualquier ciudad o selecciona una ubicación guardada para ver el clima, datos curiosos y más.',
    notify: 'Notificar',
    share: 'Compartir'
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
    trivia: 'Trivia',
    load_trivia: 'Carregar una pregunta de trivia',
    no_trivia: 'No hi ha trivia carregada',
    answer: 'Resposta',
    new: 'Nou',
    no_saved_locations: 'No hi ha ubicacions desades encara.',
    no_saved_hint: 'Cerca una ciutat i prem "Desa" per desar-la aquí.',
    geo_prompt: 'CODEWITHDRO sol·licita la teva ubicació per mostrar el temps local.',
    geo_allow: 'Permetre',
    geo_deny: 'No gràcies',
    close: 'Tancar',
    welcome_title: '🌤️ Benvingut a ACTIVO Weather!',
    welcome_subtitle: 'Cerca qualsevol ciutat o selecciona una ubicació desada per veure el temps, curiositats i més.',
    notify: 'Notificar',
    share: 'Comparteix'
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
    trivia: 'Trivia',
    load_trivia: 'Carregar uma pergunta de trivia',
    no_trivia: 'Nenhuma trivia carregada',
    answer: 'Resposta',
    new: 'Nova',
    no_saved_locations: 'Nenhum local salvo ainda.',
    no_saved_hint: 'Pesquise uma cidade e pressione "Salvar" para salvá-la aqui.',
    geo_prompt: 'CODEWITHDRO solicita sua localização para mostrar o clima local.',
    geo_allow: 'Permitir',
    geo_deny: 'Não, obrigado',
    close: 'Fechar',
    welcome_title: '🌤️ Bem-vindo ao ACTIVO Weather!',
    welcome_subtitle: 'Pesquise qualquer cidade ou selecione um local salvo para ver o clima, curiosidades e mais.',
    notify: 'Notificar',
    share: 'Compartilhar'
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
