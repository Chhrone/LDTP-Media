/* Service Worker for Push Notifications */

// Cache name for the app
const CACHE_NAME = 'ldtp-media-v1';

// List of URLs to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/scripts/index.js',
  '/scripts/app.js',
  '/styles/styles.css',
  '/icon.png'
];

// Log service worker initialization
console.log('Service Worker initialized');

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Failed to cache assets:', error);
            // Continue even if some assets fail to cache
            return Promise.resolve();
          });
      })
      .catch(error => {
        console.error('Cache open failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  // Claim clients to ensure the service worker controls all clients immediately
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
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

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).catch(error => {
          console.error('Fetch failed:', error);
          // Return a fallback response or let the error propagate
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          throw error;
        });
      }).catch(error => {
        console.error('Cache match failed:', error);
        // Return a fallback response for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw error;
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  if (!event.data) {
    console.warn('Push event has no data');
  }

  let notificationData = {};

  try {
    notificationData = event.data ? event.data.json() : {};
    console.log('Push data:', notificationData);
  } catch (e) {
    console.error('Error parsing push data:', e);
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
      .then(() => {
        console.log('Notification shown successfully');
      })
      .catch(error => {
        console.error('Error showing notification:', error);
      })
  );
});

// Notification click event - handle user interaction with notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');

  // Close the notification
  event.notification.close();

  // Get the notification data
  const notificationData = event.notification.data || {};
  const url = notificationData.url || '/';

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
    .then((clientList) => {
      // Try to find an existing window/tab to focus
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window/tab, open a new one
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
