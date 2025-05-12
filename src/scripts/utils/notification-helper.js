import CONFIG from '../config';
import NotificationModel from '../models/notification-model';

class NotificationHelper {
  constructor() {
    this._model = new NotificationModel();
    this._vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
  }

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

      await this._registerServiceWorker();
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async _registerServiceWorker() {
    try {
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration) {
        return existingRegistration;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }

  async requestPermission() {
    try {
      return await Notification.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  async subscribe() {
    try {
      if (this._model.isSubscribed()) {
        return this._model.getSubscription();
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this._urlBase64ToUint8Array(this._vapidPublicKey),
        });

        if (!subscription || !subscription.endpoint) {
          throw new Error('Failed to create valid subscription');
        }

        await this._model.subscribe(subscription);
        return subscription;
      } catch (subscribeError) {
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

  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        return true;
      }

      const result = await subscription.unsubscribe();
      if (result) {
        await this._model.unsubscribe(subscription);
      }

      return result;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

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
