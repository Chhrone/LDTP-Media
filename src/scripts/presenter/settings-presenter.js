import SettingsView from '../views/settings-view';
import SettingsModel from '../models/settings-model';
import AuthHelper from '../utils/auth-helper';
import CONFIG from '../config';
import notificationPresenter from './notification-presenter';
import Swal from '../utils/swal-config';

class SettingsPage {
  constructor() {
    this._view = new SettingsView();
    this._model = new SettingsModel();
    this._mapConfig = {
      apiKey: CONFIG.MAPTILER_KEY,
      defaultCenter: CONFIG.DEFAULT_CENTER,
      defaultZoom: CONFIG.DEFAULT_ZOOM,
      mapStyles: CONFIG.MAP_STYLES
    };
    this._mapPreview = null;
    this._currentSettings = null;
    this._isSubscribedToNotifications = false;
  }

  async render() {
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    return this._view.getTemplate();
  }

  async afterRender() {
    try {
      const userData = this._model.getUserData();
      this._currentSettings = await this._model.getSettings();

      // Check notification subscription status
      await this._checkNotificationStatus();

      this._view.updateProfileInfo(userData);
      this._view.initializeForm(this._currentSettings);
      this._initializeMapPreview();
      this._setupEventListeners();
    } catch (error) {
      console.error('Error initializing settings page:', error);
    }
  }

  /**
   * Checks if the user is subscribed to push notifications
   */
  async _checkNotificationStatus() {
    try {
      // Initialize notification system if not already initialized
      await notificationPresenter.init();

      // Check if user is subscribed
      this._isSubscribedToNotifications = await notificationPresenter.isSubscribed();
      console.log('Notification subscription status:', this._isSubscribedToNotifications);
    } catch (error) {
      console.error('Error checking notification status:', error);
      this._isSubscribedToNotifications = false;
    }
  }

  _initializeMapPreview() {
    const mapStyle = this._currentSettings.mapStyle || 'streets';
    this._mapPreview = this._view.updateMapPreview(this._mapConfig, mapStyle);
  }

  _setupEventListeners() {
    this._view.setupEventListeners(
      // Map style change handler
      (selectedStyle) => {
        this._mapPreview = this._view.updateMapPreview(this._mapConfig, selectedStyle);
      },
      // Save settings handler
      async () => {
        await this._saveSettings();
      },
      // Enable notifications handler
      async () => {
        await this._enableNotifications();
      },
      // Disable notifications handler
      async () => {
        await this._disableNotifications();
      },
      // Current subscription status
      this._isSubscribedToNotifications
    );
  }

  /**
   * Enables push notifications
   */
  async _enableNotifications() {
    try {
      const result = await notificationPresenter.requestPermissionAndSubscribe();

      if (result) {
        this._isSubscribedToNotifications = true;
        this._view.updateNotificationUI(true);
        this._view.showSuccessMessage('Push notifications enabled successfully');
      } else {
        this._view.showErrorMessage('Failed to enable push notifications. Please check your browser settings and try again.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      this._view.showErrorMessage('An error occurred while enabling notifications');
    }
  }

  /**
   * Disables push notifications
   */
  async _disableNotifications() {
    try {
      const result = await notificationPresenter.unsubscribe();

      if (result) {
        this._isSubscribedToNotifications = false;
        this._view.updateNotificationUI(false);
        this._view.showSuccessMessage('Push notifications disabled successfully');
      } else {
        this._view.showErrorMessage('Failed to disable push notifications');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      this._view.showErrorMessage('An error occurred while disabling notifications');
    }
  }

  /**
   * Saves user settings from form inputs and applies changes
   * Handles loading states, error handling, and success notifications
   */
  async _saveSettings() {
    try {
      this._view.showLoading();

      const settings = this._view.getFormValues(this._currentSettings);
      const result = await this._model.updateSettings(settings);
      this._view.hideLoading();

      if (result.error) {
        this._view.showErrorMessage(result.message);
      } else {
        // Use a toast notification instead of a modal for auto-save
        Swal.customFire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Settings saved',
          showConfirmButton: false,
          timer: 1500
        });

        const previousTheme = this._currentSettings.theme;
        this._currentSettings = settings;

        if (settings.theme !== previousTheme) {
          this._applyTheme(settings.theme);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this._view.hideLoading();
      this._view.showErrorMessage('An error occurred while saving settings');
    }
  }

  _applyTheme() {
    // Theme application is handled by CSS
  }
}

export default SettingsPage;
