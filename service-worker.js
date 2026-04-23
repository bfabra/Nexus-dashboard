// ═══════════════════════════════════════════════════
// SERVICE WORKER — Mi Espacio Personal
// Cache-first strategy para uso offline completo
// ═══════════════════════════════════════════════════

const CACHE_NAME = 'mi-espacio-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/components.css',
  './css/layout.css',
  './js/app.js',
  './js/store.js',
  './js/sync.js',
  './js/modules/hoy.js',
  './js/modules/mes.js',
  './js/modules/proyectos.js',
  './js/modules/cursos.js',
  './js/modules/lectura.js',
  './js/modules/pnl.js',
  './js/modules/xhilos.js',
  './js/modules/diario.js',
  './js/modules/habits.js',
  './js/modules/series.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
];

// Instalar: cachear todos los assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(url => !url.startsWith('https://fonts')));
    }).then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch:
// - Documentos: network-first (muestra cambios nuevos cuando hay red)
// - Estáticos: stale-while-revalidate (rápido + se actualiza en background)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isDocument = event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isDocument) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(async () => {
        const cachedDoc = await caches.match(event.request);
        if (cachedDoc) return cachedDoc;
        return caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkUpdate = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => null);

      if (cached) return cached;
      return networkUpdate.then(resp => resp || caches.match('./index.html'));
    })
  );
});
