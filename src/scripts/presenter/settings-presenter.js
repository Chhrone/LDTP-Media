import SettingsView from '../views/settings-view';
import SettingsModel from '../models/settings-model';
import AuthHelper from '../utils/auth-helper';
import CONFIG from '../config';

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

      this._view.updateProfileInfo(userData);
      this._view.initializeForm(this._currentSettings);
      this._initializeMapPreview();
      this._setupEventListeners();
    } catch (error) {
      console.error('Error initializing settings page:', error);
    }
  }

  _initializeMapPreview() {
    const mapStyle = this._currentSettings.mapStyle || 'streets';
    this._mapPreview = this._view.updateMapPreview(this._mapConfig, mapStyle);
  }

  _setupEventListeners() {
    this._view.setupEventListeners(
      (selectedStyle) => {
        this._mapPreview = this._view.updateMapPreview(this._mapConfig, selectedStyle);
      },
      async () => {
        await this._saveSettings();
      }
    );
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
        this._view.showSuccessMessage(result.message);

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
