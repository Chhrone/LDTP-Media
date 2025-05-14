import Swal from '../utils/swal-config';

class SettingsView {
  getTemplate() {
    return `
      <div class="container">
        <div class="settings-page" style="view-transition-name: settings-page">
          <h1 class="page-title">Settings</h1>

          <div class="settings-container">
            <div class="settings-card">
              <!-- Profile Information Section -->
              <section class="settings-section">
                <h2 class="settings-section-title">Profile Information</h2>
                <div class="profile-info">
                  <div class="profile-details">
                    <div class="form-group">
                      <label for="profile-name">Name</label>
                      <input type="text" id="profile-name" class="profile-input" disabled>
                    </div>
                    <div class="form-group">
                      <label for="profile-email">Email</label>
                      <input type="email" id="profile-email" class="profile-input" disabled>
                    </div>
                  </div>
                </div>
              </section>

              <div class="settings-divider"></div>

              <!-- Language Options Section -->
              <section class="settings-section">
                <div class="form-group">
                  <label for="language-select">Select Language</label>
                  <select id="language-select" class="settings-dropdown">
                    <option value="en">English</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </section>

              <!-- Theme Settings Section -->
              <section class="settings-section">
                <div class="form-group">
                  <label for="theme-select">Select Theme</label>
                  <select id="theme-select" class="settings-dropdown">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System Default)</option>
                  </select>
                </div>
              </section>

              <!-- Map Style Preferences Section -->
              <section class="settings-section">
                <div class="form-group">
                  <label for="map-style-select">Default Map Style</label>
                  <select id="map-style-select" class="settings-dropdown">
                    <option value="streets">Streets</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="aquarelle">Aquarelle</option>
                    <option value="bright">Bright</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div class="map-preview-container">
                  <div id="map-preview" class="map-preview"></div>
                </div>
              </section>

              <div class="settings-divider"></div>

              <!-- Notification Settings Section -->
              <section class="settings-section">
                <h2 class="settings-section-title">Push Notifications</h2>
                <div class="notification-settings">
                  <p class="notification-description">
                    Receive notifications when new stories are created.
                  </p>
                  <div class="notification-controls">
                    <div id="notification-status" class="notification-status">
                      Checking notification status...
                    </div>
                    <div class="notification-buttons">
                      <button id="enable-notifications" class="btn btn-secondary">Enable Notifications</button>
                      <button id="disable-notifications" class="btn btn-outline">Disable Notifications</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showLoading() {
    // Show loading indicator for the settings that's being changed
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
      settingsContainer.classList.add('loading');
    }
  }

  hideLoading() {
    // Hide loading indicator
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
      settingsContainer.classList.remove('loading');
    }
  }

  showSuccessMessage(message) {
    Swal.customFire({
      toast: true,
      position: 'bottom-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000
    });
  }

  showErrorMessage(message) {
    Swal.customFire({
      toast: true,
      position: 'bottom-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 3000
    });
  }

  updateProfileInfo(userData) {
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');

    if (nameInput && emailInput && userData) {
      nameInput.value = userData.name || '';
      emailInput.value = userData.email || '';
    }
  }

  updateMapPreview(mapConfig, style) {
    const mapPreview = document.getElementById('map-preview');
    if (!mapPreview) return;

    mapPreview.innerHTML = '';

    const map = L.map('map-preview', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false
    }).setView(mapConfig.defaultCenter, mapConfig.defaultZoom);

    L.tileLayer(
      `https://api.maptiler.com/maps/${mapConfig.mapStyles[style]}/256/{z}/{x}/{y}.png?key=${mapConfig.apiKey}`,
      {
        maxZoom: 18
      }
    ).addTo(map);

    return map;
  }

  /**
   * Initializes form with current settings values
   * @param {Object} currentSettings
   */
  initializeForm(currentSettings) {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect && currentSettings.language) {
      languageSelect.value = currentSettings.language;
    }

    const themeSelect = document.getElementById('theme-select');
    if (themeSelect && currentSettings.theme) {
      themeSelect.value = currentSettings.theme;
    }

    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect && currentSettings.mapStyle) {
      mapStyleSelect.value = currentSettings.mapStyle;
    }
  }

  /**
   * Sets up event listeners for settings form elements
   * @param {Function} onMapStyleChange
   * @param {Function} onSaveSettings
   * @param {Function} onEnableNotifications
   * @param {Function} onDisableNotifications
   * @param {boolean} isSubscribed
   */
  setupEventListeners(onMapStyleChange, onSaveSettings, onEnableNotifications, onDisableNotifications, isSubscribed) {
    // Set up map style select
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect && onMapStyleChange && onSaveSettings) {
      mapStyleSelect.addEventListener('change', async (event) => {
        const selectedStyle = event.target.value;
        onMapStyleChange(selectedStyle);
        // Auto-save settings when map style changes
        await onSaveSettings();
      });
    }

    // Set up language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect && onSaveSettings) {
      languageSelect.addEventListener('change', async () => {
        // Auto-save settings when language changes
        await onSaveSettings();
      });
    }

    // Set up theme select
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect && onSaveSettings) {
      themeSelect.addEventListener('change', async () => {
        // Auto-save settings when theme changes
        await onSaveSettings();
      });
    }

    // Set up notification buttons
    const enableButton = document.getElementById('enable-notifications');
    const disableButton = document.getElementById('disable-notifications');

    if (enableButton && onEnableNotifications) {
      enableButton.addEventListener('click', async () => {
        await onEnableNotifications();
      });
    }

    if (disableButton && onDisableNotifications) {
      disableButton.addEventListener('click', async () => {
        await onDisableNotifications();
      });
    }

    // Update notification UI based on subscription status
    this.updateNotificationUI(isSubscribed);
  }

  /**
   * Updates the notification UI based on subscription status
   * @param {boolean} isSubscribed
   */
  updateNotificationUI(isSubscribed) {
    const statusElement = document.getElementById('notification-status');
    const enableButton = document.getElementById('enable-notifications');
    const disableButton = document.getElementById('disable-notifications');

    if (!statusElement || !enableButton || !disableButton) return;

    if (isSubscribed) {
      statusElement.textContent = 'Notifications are enabled';
      statusElement.classList.add('subscribed');
      statusElement.classList.remove('not-subscribed');

      enableButton.style.display = 'none';
      disableButton.style.display = 'block';
    } else {
      statusElement.textContent = 'Notifications are disabled';
      statusElement.classList.add('not-subscribed');
      statusElement.classList.remove('subscribed');

      enableButton.style.display = 'block';
      disableButton.style.display = 'none';
    }
  }

  /**
   * Gets current settings values from form inputs
   * @param {Object} currentSettings
   * @returns {Object}
   */
  getFormValues(currentSettings) {
    const languageSelect = document.getElementById('language-select');
    const themeSelect = document.getElementById('theme-select');
    const mapStyleSelect = document.getElementById('map-style-select');

    return {
      language: languageSelect ? languageSelect.value : currentSettings.language,
      theme: themeSelect ? themeSelect.value : currentSettings.theme,
      mapStyle: mapStyleSelect ? mapStyleSelect.value : currentSettings.mapStyle
    };
  }
}

export default SettingsView;
