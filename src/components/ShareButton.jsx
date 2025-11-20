import React from 'react'

export default function ShareButton({ text }) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Weather & Fun Fact',
        text,
        url: window.location.href
      })
    } else {
      // fallback: copy to clipboard
      navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
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
