import MapHandler from '../utils/map-handler';
import MediaHandler from '../utils/media-handler';

class CreateStoryView {
  getTemplate() {
    return `
      <div class="container">
        <div class="create-story-page" style="view-transition-name: create-story-page">
          <a href="#/" class="back-button">
            <i class="fas fa-arrow-left"></i> Back
          </a>
          <h1 class="page-title">Loughshinny Dublinn Travel Post</h1>

          <form id="createStoryForm" class="create-story-form">
            <!-- Media Capture Section -->
            <div class="form-group">
              <label for="media-capture">Photo</label>
              <div class="media-capture">
                <!-- Media Tabs -->
                <div class="media-tabs">
                  <button type="button" id="showCameraOption" class="media-tab active" aria-label="Use camera">
                    <i class="fas fa-camera"></i> Camera
                  </button>
                  <button type="button" id="showUploadOption" class="media-tab" aria-label="Upload image">
                    <i class="fas fa-upload"></i> Upload
                  </button>
                </div>

                <!-- Camera Capture Option -->
                <div id="cameraCapture" class="capture-option">
                  <div class="camera-container">
                    <video id="camera" class="camera-preview" autoplay playsinline></video>
                    <canvas id="canvas" class="camera-canvas" style="display: none;"></canvas>
                  </div>
                  <div class="camera-controls">
                    <button type="button" id="startCamera" class="camera-button">
                      <i class="fas fa-camera"></i> Open Camera
                    </button>
                    <button type="button" id="capturePhoto" class="camera-button" disabled>
                      <i class="fas fa-circle"></i> Take Photo
                    </button>
                    <button type="button" id="retakePhoto" class="camera-button" disabled>
                      <i class="fas fa-redo"></i> Retake
                    </button>
                  </div>
                  <div id="imagePreview" class="image-preview"></div>
                </div>

                <!-- File Upload Option -->
                <div id="fileUpload" class="capture-option" style="display: none;">
                  <div class="upload-container">
                    <label for="fileInput" class="file-input-label">
                      <i class="fas fa-cloud-upload-alt"></i>
                      <span>Choose a file or drag it here</span>
                    </label>
                    <input type="file" id="fileInput" class="file-input" accept="image/*">
                  </div>
                  <div id="uploadPreview" class="image-preview upload-preview"></div>
                </div>

                <!-- Hidden input for the final image -->
                <input type="file" id="image" name="photo" style="display: none;">
              </div>
            </div>

            <!-- Description Section -->
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" name="description" rows="4" placeholder="Tell us about your travel experience..." required></textarea>
            </div>

            <!-- Location Section -->
            <div class="form-group">
              <div class="location-header">
                <label>Location</label>
                <div class="skip-location">
                    <span class="toggle-label">Skip location</span>
                  <label class="toggle-switch" for="skipLocation">
                    <input type="checkbox" id="skipLocation" name="skipLocation">
                    <span class="toggle-slider"></span>
                  </label>

                </div>
              </div>

              <div id="locationControls" class="location-controls">
                <!-- Search Bar -->
                <div class="search-container">
                  <input type="text" id="locationSearch" placeholder="Search for a place...">
                  <button type="button" id="searchButton">
                    <i class="fas fa-search"></i>
                  </button>
                </div>

                <!-- Map Style Controls -->
                <div class="map-style-dropdown">
                  <select id="mapStyleSelect" class="map-style-select">
                    <option value="streets" selected>Streets</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="aquarelle">Aquarelle</option>
                    <option value="bright">Bright</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <!-- Locate Me Button -->
                <button type="button" id="locateMeButton" class="locate-me-button">
                  <i class="fas fa-location-arrow"></i> Locate Me
                </button>
              </div>

              <!-- Map Container -->
              <div id="create-map" class="create-map"></div>

              <!-- Hidden inputs for coordinates -->
              <input type="hidden" id="lat" name="lat">
              <input type="hidden" id="lon" name="lon">
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <a href="#/" class="cancel-button">Cancel</a>
              <button type="submit" class="submit-button">Submit</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Initializes the map component with click handlers, style selector, and location features
   * @param {Object} mapConfig - Configuration for the map
   * @param {Function} onMapClick - Callback for map click events
   * @param {Function} onStyleChange - Callback for map style changes
   * @returns {Object} Map and marker objects
   */
  async initializeMap(mapConfig, onMapClick, onStyleChange) {
    // Initialize the map using MapHandler
    const { map, marker } = await MapHandler.initializeMap({
      mapElementId: 'create-map',
      mapConfig,
      onMapClick: (lat, lng) => {
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lng;
        if (onMapClick) onMapClick(lat, lng);
      }
    });

    // Initialize style dropdown
    const styleSelect = document.getElementById('mapStyleSelect');
    styleSelect.addEventListener('change', () => {
      const style = styleSelect.value;
      if (onStyleChange) {
        onStyleChange(style, map);
      }
    });

    // Initialize locate me button
    MapHandler.initializeLocateMe({
      buttonId: 'locateMeButton',
      map,
      marker,
      onLocationFound: (latitude, longitude) => {
        document.getElementById('lat').value = latitude;
        document.getElementById('lon').value = longitude;
        if (onMapClick) onMapClick(latitude, longitude);
      }
    });


    // Initialize search functionality
    const searchInput = document.getElementById('locationSearch');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        MapHandler.searchLocation({
          query,
          apiKey: mapConfig.apiKey,
          map,
          marker,
          onLocationFound: (lat, lng) => {
            document.getElementById('lat').value = lat;
            document.getElementById('lon').value = lng;
            if (onMapClick) onMapClick(lat, lng);
          }
        });
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          MapHandler.searchLocation({
            query,
            apiKey: mapConfig.apiKey,
            map,
            marker,
            onLocationFound: (lat, lng) => {
              document.getElementById('lat').value = lat;
              document.getElementById('lon').value = lng;
              if (onMapClick) onMapClick(lat, lng);
            }
          });
        }
      }
    });

    // Initialize skip location toggle
    const skipLocationCheckbox = document.getElementById('skipLocation');
    const locationControls = document.getElementById('locationControls');
    const mapContainer = document.getElementById('create-map');

    skipLocationCheckbox.addEventListener('change', () => {
      if (skipLocationCheckbox.checked) {
        locationControls.style.display = 'none';
        mapContainer.style.display = 'none';
        document.getElementById('lat').value = '';
        document.getElementById('lon').value = '';
      } else {
        locationControls.style.display = 'flex';
        mapContainer.style.display = 'block';
        map.invalidateSize();
      }
    });

    return { map, marker };
  }



  /**
   * Initializes camera functionality and file upload for media capture
   * @returns {Object} Object with methods to control camera
   */
  initializeCamera() {
    // Initialize camera functionality
    const cameraHandler = MediaHandler.initializeCamera({
      videoElementId: 'camera',
      canvasElementId: 'canvas',
      previewElementId: 'imagePreview',
      startButtonId: 'startCamera',
      captureButtonId: 'capturePhoto',
      retakeButtonId: 'retakePhoto',
      imageInputId: 'image'
    });

    // Initialize file upload functionality
    MediaHandler.initializeFileUpload({
      fileInputId: 'fileInput',
      previewElementId: 'uploadPreview',
      imageInputId: 'image'
    });

    // Initialize media tabs
    const showCameraOptionBtn = document.getElementById('showCameraOption');
    const showUploadOptionBtn = document.getElementById('showUploadOption');
    const cameraCaptureDiv = document.getElementById('cameraCapture');
    const fileUploadDiv = document.getElementById('fileUpload');

    showCameraOptionBtn.addEventListener('click', () => {
      cameraCaptureDiv.style.display = 'block';
      fileUploadDiv.style.display = 'none';
      showCameraOptionBtn.classList.add('active');
      showUploadOptionBtn.classList.remove('active');
      document.getElementById('uploadPreview').innerHTML = '';
    });

    showUploadOptionBtn.addEventListener('click', () => {
      cameraCaptureDiv.style.display = 'none';
      fileUploadDiv.style.display = 'block';
      showCameraOptionBtn.classList.remove('active');
      showUploadOptionBtn.classList.add('active');
      document.getElementById('imagePreview').innerHTML = '';
      cameraHandler.stopCamera();
    });

    return cameraHandler;
  }

  /**
   * Initializes form submission handling
   * Validates form data and prepares it for submission
   * @param {Function} onSubmit - Callback function for form submission
   */
  initializeForm(onSubmit) {
    const form = document.getElementById('createStoryForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const formData = new FormData();
        const imageInput = document.getElementById('image');
        const fileInput = document.getElementById('fileInput');

        if ((!imageInput.files || imageInput.files.length === 0) &&
            (!fileInput.files || fileInput.files.length === 0) &&
            !window.capturedPhoto) {
          alert('Please take a photo or upload an image first');
          return;
        }

        if (imageInput.files && imageInput.files.length > 0) {
          formData.append('photo', imageInput.files[0]);
          console.log('Using image from camera capture:', imageInput.files[0].name);
        } else if (fileInput.files && fileInput.files.length > 0) {
          formData.append('photo', fileInput.files[0]);
          console.log('Using image from file upload:', fileInput.files[0].name);
        } else if (window.capturedPhoto) {
          formData.append('photo', window.capturedPhoto);
          console.log('Using image from global variable:', window.capturedPhoto.name);
        }

        const description = document.getElementById('description').value;
        formData.append('description', description);
        console.log('Description added:', description);

        if (!document.getElementById('skipLocation').checked) {
          const lat = document.getElementById('lat').value;
          const lon = document.getElementById('lon').value;

          if (lat && lon) {
            formData.append('lat', lat);
            formData.append('lon', lon);
            console.log('Location added:', lat, lon);
          } else {
            alert('Please select a location on the map or check "Skip location"');
            return;
          }
        } else {
          console.log('Location skipped');
        }

        console.log('Form data entries:');
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

        if (onSubmit) {
          await onSubmit(formData);
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        alert('An error occurred while submitting the form. Please try again.');
      }
    });
  }
}

export default CreateStoryView;
