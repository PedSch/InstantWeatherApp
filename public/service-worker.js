const CACHE_NAME = 'instant-weather-cache-v1';
const OFFLINE_URL = '/offline.html';

// Files to precache (keep minimal; Vite will copy public/ files automatically)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  OFFLINE_URL
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // For API requests prefer network but fallback to cache
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // For navigation, try network then cache then offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For other requests use cache-first
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
