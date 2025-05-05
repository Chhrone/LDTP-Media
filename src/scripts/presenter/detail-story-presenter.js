import DetailStoryView from '../views/detail-story-view';
import DetailStoryModel from '../models/detail-story-model';
import AuthHelper from '../utils/auth-helper';
import { parseActivePathname } from '../routes/url-parser';
import CONFIG from '../config';

class DetailStoryPage {
  constructor() {
    this._view = new DetailStoryView();
    this._model = new DetailStoryModel();
    this._map = null;
    this._marker = null;
    this._mapConfig = {
      apiKey: CONFIG.MAPTILER_KEY,
      defaultCenter: CONFIG.DEFAULT_CENTER,
      defaultZoom: CONFIG.DEFAULT_ZOOM,
      mapStyles: CONFIG.MAP_STYLES
    };
  }

  async render() {
    // Check if user is logged in, redirect to login if not
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    // Show loading template initially
    return this._view.getLoadingTemplate();
  }

  async afterRender() {
    try {
      // Get story ID from URL
      const { id } = parseActivePathname();

      if (!id) {
        throw new Error('Story ID not found');
      }

      // Fetch story data
      const storyData = await this._model.getStoryById(id);

      // Update the view with story data
      this._updateView(storyData);

      // Initialize map if story has location data
      if (storyData.lat && storyData.lon) {
        this._initMap(storyData);
      }
    } catch (error) {
      console.error('Error rendering detail story page:', error);
      document.querySelector('.detail-story-container').innerHTML =
        this._view.getErrorTemplate(error.message);
    }
  }

  _updateView(storyData) {
    const detailContainer = document.querySelector('.detail-story-container');
    if (detailContainer) {
      detailContainer.innerHTML = this._view.getDetailTemplate(storyData);
    }
  }

  async _initMap(storyData) {
    try {
      const mapContainer = document.getElementById('detail-map');
      if (!mapContainer) return;

      // Initialize the map
      this._map = L.map('detail-map').setView([storyData.lat, storyData.lon], 10);

      // Add the base tile layer
      L.tileLayer(
        `https://api.maptiler.com/maps/${this._mapConfig.mapStyles.streets}/256/{z}/{x}/{y}.png?key=${this._mapConfig.apiKey}`,
        {
          attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }
      ).addTo(this._map);

      // Add marker for the story location
      this._marker = L.marker([storyData.lat, storyData.lon]).addTo(this._map);

      // Create popup content
      const popupContent = `
        <div class="map-popup-content">
          <div class="map-popup-title">${storyData.title}</div>
          ${storyData.location ? `
            <div class="map-popup-location">
              <i class="fas fa-map-marker-alt"></i> ${storyData.location}
            </div>
          ` : ''}
        </div>
      `;

      this._marker.bindPopup(popupContent).openPopup();

      // Refresh the map after it's visible
      setTimeout(() => {
        this._map.invalidateSize();
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
      const mapContainer = document.getElementById('detail-map');
      if (mapContainer) {
        mapContainer.innerHTML = '<p class="text-center">Failed to load map</p>';
      }
    }
  }
}

export default DetailStoryPage;
