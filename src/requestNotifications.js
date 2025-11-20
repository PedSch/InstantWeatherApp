export async function requestNotifications({ push, t, navigatorOverride } = {}) {
  const nav = navigatorOverride || (typeof navigator !== 'undefined' ? navigator : undefined)
  if (!nav || typeof Notification === 'undefined') {
    if (push) push(t('notification_not_supported'))
    return { status: 'not-supported' }
  }

  try {
    const current = Notification.permission
    if (current === 'granted') {
      if (push) push(t('request_notifications_granted'))
      return { status: 'granted' }
    }

    // requestPermission returns a Promise in modern browsers
    const perm = await (Notification.requestPermission ? Notification.requestPermission() : Promise.resolve(current))
    if (perm === 'granted') {
      if (push) push(t('request_notifications_granted'))
      return { status: 'granted' }
    } else if (perm === 'denied') {
      if (push) push(t('request_notifications_denied'))
      return { status: 'denied' }
    } else {
      if (push) push(t('request_notifications_default'))
      return { status: 'default' }
    }
  } catch (err) {
    if (push) push(t('notification_unavailable'))
    return { status: 'error', error: err }
  }
}

export default requestNotifications
