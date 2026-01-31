export async function notifyWeatherHelper({ weather, unit, t, push, native }) {
  if (!weather) return
  try {
    const title = `${weather.name}`
    const cond = `${Math.round(weather.temp)}°${unit} • ${weather.is_day ? t('day') : t('night')}`
    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined'

    // Quick capability checks for web environments
    if (isBrowser) {
      if (!('Notification' in window) && !('serviceWorker' in navigator)) {
        push(t('notification_not_supported'))
        return { platform: 'none', reason: 'not-supported' }
      }
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        push(t('notification_permission_denied'))
        return { platform: 'web', reason: 'permission-denied' }
      }
    }

    // Prefer native/local-capable module (Capacitor) if present
    let res = null
    try {
      const mod = native || (await import('./native.js'))
      if (mod && mod.scheduleLocalNotification) {
        res = await mod.scheduleLocalNotification({ title: `Weather — ${title}`, body: cond })
      }
    } catch (e) {
      // continue to web fallback
      res = null
    }
    // Interpret native result when available
    if (res && res.platform === 'capacitor') {
      const msg = t('notification_scheduled_native')
      push(msg)
      return res
    }

    // If native module returned a web-result, honor it (tests inject this behavior).
    if (res && res.platform === 'web') {
      if (res.reason === 'permission-denied') {
        push(t('notification_permission_denied'))
        return res
      }
      if (res.reason === 'send-failed' || res.reason === 'send_failed') {
        push(t('notification_send_failed'))
        return res
      }
      // default: treat as sent
      push(t('notification_sent_web'))
      return res
    }

    // If native provided a web result or none, attempt a web notification fallback
    try {
      if (isBrowser) {
        // Request permission if needed (user-initiated click context)
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          try {
            const perm = await Notification.requestPermission()
            if (perm === 'denied') {
              push(t('notification_permission_denied'))
              return { platform: 'web', reason: 'permission-denied' }
            }
          } catch (e) {
            // ignore request errors
          }
        }

        // Use Service Worker showNotification if available
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg && reg.showNotification) {
            try {
              await reg.showNotification(`Weather — ${title}`, { body: cond })
              push(t('notification_sent_web'))
              return { platform: 'web', reason: 'sent' }
            } catch (e) {
              // fallthrough to Notification constructor
            }
          }
        }

        // Fallback to the Notification constructor (if permitted)
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            // eslint-disable-next-line no-new
            new Notification(`Weather — ${title}`, { body: cond })
            push(t('notification_sent_web'))
            return { platform: 'web', reason: 'sent' }
          } catch (e) {
            push(t('notification_send_failed'))
            return { platform: 'web', reason: 'send-failed' }
          }
        }
      }

      // If we reach here, notifications are not supported
      push(t('notification_not_supported'))
      return { platform: 'none', reason: 'not-supported' }
    } catch (e) {
      push(t('notification_unavailable'))
      return { platform: 'none', reason: 'error' }
    }
  } catch (e) {
    // fallback: show generic message
    try { push(t('notification_unavailable')) } catch (err) {}
    return { platform: 'none', reason: 'error' }
  }
}

export default notifyWeatherHelper
