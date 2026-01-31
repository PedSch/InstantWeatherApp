import React from 'react'
import { useToast } from '../ToastContext'
import { useTranslation } from '../i18n.jsx'
import { shareText } from '../shareHelper'

export default function ShareButton({ text }) {
  const { push } = useToast()
  const { t } = useTranslation()

  async function handleShare() {
    await shareText({ text, push, t })
  }
  return (
    <button
      className="px-3 py-1 rounded bg-indigo-600 text-white text-sm shadow ml-2"
      onClick={handleShare}
      title="Share"
    >
      Share
    </button>
  )
}
