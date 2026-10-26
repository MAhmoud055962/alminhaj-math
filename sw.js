// Service Worker for Offline Math Learning Platform (أ. محمود طلبه - مدارس المنهاج الأهلية)
const CACHE_NAME = 'math-platform-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './custom_styles.css',
  './05+T1.pdf',
  './05 T2.pdf',
  './04 T1.pdf',
  './04 T2.pdf',
  './48388266_2234368626597959_5695527694247133184_n.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[SW] Some assets could not be pre-cached:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // Cache dynamic assets on the fly if valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline if requesting html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
