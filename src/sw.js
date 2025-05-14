importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Check if Workbox loaded successfully
if (workbox) {
  console.log('Workbox is loaded');

  // Force development builds
  workbox.setConfig({ debug: false });

  // Precaching
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/manifest.json', revision: '1' },
    { url: '/icon.png', revision: '1' },
    { url: '/icons/icon-72x72.png', revision: '1' },
    { url: '/icons/icon-96x96.png', revision: '1' },
    { url: '/icons/icon-128x128.png', revision: '1' },
    { url: '/icons/icon-144x144.png', revision: '1' },
    { url: '/icons/icon-152x152.png', revision: '1' },
    { url: '/icons/icon-192x192.png', revision: '1' },
    { url: '/icons/icon-384x384.png', revision: '1' },
    { url: '/icons/icon-512x512.png', revision: '1' },
    { url: '/icons/maskable-icon.png', revision: '1' },
    { url: '/icons/shortcut-new-story-96x96.png', revision: '1' }
  ]);

  // Cache CSS, JS, and Web Worker files with a Cache First strategy
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style' ||
                     request.destination === 'script' ||
                     request.destination === 'worker',
    new workbox.strategies.CacheFirst({
      cacheName: 'assets-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache images with a Cache First strategy
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // Cache fonts with a Cache First strategy
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'fonts-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
        }),
      ],
    })
  );

  // Cache API requests with a Network First strategy
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://story-api.dicoding.dev',
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        }),
      ],
    })
  );

  // Cache MapTiler API requests with a Network First strategy
  workbox.routing.registerRoute(
    ({ url }) => url.origin.includes('maptiler.com'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'maptiler-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        }),
      ],
    })
  );

  // Cache CDN resources with a Stale While Revalidate strategy
  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin.includes('cdnjs.cloudflare.com') ||
      url.origin.includes('unpkg.com') ||
      url.origin.includes('cdn.jsdelivr.net'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'cdn-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
        }),
      ],
    })
  );

  // Fallback to app shell for navigation requests
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    async () => {
      try {
        return await workbox.strategies.NetworkFirst({
          cacheName: 'pages-cache',
          plugins: [
            new workbox.expiration.ExpirationPlugin({
              maxEntries: 30,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
          ],
        }).handle({ request: new Request('/index.html') });
      } catch (error) {
        return caches.match('/index.html');
      }
    }
  );
} else {
  console.error('Workbox could not be loaded. Offline functionality will be limited.');
}

self.addEventListener('push', (event) => {
  let notificationData = {};

  try {
    notificationData = event.data ? event.data.json() : {};
  } catch (e) {
    notificationData = {
      title: 'New Notification',
      options: {
        body: 'Something new happened in the app',
        icon: '/icon.png'
      }
    };
  }

  const title = notificationData.title || 'New Notification';
  const options = notificationData.options || {
    body: 'Something new happened in the app',
    icon: '/icon.png',
    badge: '/icon.png',
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return Promise.resolve();
    })
    .catch(error => {
      console.error('Error handling notification click:', error);
    })
  );
});
