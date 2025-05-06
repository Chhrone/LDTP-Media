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
      this._initializeForm();
      this._initializeMapPreview();
      this._setupEventListeners();
    } catch (error) {
      console.error('Error initializing settings page:', error);
    }
  }

  _initializeForm() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect && this._currentSettings.language) {
      languageSelect.value = this._currentSettings.language;
    }

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect && this._currentSettings.theme) {
      themeSelect.value = this._currentSettings.theme;
    }

    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect && this._currentSettings.mapStyle) {
      mapStyleSelect.value = this._currentSettings.mapStyle;
    }
  }

  _initializeMapPreview() {
    const mapStyle = this._currentSettings.mapStyle || 'streets';
    this._mapPreview = this._view.updateMapPreview(this._mapConfig, mapStyle);
  }

  _setupEventListeners() {
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect) {
      mapStyleSelect.addEventListener('change', (event) => {
        const selectedStyle = event.target.value;
        this._mapPreview = this._view.updateMapPreview(this._mapConfig, selectedStyle);
      });
    }

    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        await this._saveSettings();
      });
    }
  }

  /**
   * Saves user settings from form inputs and applies changes
   * Handles loading states, error handling, and success notifications
   */
  async _saveSettings() {
    try {
      this._view.showLoading();

      const languageSelect = document.getElementById('language-select');
      const themeSelect = document.getElementById('theme-select');
      const mapStyleSelect = document.getElementById('map-style-select');

      const settings = {
        language: languageSelect ? languageSelect.value : this._currentSettings.language,
        theme: themeSelect ? themeSelect.value : this._currentSettings.theme,
        mapStyle: mapStyleSelect ? mapStyleSelect.value : this._currentSettings.mapStyle
      };

      const result = await this._model.updateSettings(settings);
      this._view.hideLoading();

      if (result.error) {
        this._view.showErrorMessage(result.message);
      } else {
        this._view.showSuccessMessage(result.message);
        this._currentSettings = settings;

        if (settings.theme !== this._currentSettings.theme) {
          this._applyTheme(settings.theme);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this._view.hideLoading();
      this._view.showErrorMessage('An error occurred while saving settings');
    }
  }

  _applyTheme(theme) {
    console.log(`Theme changed to: ${theme}`);
  }
}

export default SettingsPage;
