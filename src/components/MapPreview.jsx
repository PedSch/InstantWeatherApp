import React from 'react'

export default function MapPreview({ lat, lon, name }) {
  if (!lat || !lon) return null
  // Use OpenStreetMap static image
  const url = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${lon},${lat}&z=10&size=450,200&l=map&pt=${lon},${lat},pm2rdm`
  return (
    <div className="mt-4 rounded-lg overflow-hidden shadow">
      <img src={url} alt={`Map of ${name}`} className="w-full h-48 object-cover" />
    </div>
  )
}
