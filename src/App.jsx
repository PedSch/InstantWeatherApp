/**
 * App.jsx
 * Main application container and orchestrator.
 * Composition + layout; data and fetch logic live in hooks and services.
 */
import React, { useState, useEffect, useRef } from 'react'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import MapPreview from './components/MapPreview'
import ShareButton from './components/ShareButton'
import LoadingSpinner from './components/LoadingSpinner'
import HourlyForecast from './components/HourlyForecast'
import DailyForecast from './components/DailyForecast'
import UnitToggle from './components/UnitToggle'
import { I18nProvider, useTranslation } from './i18n.jsx'
import { ToastProvider, useToast } from './ToastContext'
import ThemeProvider from './theme/ThemeProvider'
import { fetchFunFact } from './funFact.js'
import { fetchTrivia } from './trivia.js'
import FocusTrap from 'focus-trap-react'
import LanguageToggle from './components/LanguageToggle'
import ThemeToggle from './components/ThemeToggle'
import SavedLocations from './components/SavedLocations'
import IosNotificationHint from './components/IosNotificationHint'
import requestNotifications from './requestNotifications'
import Container from './components/ui/Container'
import Card from './components/ui/Card'
import { useWeather } from './hooks/useWeather'
import { useSavedLocations } from './hooks/useSavedLocations'

function InnerApp() {
  return <AppContent />
}

function AppContent() {
  const { t } = useTranslation()
  const { push } = useToast()
  const { weather, hourly, daily, loading, error, search, fetchByCoordinates } = useWeather()
  const { saved, addLocation, removeLocation } = useSavedLocations()
  const [unit, setUnit] = useState(() => {
    try {
      return localStorage.getItem('unit') || 'C'
    } catch (e) {
      return 'C'
    }
  })
  const [funFact, setFunFact] = useState(null)
  const [trivia, setTrivia] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [triviaQueue, setTriviaQueue] = useState([])
  const [showGeoPrompt, setShowGeoPrompt] = useState(false)
  const [showSavedDrawer, setShowSavedDrawer] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)
  const closeBtnRef = useRef(null)
  const headerRef = useRef(null)
  const [headerDimmed, setHeaderDimmed] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('unit', unit) } catch (e) {}
  }, [unit])

  // On mount: ask for geolocation permission with custom message
  useEffect(() => {
    if (!navigator || !navigator.geolocation) return
    // Show a small CODEWITHDRO banner (UI) if not yet prompted. We won't auto-display results
    // until the user accepts browser permission. This keeps behavior explicit.
    // We track a flag so we don't spam the user every reload.
    const prompted = localStorage.getItem('geo_prompted')
    if (!prompted) {
      // show a small in-app prompt (rendered below) by setting state
      setShowGeoPrompt(true)
    }
  }, [])

  function handleSearch(city) {
    setFunFact(null)
    search(city)
  }

  function handleFetchByCoords(lat, lon, displayName = 'Current Location', country = '') {
    setFunFact(null)
    fetchByCoordinates(lat, lon, displayName, country)
  }

  useEffect(() => {
    if (weather) {
      fetchFunFact(weather.name, weather.country).then(fact => setFunFact(fact))
    }
  }, [weather?.name, weather?.country])

  function handleAllowGeo() {
    setShowGeoPrompt(false)
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          handleFetchByCoords(latitude, longitude, 'Your Location', '')
        },
        (err) => {
          push(t('geo_denied'))
        },
        { maximumAge: 1000 * 60 * 5 }
      )
    } catch (e) {
      // ignore
    }
    localStorage.setItem('geo_prompted', '1')
  }

  function handleDeclineGeo() {
    setShowGeoPrompt(false)
    localStorage.setItem('geo_prompted', '1')
  }

  function saveLocation(name) {
    if (!name || !weather) return
    const entry = { name: weather.name || name, country: weather.country, lat: weather.lat, lon: weather.lon, temp: weather.temp, weathercode: weather.weathercode, is_day: weather.is_day }
    addLocation(entry)
    push(`${t('save_location')}: ${entry.name}`)
  }

  function removeSavedLocation(name) {
    removeLocation(name)
    push(`${t('removed')}: ${name}`)
  }

  // When a location loads, auto-load a trivia question
  useEffect(() => {
    let mounted = true
    if (weather) {
      setShowAnswer(false)
      // fetch a trivia question asynchronously
      // preload 3 trivia questions and set the first one
      fetchTrivia(3).then(qs => {
        if (!mounted) return
        if (Array.isArray(qs) && qs.length > 0) {
          setTrivia(qs[0])
          setTriviaQueue(qs.slice(1))
        } else if (qs) {
          setTrivia(qs)
          setTriviaQueue([])
        }
      }).catch(() => {})
    }
    return () => { mounted = false }
  }, [weather])

  // When drawer opens: focus the close button and let focus-trap handle tab/escape
  useEffect(() => {
    if (!drawerOpen) return
    try { closeBtnRef.current && closeBtnRef.current.focus() } catch (e) {}
  }, [drawerOpen])

  // Auto-scroll drawer to top and trigger inner element animations when opening
  useEffect(() => {
    if (!drawerOpen) return
    const inner = drawerRef.current && drawerRef.current.querySelector('.drawer-inner')
    if (inner) {
      inner.scrollTop = 0
      // add an 'enter' class to animate children, then remove after animation
      inner.classList.add('entering')
      const t = setTimeout(() => inner.classList.remove('entering'), 420)
      return () => clearTimeout(t)
    }
  }, [drawerOpen])

  // Dim the header when the user scrolls to avoid overlap visibility
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || window.pageYOffset
      setHeaderDimmed(y > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Notify current weather via native/local notifications or Web Notification
  async function notifyWeather() {
    // delegate to notify helper for mapping and push
    try {
      const { default: notifyWeatherHelper } = await import('./notifyHelper')
      await notifyWeatherHelper({ weather, unit, t, push })
    } catch (e) {
      // ignore
    }
  }

  async function handleRequestNotifications() {
    try {
      const res = await requestNotifications({ push, t })
      return res
    } catch (e) {
      // ignore
    }
  }


  return (
    <React.Fragment>
      <header ref={headerRef} className={`header-blur fixed top-0 left-0 w-full z-10 py-2 sm:py-3 ${headerDimmed ? 'header-dim' : ''}`}>
        <Container className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="font-bold text-xl tracking-tight whitespace-nowrap">{t('title')}</span>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap header-controls">
            <span className="hidden sm:inline-flex"><ThemeToggle /></span>
            <LanguageToggle />
          </div>
        </Container>
      </header>

      <div className="min-h-screen bg-slate-50 main-content-padding">
        <Container>
          <div className="w-full max-w-6xl mx-auto flex gap-6 flex-col md:flex-row">
          {/* Left sidebar with saved locations */}
          <aside className="hidden md:block w-72">
            <div className="card glass mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">{t('saved_locations')}</h2>
              </div>
              <SavedLocations items={saved} onSelect={(it) => {
                if (it && it.lat && it.lon) handleFetchByCoords(it.lat, it.lon, it.name, it.country)
                else handleSearch(it.name)
              }} onRemove={removeSavedLocation} />
            </div>
          </aside>
          {/* Mobile saved locations drawer toggle */}
          <div className="md:hidden w-full mb-2">
            <div className="flex items-center justify-end">
              <button className="px-3 py-2 rounded bg-sky-600 text-white text-sm" onClick={() => { setShowSavedDrawer(true); setTimeout(() => setDrawerOpen(true), 20) }}>
                {t('saved_locations')}
              </button>
            </div>
          </div>
          {/* Geo permission banner */}
                {showGeoPrompt && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-white/90 backdrop-blur rounded-lg px-5 py-4 shadow-md flex items-center gap-5">
                <div className="text-sm">{t('geo_prompt')}</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded bg-sky-600 text-white text-sm" onClick={handleAllowGeo}>{t('geo_allow')}</button>
                  <button className="px-3 py-1 rounded bg-white border" onClick={handleDeclineGeo}>{t('geo_deny')}</button>
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 max-w-3xl">
            <Card className="glass p-6">
              <div className="flex items-center justify-end sm:justify-between mb-4">
                <h1 className="hidden sm:block text-2xl font-semibold tracking-tight">{t('title')}</h1>
                <div className="flex items-center gap-1 sm:gap-2">
                  <ThemeToggle />
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <LanguageToggle />
                    <UnitToggle unit={unit} setUnit={setUnit} />
                  </div>
                </div>
              </div>

              <SearchBar onSearch={handleSearch} placeholder={t('search_placeholder')} buttonText={t('search_button')} />

              <div className="mt-8">
                {loading && (
                  <div className="py-12">
                    <LoadingSpinner />
                  </div>
                )}
                {error && (
                  <div className="py-4 bg-red-50 border border-red-100 text-red-700 rounded-md text-center">{t(error)}</div>
                )}
                {/* Only show weather/fact if a location is selected/searched */}
                {weather ? (
                  <div>
                    <div className="flex items-center justify-end gap-3 mb-5 flex-wrap">
                      <button onClick={() => saveLocation(weather.name)} className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm shadow">{t('save_location')}</button>
                      <button onClick={() => notifyWeather()} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm shadow">{t('notify')}</button>
                      <button onClick={() => handleRequestNotifications()} className="px-3 py-1 rounded bg-amber-500 text-white text-sm shadow">{t('request_notifications')}</button>
                      <ShareButton text={`${weather.name}, ${weather.country}: ${Math.round(weather.temp)}°${unit}. ${funFact ? funFact : ''}`}/>
                    </div>
                    <WeatherCard data={weather} unit={unit} />
                    <MapPreview lat={weather.lat} lon={weather.lon} name={weather.name} />
                    <div className="mt-6 p-5 sm:p-6 rounded-xl bg-white/70 shadow text-slate-700">
                      <div className="font-semibold mb-2">{t('fun_fact')}</div>
                      <div className="text-sm leading-relaxed">{funFact ? funFact : t('no_fact')}</div>
                    </div>
                    <IosNotificationHint show={typeof window !== 'undefined' && (typeof Notification === 'undefined' || Notification.permission === 'denied')} />
                    {/* Trivia panel */}
                    <div className="mt-6 p-5 sm:p-6 rounded-xl bg-white/70 shadow text-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold">{t('trivia')}</div>
                          <div className="text-xs text-slate-500">{trivia && `${trivia.category} • ${trivia.difficulty}`}</div>
                        </div>
                      {trivia ? (
                        <div>
                          <div className="text-sm mb-3 leading-relaxed">{trivia.question}</div>
                          <div className="flex flex-col gap-3">
                            {trivia.choices.map((c, i) => (
                              <button key={i} className={`text-left px-4 py-2.5 rounded-lg ${showAnswer && c === trivia.correct ? 'bg-emerald-100' : 'bg-white/60'}`} onClick={() => setShowAnswer(true)}>
                                {c}
                              </button>
                            ))}
                          </div>
                          {showAnswer && (
                            <div className="mt-3 text-sm text-slate-700">{t('answer')}: <strong>{trivia.correct}</strong></div>
                          )}
                          <div className="mt-4 flex gap-3">
                            <button className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm" onClick={async () => {
                              setShowAnswer(false)
                              if (triviaQueue && triviaQueue.length > 0) {
                                const next = triviaQueue[0]
                                setTrivia(next)
                                setTriviaQueue(triviaQueue.slice(1))
                                return
                              }
                              const qs = await fetchTrivia(3)
                              if (qs && Array.isArray(qs) && qs.length > 0) {
                                setTrivia(qs[0])
                                setTriviaQueue(qs.slice(1))
                              } else if (qs) {
                                setTrivia(qs)
                                setTriviaQueue([])
                              }
                            }}>{t('new')}</button>
                            <ShareButton text={trivia.question + ' — ' + t('answer') + ': ' + trivia.correct} />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">{t('no_trivia')}. <button className="underline" onClick={async () => { const q = await fetchTrivia(); if (q) setTrivia(q); }}>{t('load_trivia')}</button></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-12 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold mb-2 text-slate-700">{t('welcome_title')}</div>
                    <div className="text-lg mb-4">{t('welcome_subtitle')}</div>
                    <div className="max-w-md w-full">
                      <SearchBar onSearch={handleSearch} placeholder={t('search_placeholder')} buttonText={t('search_button')} />
                    </div>
                  </div>
                )}
                {hourly && weather && (
                  <div className="mt-8">
                    <HourlyForecast data={hourly} unit={unit} />
                  </div>
                )}
                {daily && weather && (
                  <div className="mt-8">
                    <DailyForecast data={daily} unit={unit} />
                  </div>
                )}
              </div>
            </Card>
          </main>

          {/* Toasts are rendered by ToastProvider/ToastContainer */}

          {/* Mobile saved locations drawer */}
        {showSavedDrawer && (
          <div className="fixed inset-0 z-50">
            <div className={`fixed inset-0 backdrop-fade ${drawerOpen ? 'open' : ''}`} onClick={() => { setDrawerOpen(false); setTimeout(() => setShowSavedDrawer(false), 320) }} />
            <FocusTrap active={drawerOpen} focusTrapOptions={{ onDeactivate: () => { setDrawerOpen(false); setTimeout(() => setShowSavedDrawer(false), 320) }, clickOutsideDeactivates: true, escapeDeactivates: true }}>
              <div ref={drawerRef} className={`drawer-panel fixed right-0 top-0 h-full w-80 bg-white p-4 overflow-auto ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="saved-drawer-title">
                <div className="flex items-center justify-between mb-4">
                  <h3 id="saved-drawer-title" className="font-semibold">{t('saved_locations')}</h3>
                  <button ref={closeBtnRef} className="px-3 py-2 rounded-lg hover:bg-slate-100" onClick={() => { setDrawerOpen(false); setTimeout(() => setShowSavedDrawer(false), 320) }}>{t('close')}</button>
                </div>
                <div className="drawer-inner">
                  <SavedLocations items={saved} onSelect={(it) => {
                    setDrawerOpen(false)
                setTimeout(() => setShowSavedDrawer(false), 320)
                if (it && it.lat && it.lon) handleFetchByCoords(it.lat, it.lon, it.name, it.country)
                else handleSearch(it.name)
                }} onRemove={removeSavedLocation} />
              </div>
            </div>
          </FocusTrap>
          </div>
        )}
        </div>
        </Container>
        <footer className="footer-blur fixed bottom-0 left-0 w-full z-10 py-3 px-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {t('title')}
        </footer>
      </div>
    </React.Fragment>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ToastProvider>
          <InnerApp />
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}
