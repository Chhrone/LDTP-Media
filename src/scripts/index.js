
import '../styles/styles.css';
import App from './app';
import { Workbox } from 'workbox-window';

import './utils/focus-visible-polyfill';

// Register service worker using Workbox
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const wb = new Workbox('/sw.js');

      // Add event listeners for service worker updates
      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          console.log('New service worker installed (update)');
          if (confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        } else {
          console.log('Service worker installed for the first time');
        }
      });

      wb.addEventListener('activated', (event) => {
        if (event.isUpdate) {
          console.log('Service worker activated after update');
        } else {
          console.log('Service worker activated for the first time');
        }
      });

      wb.addEventListener('waiting', (event) => {
        console.log('New service worker waiting to activate');
      });

      wb.addEventListener('controlling', (event) => {
        console.log('Service worker is now controlling the page');
      });

      wb.addEventListener('redundant', (event) => {
        console.log('Service worker has become redundant');
      });

      // Register the service worker
      await wb.register();
      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.warn('Service workers are not supported in this browser');
  }
};

// Register service worker when the page loads
window.addEventListener('load', registerServiceWorker);

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
