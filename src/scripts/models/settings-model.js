import CONFIG from '../config';
import AuthHelper from '../utils/auth-helper';

class SettingsModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
    this._tokenKey = CONFIG.KEY_TOKEN;
    this._userKey = CONFIG.KEY_USER;
    this._settingsKey = 'user-settings';
    this._defaultSettings = {
      language: 'en',
      theme: 'light',
      mapStyle: 'streets'
    };
  }

  async getSettings() {
    try {
      // Get user settings from localStorage
      const settingsData = localStorage.getItem(this._settingsKey);

      // If settings exist, parse and return them
      if (settingsData) {
        return JSON.parse(settingsData);
      }

      // If no settings exist, return default settings
      return this._defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return this._defaultSettings;
    }
  }

  async updateSettings(settings) {
    try {
      // Merge with default settings to ensure all properties exist
      const updatedSettings = {
        ...this._defaultSettings,
        ...settings
      };

      // Save settings to localStorage
      localStorage.setItem(this._settingsKey, JSON.stringify(updatedSettings));

      return {
        error: false,
        message: 'Settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return {
        error: true,
        message: error.message || 'Failed to update settings'
      };
    }
  }

  getUserData() {
    return AuthHelper.getUserData();
  }
}

export default SettingsModel;
