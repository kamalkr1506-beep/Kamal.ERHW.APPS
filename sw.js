const CACHE_NAME = 'erhw-v5-cache-v1';
const STATIC_ASSETS = [
  '/ERHW-APPS/',
  '/ERHW-APPS/index.html',
  '/ERHW-APPS/manifest.json',
  '/ERHW-APPS/icon-72.png',
  '/ERHW-APPS/icon-96.png',
  '/ERHW-APPS/icon-128.png',
  '/ERHW-APPS/icon-144.png',
  '/ERHW-APPS/icon-152.png',
  '/ERHW-APPS/icon-192.png',
  '/ERHW-APPS/icon-384.png',
  '/ERHW-APPS/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (new URL(e.request.url).hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(r => {
      if (r && r.status === 200 && r.type === 'basic') {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('/ERHW-APPS/index.html') : new Response('Offline', { status: 503 }));
  }));
});
