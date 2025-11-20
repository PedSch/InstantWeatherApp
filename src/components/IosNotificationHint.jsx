import React, { useEffect, useState } from 'react'
import { useTranslation } from '../i18n.jsx'

function isIosSafari() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isIOS = /iP(ad|hone|od)/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua)
  return isIOS && isSafari
}

export default function IosNotificationHint({ show }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return setVisible(false)
    if (isIosSafari()) setVisible(true)
    else setVisible(false)
  }, [show])

  if (!visible) return null
  return (
    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-amber-800 mt-3">
      <div className="font-semibold">{t('ios_notifications_hint_title')}</div>
      <div className="mt-1">{t('ios_notifications_hint_body')}</div>
      <div className="mt-2 text-xs underline cursor-pointer text-amber-700">{t('ios_notifications_hint_cta')}</div>
    </div>
  )
}
