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
      const settingsData = localStorage.getItem(this._settingsKey);

      if (settingsData) {
        return JSON.parse(settingsData);
      }
      return this._defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return this._defaultSettings;
    }
  }

  async updateSettings(settings) {
    try {
      const updatedSettings = {
        ...this._defaultSettings,
        ...settings
      };
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
