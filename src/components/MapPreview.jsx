import React, { useState, useEffect, useRef } from 'react'

export default function MapPreview({ lat, lon, name }) {
  const containerRef = useRef(null)
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!lat || !lon) return

    function buildUrl(width, height, dpr = 1) {
      // Yandex static map expects size as "W,H"; cap to a reasonable max
      const w = Math.min(1200, Math.max(200, Math.round(width * dpr)))
      const h = Math.min(800, Math.max(120, Math.round(height * dpr)))
      // Allow overriding map provider base via Vite env var. Also allow an
      // optional image CDN base that will proxy/cache images. If a CDN base
      // is provided, we will append the full provider URL as a `u` query
      // parameter; the CDN must support this convention.
      const providerBase = import.meta.env.VITE_MAP_PROVIDER_BASE || 'https://static-maps.yandex.ru/1.x/'
      const providerUrl = `${providerBase}?lang=en-US&ll=${lon},${lat}&z=10&size=${w},${h}&l=map&pt=${lon},${lat},pm2rdm`
      const cdnBase = import.meta.env.VITE_IMAGE_CDN_BASE
      if (cdnBase) {
        // Caller can configure a CDN that accepts `u` query param for remote
        // fetch-and-cache. Example CDN URL: `https://my-cdn.example/fetch?u=`.
        return `${cdnBase}${cdnBase.includes('?') ? '&' : '?'}u=${encodeURIComponent(providerUrl)}`
      }
      return providerUrl
    }

    function updateSrc() {
      // Prefer container width if available, otherwise use viewport width
      const containerWidth = containerRef.current ? Math.floor(containerRef.current.clientWidth) : Math.floor(window.innerWidth * 0.9)
      const aspect = 450 / 200 // original approx ratio
      const width = containerWidth
      const height = Math.round(width / aspect)
      const dpr = typeof window !== 'undefined' ? Math.max(1, Math.floor(window.devicePixelRatio || 1)) : 1
      // build both 1x and 2x sources for high-DPR devices
      const src1 = buildUrl(width, height, 1)
      const src2 = buildUrl(width, height, Math.min(2, Math.max(1, Math.floor(window.devicePixelRatio || 1))))
      setSrc({ src1, src2 })
    }

    updateSrc()
    // update on resize with a small debounce
    let t
    function onResize() {
      clearTimeout(t)
      t = setTimeout(updateSrc, 120)
    }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
  }, [lat, lon])

  if (!lat || !lon) return null

  return (
    <div ref={containerRef} className="mt-4 rounded-lg overflow-hidden shadow">
      {/* use loading=lazy and provide srcset for DPR-aware images */}
      <img
        src={src ? src.src1 : ''}
        srcSet={src ? `${src.src1} 1x, ${src.src2} 2x` : undefined}
        alt={`Map of ${name}`}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    </div>
  )
}
