const CACHE_VERSION = 2; // Incrementa questo numero per forzare l'aggiornamento
const CACHE_NAME = `yahtzee-v${CACHE_VERSION}`;
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Installazione: salva i file nella cache e forza l'attivazione immediata
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    }).then(() => {
      // Forza l'attivazione immediata del nuovo service worker
      return self.skipWaiting();
    })
  );
});

// Attivazione: elimina le vecchie cache e prende controllo dei client
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Prende controllo di tutti i client immediatamente
      return self.clients.claim();
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