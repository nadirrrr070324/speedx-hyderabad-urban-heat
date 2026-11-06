const CACHE_NAME = 'speedx-shell-v1';
const SHELL = ['/', '/index.html', '/src/main.tsx'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Network-first for API, cache-first for shell
  if (req.url.includes('open-meteo') || req.url.includes('bigdatacloud')) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    const clone = res.clone();
    caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
    return res;
  }).catch(() => caches.match('/index.html'))));
});
