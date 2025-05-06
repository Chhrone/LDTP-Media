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

              <!-- Save Settings Button -->
              <div class="settings-actions">
                <button id="save-settings" class="btn btn-primary">Save Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showLoading() {
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
      saveButton.innerHTML = '<span class="btn-loader"></span><span class="btn-text">Saving...</span>';
      saveButton.classList.add('loading');
      saveButton.disabled = true;
    }
  }

  hideLoading() {
    const saveButton = document.getElementById('save-settings');
    if (saveButton) {
      saveButton.innerHTML = 'Save Settings';
      saveButton.classList.remove('loading');
      saveButton.disabled = false;
    }
  }

  showSuccessMessage(message) {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#D48944',
      confirmButtonText: 'OK'
    });
  }

  showErrorMessage(message) {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#D48944',
      confirmButtonText: 'OK'
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
   */
  setupEventListeners(onMapStyleChange, onSaveSettings) {
    const mapStyleSelect = document.getElementById('map-style-select');
    if (mapStyleSelect && onMapStyleChange) {
      mapStyleSelect.addEventListener('change', (event) => {
        const selectedStyle = event.target.value;
        onMapStyleChange(selectedStyle);
      });
    }

    const saveButton = document.getElementById('save-settings');
    if (saveButton && onSaveSettings) {
      saveButton.addEventListener('click', async () => {
        await onSaveSettings();
      });
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
