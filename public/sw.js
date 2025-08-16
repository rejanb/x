const CACHE_NAME = 'twitter-clone-pwa-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip caching for unsupported schemes (chrome-extension, moz-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // In local development, do not intercept app asset requests to avoid stale bundles
  const isLocalDev = ['localhost', '127.0.0.1'].includes(self.location.hostname);
  if (isLocalDev) {
    // Only apply a network-first strategy for API calls; let the browser handle everything else
    if (url.pathname.startsWith('/api')) {
      event.respondWith(networkFirst(req));
    }
    return;
  }

  // Production behavior: cache-first for app shell, network-first for API
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

// Push notification event listener
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Twitter Clone',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'default',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ],
      requireInteraction: false
    })
  );
});

// Notification click event listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Open new window/tab if app is not open
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + urlToOpen);
      }
    })
  );
});

async function cacheFirst(req) {
  // Skip caching for unsupported schemes
  const url = new URL(req.url);
  if (!url.protocol.startsWith('http')) {
    return fetch(req);
  }
  
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  // Only cache GET requests
  if (req.method === 'GET') {
    cache.put(req, fresh.clone());
  }
  return fresh;
}

async function networkFirst(req) {
  // Skip caching for unsupported schemes
  const url = new URL(req.url);
  if (!url.protocol.startsWith('http')) {
    return fetch(req);
  }
  
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req);
    // Only cache GET requests - POST/PUT/DELETE should not be cached
    if (req.method === 'GET') {
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
