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
    this._view.showLoading();

    try {
      const { id } = parseActivePathname();

      if (!id) {
        throw new Error('Story ID not found');
      }

      this._view.initializeSessionStorage(
        id,
        window.location.hash,
        document.referrer
      );

      const storyData = await this._model.getStoryById(id);
      this._view.updateView(storyData);

      if (storyData.lat && storyData.lon) {
        await this._initMap(storyData);
      }

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
      const { map, marker } = await this._view.initializeMap(storyData, this._mapConfig);
      this._map = map;
      this._marker = marker;

      if (map && marker) {
        const locationInfo = await getDetailedLocation(storyData.lat, storyData.lon);
        this._view.updateMapMarkerPopup(marker, storyData, locationInfo);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
}

export default DetailStoryPage;
