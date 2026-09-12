// Shanu Atelier LK - Service Worker
const CACHE_NAME = 'shanu-atelier-v1';
const STATIC_ASSETS = [
  './admin.html',
  './manifest.json',
  './shanu_atelier_official_logo.png',
  './shanu_atelier_monogram_crest.png',
  './shanu_atelier_signature_emblem.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first for data and dynamic HTML, fallback to cache
  if (event.request.mode === 'navigate' || event.request.url.includes('admin.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request) || caches.match('./admin.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
