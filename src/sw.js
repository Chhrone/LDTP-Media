const CACHE_NAME = 'ldtp-media-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/scripts/index.js',
  '/scripts/app.js',
  '/styles/styles.css',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Failed to cache assets:', error);
            return Promise.resolve();
          });
      })
      .catch(error => {
        console.error('Cache open failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }).catch(error => {
      console.error('Cache cleanup failed:', error);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).catch(error => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          throw error;
        });
      }).catch(error => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw error;
      })
  );
});

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
