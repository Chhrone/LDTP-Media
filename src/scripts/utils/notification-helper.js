import CONFIG from '../config';
import NotificationModel from '../models/notification-model';

class NotificationHelper {
  constructor() {
    this._model = new NotificationModel();
    this._vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
  }

  /**
   * Initialize the notification system
   * Registers service worker and checks for existing subscription
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async init() {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported by this browser');
        return false;
      }

      if (!('PushManager' in window)) {
        console.warn('Push notifications are not supported by this browser');
        return false;
      }

      // Register service worker
      await this._registerServiceWorker();
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Register the service worker
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  async _registerServiceWorker() {
    try {
      // Check if service worker is already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration) {
        console.log('Service worker already registered');
        return existingRegistration;
      }

      // Register the service worker
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Request notification permission
   * @returns {Promise<string>} - Permission status: 'granted', 'denied', or 'default'
   */
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Subscribe to push notifications
   * @returns {Promise<Object>} - Subscription object
   */
  async subscribe() {
    try {
      // Check if already subscribed
      if (this._model.isSubscribed()) {
        return this._model.getSubscription();
      }

      // Request permission if not already granted
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported by this browser');
      }

      // Check if push manager is supported
      if (!('PushManager' in window)) {
        throw new Error('Push notifications are not supported by this browser');
      }

      try {
        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this._urlBase64ToUint8Array(this._vapidPublicKey),
        });

        // Verify subscription has required properties
        if (!subscription || !subscription.endpoint) {
          throw new Error('Failed to create valid subscription');
        }

        // Save subscription to server
        await this._model.subscribe(subscription);

        return subscription;
      } catch (subscribeError) {
        console.error('Error during push subscription:', subscribeError);

        // Check for specific errors
        if (subscribeError.name === 'NotAllowedError') {
          throw new Error('Permission denied for push notifications');
        } else if (subscribeError.name === 'AbortError') {
          throw new Error('Push subscription was aborted');
        }

        throw subscribeError;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<boolean>} - Whether unsubscription was successful
   */
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        return true;
      }

      // Unsubscribe from push manager
      const result = await subscription.unsubscribe();

      if (result) {
        // Unsubscribe from server
        await this._model.unsubscribe(subscription);
      }

      return result;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   * @returns {Promise<boolean>}
   */
  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Convert base64 string to Uint8Array for applicationServerKey
   * @param {string} base64String
   * @returns {Uint8Array}
   */
  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export default NotificationHelper;
