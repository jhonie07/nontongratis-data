// Service Worker for Nonton Gratis
const CACHE_NAME = 'nontongratis-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/player.html',
  '/bookmarks.html',
  '/request.html',
  '/offline.html',
  '/assets/style.css',
  '/assets/script.js',
  '/assets/ads.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/og-image.jpg'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('📦 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Stale-While-Revalidate
self.addEventListener('fetch', event => {
  // Skip untuk request API atau analytics
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('dailymotion') ||
      event.request.url.includes('highperformanceformat') ||
      event.request.url.includes('profitablecpmrate')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update cache dengan response terbaru
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('📡 Fetch failed, returning cached version');
            // Jika fetch gagal dan tidak ada cache, tampilkan offline page
            if (!cachedResponse && event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return cachedResponse;
          });

        // Return cached response dulu, lalu update di background
        return cachedResponse || fetchPromise;
      })
  );
});

// Push Notification (Optional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Ada film baru! Cek sekarang.',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('🎬 Nonton Gratis', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
