const CACHE_NAME = 'toolbite-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/categories/text-tools.html',
  '/categories/developer-tools.html',
  '/categories/image-tools.html',
  '/categories/seo-tools.html',
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
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-first for CSS and JS — always get fresh styles/scripts
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else (images, HTML)
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
