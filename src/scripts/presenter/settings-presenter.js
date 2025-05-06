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

      // Update profile information
      this._view.updateProfileInfo(userData);

      // Initialize form with current settings
      this._view.initializeForm(this._currentSettings);

      // Initialize map preview
      this._initializeMapPreview();

      // Setup event listeners
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
    // Setup map style change event
    this._view.setupEventListeners(
      // Map style change callback
      (selectedStyle) => {
        this._mapPreview = this._view.updateMapPreview(this._mapConfig, selectedStyle);
      },
      // Save settings callback
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

      // Get form values from view
      const settings = this._view.getFormValues(this._currentSettings);

      // Update settings in model
      const result = await this._model.updateSettings(settings);
      this._view.hideLoading();

      if (result.error) {
        this._view.showErrorMessage(result.message);
      } else {
        this._view.showSuccessMessage(result.message);
        
        // Store current settings
        const previousTheme = this._currentSettings.theme;
        this._currentSettings = settings;

        // Apply theme if changed
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

  _applyTheme(theme) {
    console.log(`Theme changed to: ${theme}`);
  }
}

export default SettingsPage;
