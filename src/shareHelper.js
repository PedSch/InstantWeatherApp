export async function shareText({ text, push, t, navigatorOverride } = {}) {
  const nav = navigatorOverride || (typeof navigator !== 'undefined' ? navigator : undefined)
  try {
    if (nav && nav.share) {
      await nav.share({ title: 'Weather & Fun Fact', text, url: (typeof window !== 'undefined' && window.location) ? window.location.href : undefined })
      return { status: 'shared' }
    } else if (nav && nav.clipboard && nav.clipboard.writeText) {
      try {
        await nav.clipboard.writeText(text)
        if (push && t) push(t('copied_clipboard'))
        return { status: 'copied' }
      } catch (err) {
        if (push && t) push(t('copy_failed'))
        return { status: 'copy-failed', error: err }
      }
    } else {
      if (push && t) push(t('share_unavailable'))
      return { status: 'unavailable' }
    }
  } catch (err) {
    const name = err && err.name ? err.name : ''
    const msg = err && err.message ? err.message.toLowerCase() : ''
    if (name === 'AbortError' || msg.includes('abort') || msg.includes('cancel')) {
      if (push && t) push(t('share_canceled'))
      return { status: 'canceled' }
    }
    if (push && t) push(t('share_failed'))
    return { status: 'failed', error: err }
  }
}

export default shareText
