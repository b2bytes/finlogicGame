// FinLogic Service Worker — PWA + Push notifications
// Versión cache-first liviano: solo cachea shell estática, todo dato dinámico va a red.

const CACHE_NAME = 'finlogic-v1';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: network-first para HTML/API, cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isAsset = /\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => null);
        return res;
      }).catch(() => caches.match('/index.html')))
    );
  }
});

// === PUSH NOTIFICATIONS ===
// Recibe push del backend (Web Push) y muestra notificación nativa
self.addEventListener('push', (event) => {
  let payload = { title: 'FinLogic', body: 'Tienes una novedad', url: '/' };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; }
    catch { payload.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: 'https://qtrypzzcjebvfhfsdmaq.supabase.co/storage/v1/object/public/base44-prod/public/icon-192.png',
      badge: 'https://qtrypzzcjebvfhfsdmaq.supabase.co/storage/v1/object/public/base44-prod/public/icon-192.png',
      data: { url: payload.url || '/' },
      tag: payload.tag || 'finlogic-default',
      requireInteraction: payload.priority === 'high',
      vibrate: [100, 50, 100],
    })
  );
});

// Click en notificación → abre la app en la URL indicada
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
