const CACHE_NAME = 'dholilo-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://img.icons8.com/color/512/bot.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Only cache successful GET requests from our own origin or specific CDNs
          if (event.request.method === 'GET' && (fetchResponse.status === 200 || fetchResponse.status === 0)) {
             // We don't cache everything to avoid quota issues
          }
          return fetchResponse;
        });
      });
    })
  );
});
