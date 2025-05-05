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
    // Check if user is logged in, redirect to login if not
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    return this._view.getTemplate();
  }

  async afterRender() {
    try {
      // Get user data and settings
      const userData = this._model.getUserData();
      this._currentSettings = await this._model.getSettings();

      // Update profile information
      this._view.updateProfileInfo(userData);

      // Initialize form with current settings
      this._initializeForm();

      // Initialize map preview
      this._initializeMapPreview();

      // Set up event listeners
      this._setupEventListeners();
    } catch (error) {
      console.error('Error initializing settings page:', error);
    }
  }

  _initializeForm() {
    // Set language dropdown value
    const languageSelect = document.getElementById('language-select');
    if (languageSelect && this._currentSettings.language) {
      languageSelect.value = this._currentSettings.language;
    }

    // Set theme dropdown value
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect && this._currentSettings.theme) {
      themeSelect.value = this._currentSettings.theme;
    }

    // Set map style dropdown value
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect && this._currentSettings.mapStyle) {
      mapStyleSelect.value = this._currentSettings.mapStyle;
    }
  }

  _initializeMapPreview() {
    // Initialize map preview with current map style
    const mapStyle = this._currentSettings.mapStyle || 'streets';
    this._mapPreview = this._view.updateMapPreview(this._mapConfig, mapStyle);
  }

  _setupEventListeners() {
    // Map style dropdown change event
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect) {
      mapStyleSelect.addEventListener('change', (event) => {
        const selectedStyle = event.target.value;
        // Update map preview with selected style
        this._mapPreview = this._view.updateMapPreview(this._mapConfig, selectedStyle);
      });
    }

    // Save settings button click event
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        await this._saveSettings();
      });
    }
  }

  async _saveSettings() {
    try {
      // Show loading state
      this._view.showLoading();

      // Get form values
      const languageSelect = document.getElementById('language-select');
      const themeSelect = document.getElementById('theme-select');
      const mapStyleSelect = document.getElementById('map-style-select');

      // Create settings object
      const settings = {
        language: languageSelect ? languageSelect.value : this._currentSettings.language,
        theme: themeSelect ? themeSelect.value : this._currentSettings.theme,
        mapStyle: mapStyleSelect ? mapStyleSelect.value : this._currentSettings.mapStyle
      };

      // Update settings
      const result = await this._model.updateSettings(settings);

      // Hide loading state
      this._view.hideLoading();

      if (result.error) {
        // Show error message
        this._view.showErrorMessage(result.message);
      } else {
        // Show success message
        this._view.showSuccessMessage(result.message);

        // Update current settings
        this._currentSettings = settings;

        // Apply theme if changed
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
    // This is a placeholder for theme implementation
    // In a real application, this would apply the selected theme
    console.log(`Theme changed to: ${theme}`);
  }
}

export default SettingsPage;
