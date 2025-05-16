import CreateStoryView from '../views/create-story-view';
import CreateStoryModel from '../models/create-story-model';
import AuthHelper from '../utils/auth-helper';
import CONFIG from '../config';
import Swal from '../utils/swal-config';

class CreateStoryPage {
  constructor() {
    this._view = new CreateStoryView();
    this._model = new CreateStoryModel();
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
        bright: 'bright-v2',
        dark: 'dataviz-dark'
      }
    };
  }

  async render() {
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    return this._view.getTemplate();
  }

  async afterRender() {
    this._cameraController = this._view.initializeCamera();

    this._mapController = await this._view.initializeMap(
      this._mapConfig,
      this._handleMapClick.bind(this),
      this._handleStyleChange.bind(this)
    );

    this._view.initializeForm(this._handleSubmit.bind(this));

    const handleBeforeUnload = () => {
      this._stopCamera();
    };

    this._hashChangeHandler = () => {
      this._stopCamera();
    };

    const handleUnload = () => {
      this._stopCamera();
    };

    this._view.initializePageEvents(
      handleBeforeUnload,
      this._hashChangeHandler,
      handleUnload
    );
  }

  _handleMapClick(lat, lng) {
    this._view.updateLocationValues(lat, lng);
  }

  _handleStyleChange(style, map) {
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

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
      const photoFile = formData.get('photo');
      if (photoFile && photoFile instanceof File && photoFile.size > 900 * 1024) {
        Swal.customFire({
          title: 'Processing Image',
          text: 'Your image is being compressed to meet size requirements...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      } else {
        Swal.customFire({
          title: 'Uploading Story',
          text: 'Please wait...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      }

      await this._model.createStory(formData);


      // Push notification will be used instead
      window.location.hash = '#/';
    } catch (error) {
      console.error('Error creating story:', error);

      if (error.message && error.message.includes('Payload content length greater than maximum allowed')) {
        Swal.customFire({
          title: 'Image Too Large',
          text: 'Your image exceeds the maximum allowed size (1MB). Please try again with a smaller image or use the built-in camera which automatically compresses images.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.customFire({
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
      this._cameraController.stopCamera();
    }
  }

  destroy() {
    this._stopCamera();

    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
    }
  }
}

export default CreateStoryPage;
