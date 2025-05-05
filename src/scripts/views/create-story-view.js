import { getLocationString } from '../utils/geocoding-service';

class CreateStoryView {
  getTemplate() {
    return `
      <div class="container">
        <div class="create-story-page">
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
                    <option value="vintage">Vintage</option>
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

  async initializeMap(mapConfig, onMapClick, onStyleChange) {
    const map = L.map('create-map').setView(mapConfig.defaultCenter, mapConfig.defaultZoom);
    let marker = null;

    // Add the base tile layer
    L.tileLayer(
      `https://api.maptiler.com/maps/${mapConfig.mapStyles.streets}/256/{z}/{x}/{y}.png?key=${mapConfig.apiKey}`,
      {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }
    ).addTo(map);

    // Add click event to the map
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      // Update or add marker
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        // Create custom icon for marker
        const customIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<i class="fas fa-user-circle"></i>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      }

      // Get location string and add popup
      try {
        const locationString = await getLocationString(lat, lng);
        const popupContent = `
          <div class="map-popup-content">
            <div class="map-popup-title">Your Location</div>
            <div class="map-popup-location">
              <i class="fas fa-map-marker-alt"></i> ${locationString}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        // Open popup on hover and close on mouseout
        marker.on('mouseover', function() {
          this.openPopup();
        });
        marker.on('mouseout', function() {
          this.closePopup();
        });
      } catch (error) {
        console.error('Error getting location string:', error);
      }

      // Call the callback function
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    // Initialize style dropdown
    const styleSelect = document.getElementById('mapStyleSelect');
    styleSelect.addEventListener('change', () => {
      // Get the selected style
      const style = styleSelect.value;

      // Call the callback function
      if (onStyleChange) {
        onStyleChange(style, map);
      }
    });

    // Initialize locate me button
    const locateMeButton = document.getElementById('locateMeButton');
    if (locateMeButton) {
      locateMeButton.addEventListener('click', async () => {
        // Check if geolocation is available
        if (!navigator.geolocation) {
          alert('Location services are not supported by your browser');
          return;
        }

        // Show loading state
        locateMeButton.classList.add('loading');
        locateMeButton.innerHTML = '<i class="fas fa-spinner"></i> Locating...';

        try {
          // Request user location
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });

          const { latitude, longitude } = position.coords;

          // Update the map view
          map.setView([latitude, longitude], 13);

          // Update or add marker
          if (marker) {
            marker.setLatLng([latitude, longitude]);
          } else {
            // Create custom icon for marker
            const customIcon = L.divIcon({
              className: 'user-location-marker',
              html: '<i class="fas fa-user-circle"></i>',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });

            marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
          }

          // Get location string and add popup
          try {
            const locationString = await getLocationString(latitude, longitude);
            const popupContent = `
              <div class="map-popup-content">
                <div class="map-popup-title">Your Location</div>
                <div class="map-popup-location">
                  <i class="fas fa-map-marker-alt"></i> ${locationString}
                </div>
              </div>
            `;
            marker.bindPopup(popupContent);

            // Open popup on hover and close on mouseout
            marker.on('mouseover', function() {
              this.openPopup();
            });
            marker.on('mouseout', function() {
              this.closePopup();
            });

            // Open popup initially
            marker.openPopup();
          } catch (error) {
            console.error('Error getting location string:', error);
          }

          // Update hidden inputs
          document.getElementById('lat').value = latitude;
          document.getElementById('lon').value = longitude;

          // Call the callback function
          if (onMapClick) {
            onMapClick(latitude, longitude);
          }
        } catch (error) {
          console.error('Error getting location:', error);

          // Handle specific error cases
          if (error.code === 1) {
            // Permission denied
            alert('Please enable location services in your browser to use this feature');
          } else if (error.code === 2) {
            // Position unavailable
            alert('Unable to determine your location. Please try again later');
          } else if (error.code === 3) {
            // Timeout
            alert('Location request timed out. Please try again');
          } else {
            // Generic error
            alert('Unable to access your location');
          }
        } finally {
          // Always reset button state
          locateMeButton.classList.remove('loading');
          locateMeButton.innerHTML = '<i class="fas fa-location-arrow"></i> Locate Me';
        }
      });
    }


    // Initialize search functionality
    const searchInput = document.getElementById('locationSearch');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        this.searchLocation(query, mapConfig.apiKey, map, marker);
      }
    });

    // Also search when Enter key is pressed
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          this.searchLocation(query, mapConfig.apiKey, map, marker);
        }
      }
    });

    // Initialize skip location toggle
    const skipLocationCheckbox = document.getElementById('skipLocation');
    const locationControls = document.getElementById('locationControls');
    const mapContainer = document.getElementById('create-map');

    // Add event listener to checkbox
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

  async searchLocation(query, apiKey, map, marker) {
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const location = data.features[0];
        const [lng, lat] = location.center;

        // Update the map view
        map.setView([lat, lng], 13);

        // Update or add marker
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          // Create custom icon for marker
          const customIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<i class="fas fa-user-circle"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        }

        // Get location string and add popup
        try {
          const locationString = await getLocationString(lat, lng);
          const popupContent = `
            <div class="map-popup-content">
              <div class="map-popup-title">Your Location</div>
              <div class="map-popup-location">
                <i class="fas fa-map-marker-alt"></i> ${locationString}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);

          // Open popup on hover and close on mouseout
          marker.on('mouseover', function() {
            this.openPopup();
          });
          marker.on('mouseout', function() {
            this.closePopup();
          });

          // Open popup initially
          marker.openPopup();
        } catch (error) {
          console.error('Error getting location string:', error);
        }

        // Update hidden inputs
        document.getElementById('lat').value = lat;
        document.getElementById('lon').value = lng;
      } else {
        // Show error message
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location. Please try again.');
    }
  }

  initializeCamera() {
    const startCameraButton = document.getElementById('startCamera');
    const capturePhotoButton = document.getElementById('capturePhoto');
    const retakePhotoButton = document.getElementById('retakePhoto');
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    const imagePreview = document.getElementById('imagePreview');

    let stream = null;
    let cameraActive = false;

    startCameraButton.addEventListener('click', async () => {
      if (!cameraActive) {
        // Open camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment'
            },
            audio: false
          });

          video.srcObject = stream;

          // Wait for video metadata to load to get the actual dimensions
          video.onloadedmetadata = () => {
            // Set the camera container height based on video aspect ratio
            const cameraContainer = document.querySelector('.camera-container');
            if (cameraContainer) {
              // Maintain aspect ratio while setting a max height
              const aspectRatio = video.videoWidth / video.videoHeight;
              const containerWidth = cameraContainer.clientWidth;
              const calculatedHeight = containerWidth / aspectRatio;

              // Apply a max height if needed
              if (calculatedHeight > 500) {
                cameraContainer.style.height = '500px';
              } else {
                cameraContainer.style.height = calculatedHeight + 'px';
              }
            }
          };

          cameraActive = true;
          startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Close Camera';
          capturePhotoButton.disabled = false;
        } catch (error) {
          console.error('Cannot access camera:', error);
          alert('Cannot access camera. Please make sure you have granted camera permissions.');
        }
      } else {
        // Close camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
          video.srcObject = null;
        }
        cameraActive = false;
        startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
        capturePhotoButton.disabled = true;
      }
    });

    capturePhotoButton.addEventListener('click', () => {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and create preview with compression
      // Use a lower quality (0.7) to reduce file size
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);

        // Create image element with natural dimensions
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = "Captured photo";

        // Clear previous content and add the new image
        imagePreview.innerHTML = '';
        imagePreview.appendChild(img);

        // Create a file from blob for form submission
        const fileName = `photo_${Date.now()}.jpg`;
        const imageFile = new File([blob], fileName, { type: 'image/jpeg' });

        // Log the file size for debugging
        console.log('Camera capture: Original file size:', imageFile.size / 1024, 'KB');

        try {
          // Update the hidden input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(imageFile);
          const imageInput = document.getElementById('image');
          imageInput.files = dataTransfer.files;
          console.log('Camera capture: File added to input', imageFile.name);
        } catch (error) {
          console.error('Error setting file to input:', error);
          // Fallback method for browsers that don't support DataTransfer
          // Store the file in a global variable that can be accessed during form submission
          window.capturedPhoto = imageFile;
          console.log('Camera capture: File stored in global variable', imageFile.name);
        }

        // Update button states
        capturePhotoButton.disabled = true;
        retakePhotoButton.disabled = false;

        // Stop the camera after taking the photo
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
          video.srcObject = null;
          cameraActive = false;
          startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
        }
      }, 'image/jpeg', 0.7); // Set quality to 0.7 (70%) to reduce file size
    });

    retakePhotoButton.addEventListener('click', () => {
      // Clear the preview
      imagePreview.innerHTML = '';

      // Update button states
      retakePhotoButton.disabled = true;

      // Clear the hidden input
      document.getElementById('image').value = '';

      // Inform the user they need to open the camera again
      alert('Please open the camera again to take a new photo');
    });

    // Initialize file upload
    const fileInput = document.getElementById('fileInput');
    const uploadPreview = document.getElementById('uploadPreview');

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        // Check file size and show warning for large files
        const fileSizeKB = file.size / 1024;
        console.log('Uploaded file size:', fileSizeKB, 'KB');

        // Show file size warning for large files
        if (fileSizeKB > 900) {
          const warningElement = document.createElement('div');
          warningElement.className = 'file-size-warning';
          warningElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Large image (${Math.round(fileSizeKB)} KB). Will be compressed before upload.
          `;

          // Add the warning to the DOM after the preview is created
          setTimeout(() => {
            const previewContainer = document.getElementById('uploadPreview');
            if (previewContainer && !previewContainer.querySelector('.file-size-warning')) {
              previewContainer.appendChild(warningElement);
            }
          }, 100);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          // Create image element with natural dimensions
          const img = document.createElement('img');
          img.src = e.target.result;
          img.alt = "Uploaded image";

          // Clear previous content and add the new image
          uploadPreview.innerHTML = '';
          uploadPreview.appendChild(img);

          // Update the hidden input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          document.getElementById('image').files = dataTransfer.files;
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the preview if no file is selected
        uploadPreview.innerHTML = '';
        document.getElementById('image').value = '';
      }
    });

    // Initialize media tabs
    const showCameraOptionBtn = document.getElementById('showCameraOption');
    const showUploadOptionBtn = document.getElementById('showUploadOption');
    const cameraCaptureDiv = document.getElementById('cameraCapture');
    const fileUploadDiv = document.getElementById('fileUpload');

    showCameraOptionBtn.addEventListener('click', () => {
      // Switch display
      cameraCaptureDiv.style.display = 'block';
      fileUploadDiv.style.display = 'none';

      // Update active tab
      showCameraOptionBtn.classList.add('active');
      showUploadOptionBtn.classList.remove('active');

      // Clear upload preview when switching to camera tab
      uploadPreview.innerHTML = '';
    });

    showUploadOptionBtn.addEventListener('click', () => {
      // Switch display
      cameraCaptureDiv.style.display = 'none';
      fileUploadDiv.style.display = 'block';

      // Update active tab
      showCameraOptionBtn.classList.remove('active');
      showUploadOptionBtn.classList.add('active');

      // Clear camera preview when switching to upload tab
      imagePreview.innerHTML = '';

      // Stop camera if it's active
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
        cameraActive = false;
        startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
      }

      // Reset camera buttons
      capturePhotoButton.disabled = true;
      retakePhotoButton.disabled = true;
    });

    return {
      stopCamera: () => {
        console.log('Stopping camera from create-story-view');
        if (stream) {
          console.log('Camera stream exists, stopping tracks');
          stream.getTracks().forEach(track => {
            console.log('Stopping track:', track.kind);
            track.stop();
          });
          stream = null;
          video.srcObject = null;

          // Reset button states and camera active flag
          cameraActive = false;
          startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Open Camera';
          capturePhotoButton.disabled = true;
        } else {
          console.log('No camera stream to stop');
        }
      }
    };
  }

  initializeForm(onSubmit) {
    const form = document.getElementById('createStoryForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      try {
        const formData = new FormData();
        const imageInput = document.getElementById('image');
        const fileInput = document.getElementById('fileInput');

        // Check if an image was captured or uploaded
        if ((!imageInput.files || imageInput.files.length === 0) &&
            (!fileInput.files || fileInput.files.length === 0) &&
            !window.capturedPhoto) {
          alert('Please take a photo or upload an image first');
          return;
        }

        // Add the image to the form data
        if (imageInput.files && imageInput.files.length > 0) {
          formData.append('photo', imageInput.files[0]);
          console.log('Using image from camera capture:', imageInput.files[0].name);
        } else if (fileInput.files && fileInput.files.length > 0) {
          formData.append('photo', fileInput.files[0]);
          console.log('Using image from file upload:', fileInput.files[0].name);
        } else if (window.capturedPhoto) {
          // Use the photo stored in the global variable (fallback method)
          formData.append('photo', window.capturedPhoto);
          console.log('Using image from global variable:', window.capturedPhoto.name);
        }

        // Add the description to the form data
        const description = document.getElementById('description').value;
        formData.append('description', description);
        console.log('Description added:', description);

        // Add location data if not skipped
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

        // Log all form data for debugging
        console.log('Form data entries:');
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

        // Call the submit callback
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
