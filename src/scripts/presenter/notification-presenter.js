import NotificationHelper from '../utils/notification-helper';
import authPresenter from './auth-presenter';

class NotificationPresenter {
  constructor() {
    this._helper = new NotificationHelper();
    this._isInitialized = false;
  }

  /**
   * Initialize the notification system
   * @returns {Promise<boolean>}
   */
  async init() {
    if (this._isInitialized) {
      return true;
    }

    try {
      const result = await this._helper.init();
      this._isInitialized = result;
      return result;
    } catch (error) {
      console.error('Error initializing notification presenter:', error);
      return false;
    }
  }

  /**
   * Request notification permission and subscribe
   * @returns {Promise<boolean>}
   */
  async requestPermissionAndSubscribe() {
    try {
      if (!this._isInitialized) {
        await this.init();
      }

      if (!authPresenter.isLoggedIn()) {
        console.warn('User must be logged in to subscribe to notifications');
        return false;
      }

      const permission = await this._helper.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      await this._helper.subscribe();
      return true;
    } catch (error) {
      console.error('Error requesting permission and subscribing:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<boolean>}
   */
  async unsubscribe() {
    try {
      if (!this._isInitialized) {
        await this.init();
      }

      return await this._helper.unsubscribe();
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   * @returns {Promise<boolean>}
   */
  async isSubscribed() {
    try {
      if (!this._isInitialized) {
        await this.init();
      }

      return await this._helper.isSubscribed();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
}

const notificationPresenter = new NotificationPresenter();
export default notificationPresenter;
