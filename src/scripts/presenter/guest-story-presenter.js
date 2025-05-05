import CreateStoryView from '../views/create-story-view';
import GuestStoryModel from '../models/guest-story-model';
import CONFIG from '../config';
import Swal from 'sweetalert2';

class GuestStoryPage {
  constructor() {
    this._view = new CreateStoryView();
    this._model = new GuestStoryModel();
    this._cameraController = null;
    this._mapController = null;
    this._mapConfig = {
      apiKey: CONFIG.MAPTILER_KEY,
      defaultCenter: [0, 0],
      defaultZoom: 2,
      mapStyles: {
        streets: 'streets-v2',
        outdoor: 'outdoor-v2',
        aquarelle: 'winter',
        vintage: 'vintage',
        dark: 'dataviz-dark'
      }
    };
  }

  async render() {
    // No auth check for guest story
    return this._view.getTemplate();
  }

  async afterRender() {
    // Initialize camera functionality
    this._cameraController = this._view.initializeCamera();

    // Initialize map functionality
    this._mapController = await this._view.initializeMap(
      this._mapConfig,
      this._handleMapClick.bind(this),
      this._handleStyleChange.bind(this)
    );

    // Initialize form submission
    this._view.initializeForm(this._handleSubmit.bind(this));

    // Add event listeners to stop camera when navigating away
    window.addEventListener('beforeunload', () => {
      console.log('beforeunload event - stopping camera');
      this._stopCamera();
    });

    // Use a named function for the hashchange event so we can remove it later
    this._hashChangeHandler = () => {
      console.log('hashchange event - stopping camera');
      this._stopCamera();
    };

    window.addEventListener('hashchange', this._hashChangeHandler);

    // Also add a cleanup method to be called when the component is destroyed
    document.addEventListener('DOMContentLoaded', () => {
      // This ensures the camera is stopped when the page is reloaded or closed
      window.addEventListener('unload', () => {
        console.log('unload event - stopping camera');
        this._stopCamera();
      });
    });
  }

  _handleMapClick(lat, lng) {
    // Update hidden inputs
    document.getElementById('lat').value = lat;
    document.getElementById('lon').value = lng;
  }

  _handleStyleChange(style, map) {
    // Remove current tile layer
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer
    L.tileLayer(
      `https://api.maptiler.com/maps/${this._mapConfig.mapStyles[style]}/256/{z}/{x}/{y}.png?key=${this._mapConfig.apiKey}`,
      {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }
    ).addTo(map);
  }

  async _handleSubmit(formData) {
    try {
      // Check if the image is large and might need compression
      const photoFile = formData.get('photo');
      if (photoFile && photoFile instanceof File && photoFile.size > 900 * 1024) {
        // Show compression notification
        Swal.fire({
          title: 'Processing Image',
          text: 'Your image is being compressed to meet size requirements...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      } else {
        // Show regular loading state
        Swal.fire({
          title: 'Uploading Story',
          text: 'Please wait...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      }

      // Submit the story as guest (compression happens in the model)
      await this._model.createGuestStory(formData);

      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Your story has been uploaded successfully.',
        icon: 'success',
        confirmButtonText: 'Go to Home'
      }).then(() => {
        // Navigate to home page
        window.location.hash = '#/';
      });
    } catch (error) {
      console.error('Error creating story:', error);

      // Check if it's a payload size error
      if (error.message && error.message.includes('Payload content length greater than maximum allowed')) {
        // Show specific error message for large files
        Swal.fire({
          title: 'Image Too Large',
          text: 'Your image exceeds the maximum allowed size (1MB). Please try again with a smaller image or use the built-in camera which automatically compresses images.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        // Show generic error message
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to upload story. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  }

  _stopCamera() {
    if (this._cameraController && this._cameraController.stopCamera) {
      console.log('Stopping camera from guest-story-presenter');
      this._cameraController.stopCamera();
    }
  }

  // Method to clean up resources when the page is destroyed
  destroy() {
    console.log('Destroying guest-story-presenter');
    // Remove event listeners
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
    }

    // Stop the camera
    this._stopCamera();
  }
}

export default GuestStoryPage;
