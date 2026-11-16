// Compteur Chibre — aucune dépendance externe.
const CACHE_NAME = 'chibre-cache-v2.2.0';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/logo.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('chibre-cache-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(async res => {
      if(res.ok) { const cache = await caches.open(CACHE_NAME); await cache.put('./index.html', res.clone()); }
      return res;
    }).catch(async () => (await caches.match('./index.html')) || Response.error()));
  } else {
    if (!CORE.some(path => new URL(path, self.registration.scope).href === req.url)) return;
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(async res => {
      if(res.ok) { const cache = await caches.open(CACHE_NAME); await cache.put(req, res.clone()); }
      return res;
    })));
  }
});
