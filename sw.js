/* =============================================
   Service Worker — Estratégia Finanças PWA
   Estratégia: Network-first com fallback offline
   ============================================= */

const CACHE_NAME = 'financas-v7';

// Arquivos essenciais para funcionamento offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/responsive.css',
  '/js/app-compiled.js',
  '/js/dashboard.js',
  '/js/sidebar.js',
  '/js/menu.js',
  '/js/logo.js',
  '/js/icons.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalar: pré-cachear assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativar: limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Notificação: ao clicar, abre/foca o app no farol
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/#farol');
    })
  );
});

// Fetch: network-first para Firebase/CDN, cache-first para assets locais
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorar requisições não-GET e domínios externos (Firebase, CDN, etc.)
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Para JS/CSS: força busca sem cache HTTP para garantir versão mais recente
  const isAsset = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
  const fetchRequest = isAsset
    ? new Request(event.request, { cache: 'no-cache' })
    : event.request;

  event.respondWith(
    fetch(fetchRequest)
      .then(response => {
        // Atualizar cache com resposta fresca
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
