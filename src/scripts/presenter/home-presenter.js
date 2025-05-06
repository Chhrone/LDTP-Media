import HomeModel from '../models/home-model';
import HomeView from '../views/home-view';
import AuthHelper from '../utils/auth-helper';
import { parseActivePathname } from '../routes/url-parser';
import MapUtilities from '../utils/map-utilities';
import NavigationUtilities from '../utils/navigation-utilities';
import CONFIG from '../config';

class HomePage {
  constructor() {
    this._model = new HomeModel();
    this._view = new HomeView();
    this._currentPage = 1;
    this._map = null;
    this._markers = [];
    this._userLocationMarker = null;
    this._currentMapStyle = 'streets';
    this._mapStyles = {
      streets: 'streets-v2',
      outdoor: 'outdoor-v2',
      aquarelle: 'winter',
      bright: 'bright-v2',
      dark: 'dataviz-dark'
    };
  }

  /**
   * Renders the home page template
   * @returns {string} The HTML template
   */
  async render() {
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    const { page } = parseActivePathname();
    if (page && !isNaN(parseInt(page, 10))) {
      this._currentPage = parseInt(page, 10);
    } else {
      this._currentPage = 1;
    }

    sessionStorage.setItem('lastViewedPage', this._currentPage.toString());

    try {
      const data = await this._model.getHomeData(this._currentPage);
      return this._view.getTemplate(data);
    } catch (error) {
      console.error('Error rendering home page:', error);
      return '<div class="container"><h2>Failed to load home page</h2></div>';
    }
  }

  /**
   * Initializes components after the page is rendered
   */
  async afterRender() {
    this._initPaginationEvents();
    await this._initMap();
    this._initMapStyleControls();
    this._initLocateMeButton();
    this._initHeroCTAEvents();

    NavigationUtilities.handleReturnToStory(this._currentPage);
  }



  /**
   * Initializes hero section call-to-action buttons
   */
  _initHeroCTAEvents() {
    NavigationUtilities.setupSmoothScrolling('.hero-btn-secondary', '#map-section');
  }

  /**
   * Initializes the locate me button functionality
   */
  _initLocateMeButton() {
    const locateButton = document.getElementById('locate-me-button');
    if (!locateButton) return;

    locateButton.addEventListener('click', async () => {
      if (!navigator.geolocation) {
        MapUtilities.showMapNotification('Location services are not supported by your browser', 'map-container');
        return;
      }

      locateButton.classList.add('loading');
      locateButton.innerHTML = '<i class="fas fa-spinner"></i> Locating...';

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;

        if (this._map) {
          this._userLocationMarker = await MapUtilities.createUserLocationMarker(
            this._map,
            latitude,
            longitude,
            this._userLocationMarker
          );

          this._map.flyTo([latitude, longitude], 13, {
            animate: true,
            duration: 1.5
          });

          setTimeout(() => {
            this._userLocationMarker.openPopup();
          }, 1600);
        }
      } catch (error) {
        console.error('Error getting location:', error);

        if (error.code === 1) {
          MapUtilities.showMapNotification('Please enable location services in your browser to use this feature', 'map-container');
        } else if (error.code === 2) {
          MapUtilities.showMapNotification('Unable to determine your location. Please try again later', 'map-container');
        } else if (error.code === 3) {
          MapUtilities.showMapNotification('Location request timed out. Please try again', 'map-container');
        } else {
          MapUtilities.showMapNotification('Unable to access your location', 'map-container');
        }
      } finally {
        locateButton.classList.remove('loading');
        locateButton.innerHTML = '<i class="fas fa-location-arrow"></i> Locate Me';
      }
    });
  }



  /**
   * Initializes the map with story markers
   */
  async _initMap() {
    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) return;

      // Get stories data for the current page
      const data = await this._model.getHomeData(this._currentPage);
      const stories = data.featuredStories;

      // Filter stories with location data for the map
      const storiesWithLocation = stories.filter(story => story.lat && story.lon);

      // Show message if no stories have location data
      if (storiesWithLocation.length === 0) {
        const messageElement = document.createElement('div');
        messageElement.className = 'map-message';
        messageElement.innerHTML = '<p>No location data available for stories on this page.</p>';
        mapContainer.appendChild(messageElement);
      }

      // Initialize the map using MapUtilities
      maptilersdk.config.apiKey = CONFIG.MAPTILER_KEY;

      const { map, markers } = MapUtilities.initializeMap({
        containerId: 'map-container',
        config: CONFIG,
        currentStyle: this._currentMapStyle,
        mapStyles: this._mapStyles,
        stories: storiesWithLocation
      });

      this._map = map;
      this._markers = markers;

      // Add a message to inform users about scroll zoom
      const zoomInfoElement = document.createElement('div');
      zoomInfoElement.className = 'map-zoom-info';
      zoomInfoElement.innerHTML = '<i class="fas fa-mouse"></i> Scroll to zoom in/out';
      mapContainer.appendChild(zoomInfoElement);

      // Hide the zoom info after 5 seconds
      setTimeout(() => {
        zoomInfoElement.classList.add('fade-out');
        setTimeout(() => {
          zoomInfoElement.remove();
        }, 1000);
      }, 5000);

    } catch (error) {
      console.error('Error initializing map:', error);
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        mapContainer.innerHTML = '<p class="text-center">Failed to load map. Please try again later.</p>';
      }
    }
  }



  /**
   * Initializes map style control buttons
   */
  _initMapStyleControls() {
    const styleButtons = document.querySelectorAll('.map-style-button');

    styleButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('active')) return;

        styleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const style = button.dataset.style;
        this._currentMapStyle = style;

        if (this._map) {
          MapUtilities.updateMapStyle(
            this._map,
            style,
            this._mapStyles,
            CONFIG.MAPTILER_KEY
          );
        }
      });
    });
  }

  /**
   * Initializes pagination links with event handlers
   */
  _initPaginationEvents() {
    NavigationUtilities.setupPaginationLinks((page) => {
      if (page !== this._currentPage) {
        // Clean up map before navigation
        if (this._map) {
          this._map.remove();
          this._map = null;
          this._markers = [];
          this._userLocationMarker = null;
        }

        // Navigate to the new page
        window.location.hash = `/page/${page}`;
      }
    });
  }
}

export default HomePage;
