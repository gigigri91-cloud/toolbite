const CACHE_NAME = 'toolbite-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/assets/css/tailwind.min.css',
  '/assets/css/global.min.css',
  '/assets/js/main.min.js',
  '/assets/images/toolbite-logo.webp',
  '/assets/images/favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Optionally cache new successful responses here if they are local
        return fetchResponse;
      });
    }).catch(() => {
      // Offline fallback for HTML pages
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('/index.html');
      }
    })
  );
});
