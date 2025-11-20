// Native helpers: prefer Capacitor Local Notifications when running in native
// context, otherwise fall back to the Web Notifications API.
export async function scheduleLocalNotification({ id = 1, title = '', body = '', scheduleAt = null }) {
  // Try to use Capacitor Local Notifications via dynamic import executed at runtime
  try {
    const dynamicImport = new Function('id', 'return import(id)')
    const mod = await dynamicImport('@capacitor/local-notifications')
    if (mod && mod.LocalNotifications && typeof mod.LocalNotifications.schedule === 'function') {
      const schedule = scheduleAt ? { at: scheduleAt } : undefined
      await mod.LocalNotifications.schedule({ notifications: [{ id, title, body, schedule }] })
      return { platform: 'capacitor' }
    }
  } catch (e) {
    // Not running on native or plugin not installed — fall through to web API
  }

  // Web Notifications fallback
  try {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      if (Notification.permission === 'granted') {
        new Notification(title, { body })
        return { platform: 'web' }
      }
    }
  } catch (e) {}

  return { platform: 'none' }
}
