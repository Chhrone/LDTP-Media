
import '../styles/styles.css';
import App from './app';
import { registerSW } from 'virtual:pwa-register';

import './utils/focus-visible-polyfill';

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a confirmation dialog to the user
    if (confirm('New content available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline use');
    // You could show a toast notification here
  },
});

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
