// CryptoAlert Service Worker - v1.0
const CACHE_NAME = 'cryptoalert-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// External CDN resources to cache
const CDN_CACHE = 'cryptoalert-cdn-v1';
const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
  'https://unpkg.com/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Vazirmatn:wght@300;400;600;700&display=swap',
];

// ── INSTALL: cache static assets ──────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(CDN_CACHE).then(cache =>
        Promise.allSettled(CDN_URLS.map(url => cache.add(url)))
      ),
    ]).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CDN_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: network-first for API, cache-first for assets ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls (CoinGecko, Kraken, etc.) → network only, no cache
  if (
    url.hostname.includes('coingecko.com') ||
    url.hostname.includes('kraken.com') ||
    url.hostname.includes('emailjs.com') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // CDN resources → cache first, then network
  if (
    url.hostname.includes('jsdelivr.net') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.open(CDN_CACHE).then(cache =>
        cache.match(event.request).then(cached =>
          cached || fetch(event.request).then(res => {
            cache.put(event.request, res.clone());
            return res;
          }).catch(() => cached)
        )
      )
    );
    return;
  }

  // App shell → cache first, fallback to network, fallback to index.html
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(res => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        });
        return cached || networkFetch.catch(() =>
          cache.match('/index.html')
        );
      })
    )
  );
});

// ── PUSH: handle push notifications (future) ──────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'CryptoAlert', {
      body: data.body || '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'crypto-alert',
      renotify: true,
      data: data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
