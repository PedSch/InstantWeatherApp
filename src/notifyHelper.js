export async function notifyWeatherHelper({ weather, unit, t, push, native }) {
  if (!weather) return
  try {
    const title = `${weather.name}`
    const cond = `${Math.round(weather.temp)}°${unit} • ${weather.is_day ? t('day') : t('night')}`
    const mod = native || (await import('./native.js'))
    const res = await mod.scheduleLocalNotification({ title: `Weather — ${title}`, body: cond })
    let msg = t('notification_unavailable')
    if (res && res.platform === 'capacitor') msg = t('notification_scheduled_native')
    else if (res && res.platform === 'web') {
      if (res.reason === 'permission-denied') msg = t('notification_permission_denied')
      else if (res.reason === 'send-failed') msg = t('notification_send_failed')
      else msg = t('notification_sent_web')
    } else {
      if (res && res.reason === 'permission-denied') msg = t('notification_permission_denied')
      else if (res && res.reason === 'not-supported') msg = t('notification_not_supported')
      else msg = t('notification_unavailable')
    }
    push(msg)
    return res
  } catch (e) {
    // fallback: show generic message
    try { push(t('notification_unavailable')) } catch (err) {}
    return { platform: 'none', reason: 'error' }
  }
}

export default notifyWeatherHelper
