const CACHE_NAME = 'yahtzee-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Installazione: salva i file nella cache
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

// Recupero: serve i file dalla cache se non c'è rete
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => {
      return res || fetch(evt.request);
    })
  );
});