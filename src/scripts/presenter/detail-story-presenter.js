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
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    return this._view.getTemplate();
  }

  async afterRender() {
    const contentContainer = document.querySelector('.detail-story-content-container');
    if (contentContainer) {
      contentContainer.innerHTML = this._view.getLoadingTemplate();
    }

    try {
      const { id } = parseActivePathname();

      if (!id) {
        throw new Error('Story ID not found');
      }

      sessionStorage.setItem('lastViewedStoryId', id);

      const currentPath = window.location.hash;
      const referrerPath = document.referrer;

      const pageMatch = currentPath.match(/#\/page\/(\d+)/);
      if (pageMatch && pageMatch[1]) {
        sessionStorage.setItem('lastViewedPage', pageMatch[1]);
      } else {
        const referrerPageMatch = referrerPath.match(/page\/(\d+)/);
        if (referrerPageMatch && referrerPageMatch[1]) {
          sessionStorage.setItem('lastViewedPage', referrerPageMatch[1]);
        } else {
          const currentPage = sessionStorage.getItem('lastViewedPage') || '1';
          sessionStorage.setItem('lastViewedPage', currentPage);
        }
      }

      // Fetch story data
      const storyData = await this._model.getStoryById(id);

      this._updateView(storyData);

      if (storyData.lat && storyData.lon) {
        this._initMap(storyData);
      }

      // Add event listener to the back button to navigate to the correct page
      const backButton = document.getElementById('back-to-stories');
      if (backButton) {
        backButton.addEventListener('click', (event) => {
          event.preventDefault();
          const lastPage = sessionStorage.getItem('lastViewedPage');
          if (lastPage && lastPage !== '1') {
            window.location.hash = `/page/${lastPage}`;
          } else {
            window.location.hash = '/';
          }
        });
      }
    } catch (error) {
      console.error('Error rendering detail story page:', error);
      const contentContainer = document.querySelector('.detail-story-content-container');
      if (contentContainer) {
        contentContainer.innerHTML = this._view.getErrorTemplate(error.message);
      }
    }
  }

  _updateView(storyData) {
    const contentContainer = document.querySelector('.detail-story-content-container');
    if (contentContainer) {
      contentContainer.innerHTML = this._view.getDetailTemplate(storyData);
    }
  }

  async _initMap(storyData) {
    try {
      const mapContainer = document.getElementById('detail-map');
      if (!mapContainer) return;

      this._map = L.map('detail-map').setView([storyData.lat, storyData.lon], 10);

      L.tileLayer(
        `https://api.maptiler.com/maps/${this._mapConfig.mapStyles.streets}/256/{z}/{x}/{y}.png?key=${this._mapConfig.apiKey}`,
        {
          attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }
      ).addTo(this._map);

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
