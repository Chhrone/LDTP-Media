import DetailStoryView from '../views/detail-story-view';
import DetailStoryModel from '../models/detail-story-model';
import AuthHelper from '../utils/auth-helper';
import { parseActivePathname } from '../routes/url-parser';
import { getDetailedLocation } from '../utils/geocoding-service';
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
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    return this._view.getTemplate();
  }

  async afterRender() {
    // Show loading state
    this._view.showLoading();

    try {
      const { id } = parseActivePathname();

      if (!id) {
        throw new Error('Story ID not found');
      }

      // Initialize session storage for navigation
      this._view.initializeSessionStorage(
        id,
        window.location.hash,
        document.referrer
      );

      // Fetch story data
      const storyData = await this._model.getStoryById(id);

      // Update the view with story data
      this._view.updateView(storyData);

      // Initialize map if location data exists
      if (storyData.lat && storyData.lon) {
        await this._initMap(storyData);
      }

      // Initialize back button
      this._initBackButton();
    } catch (error) {
      console.error('Error rendering detail story page:', error);
      this._view.showError(error.message);
    }
  }

  _initBackButton() {
    this._view.initializeBackButton(() => {
      const lastPage = sessionStorage.getItem('lastViewedPage');
      if (lastPage && lastPage !== '1') {
        window.location.hash = `/page/${lastPage}`;
      } else {
        window.location.hash = '/';
      }
    });
  }

  async _initMap(storyData) {
    try {
      // Initialize map through view
      const { map, marker } = await this._view.initializeMap(storyData, this._mapConfig);

      // Store map and marker references
      this._map = map;
      this._marker = marker;

      if (map && marker) {
        // Get detailed location information
        const locationInfo = await getDetailedLocation(storyData.lat, storyData.lon);

        // Update marker popup with location information
        this._view.updateMapMarkerPopup(marker, storyData, locationInfo);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
}

export default DetailStoryPage;
