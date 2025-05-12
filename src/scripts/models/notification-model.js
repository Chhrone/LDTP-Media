import CONFIG from '../config';
import authPresenter from '../presenter/auth-presenter';

class NotificationModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
    this._subscriptionKey = CONFIG.KEY_NOTIFICATION_SUBSCRIPTION;
  }

  /**
   * Subscribe to push notifications
   * @param {Object} subscription - PushSubscription object
   * @returns {Promise<Object>} - API response
   */
  async subscribe(subscription) {
    try {
      const token = authPresenter.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      // Check if subscription is valid
      if (!subscription || !subscription.endpoint) {
        throw new Error('Invalid subscription object');
      }

      // Convert subscription to JSON to ensure we can access its properties
      const subscriptionJSON = subscription.toJSON ? subscription.toJSON() : subscription;

      // Ensure keys exist
      if (!subscriptionJSON.keys || !subscriptionJSON.keys.p256dh || !subscriptionJSON.keys.auth) {
        throw new Error('Subscription is missing required keys');
      }

      const response = await fetch(`${this._baseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscriptionJSON.endpoint,
          keys: {
            p256dh: subscriptionJSON.keys.p256dh,
            auth: subscriptionJSON.keys.auth,
          },
        }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      // Save subscription to localStorage
      this._saveSubscription(subscriptionJSON);

      return responseJson;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw new Error(error.message || 'Failed to subscribe to notifications');
    }
  }

  /**
   * Unsubscribe from push notifications
   * @param {Object} subscription - PushSubscription object
   * @returns {Promise<Object>} - API response
   */
  async unsubscribe(subscription) {
    try {
      const token = authPresenter.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      // Check if subscription is valid
      if (!subscription || !subscription.endpoint) {
        // If no valid subscription, just remove from localStorage and return success
        this._removeSubscription();
        return { error: false, message: 'Unsubscribed successfully' };
      }

      // Convert subscription to JSON to ensure we can access its properties
      const subscriptionJSON = subscription.toJSON ? subscription.toJSON() : subscription;

      const response = await fetch(`${this._baseUrl}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscriptionJSON.endpoint,
        }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      // Remove subscription from localStorage
      this._removeSubscription();

      return responseJson;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      throw new Error(error.message || 'Failed to unsubscribe from notifications');
    }
  }

  /**
   * Check if user is subscribed to push notifications
   * @returns {boolean}
   */
  isSubscribed() {
    return !!this.getSubscription();
  }

  /**
   * Get the current subscription from localStorage
   * @returns {Object|null}
   */
  getSubscription() {
    const subscription = localStorage.getItem(this._subscriptionKey);
    return subscription ? JSON.parse(subscription) : null;
  }

  /**
   * Save subscription to localStorage
   * @param {Object} subscription
   */
  _saveSubscription(subscription) {
    localStorage.setItem(this._subscriptionKey, JSON.stringify(subscription));
  }

  /**
   * Remove subscription from localStorage
   */
  _removeSubscription() {
    localStorage.removeItem(this._subscriptionKey);
  }
}

export default NotificationModel;
