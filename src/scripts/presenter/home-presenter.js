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
    this._view.initializeHeroCTAEvents();
  }

  /**
   * Initializes the locate me button functionality
   */
  _initLocateMeButton() {
    this._view.initializeLocateMeButton(async (latitude, longitude) => {
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
          if (this._userLocationMarker) {
            this._userLocationMarker.openPopup();
          }
        }, 1600);
      }
    });
  }

  /**
   * Initializes the map with story markers
   */
  async _initMap() {
    try {
      const data = await this._model.getHomeData(this._currentPage);
      const stories = data.featuredStories;

      const { map, markers } = await this._view.initializeMap({
        stories,
        currentMapStyle: this._currentMapStyle,
        mapStyles: this._mapStyles,
        config: CONFIG
      });

      this._map = map;
      this._markers = markers;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  /**
   * Initializes map style control buttons
   */
  _initMapStyleControls() {
    this._view.initializeMapStyleControls((style) => {
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
  }

  /**
   * Initializes pagination links with event handlers
   */
  _initPaginationEvents() {
    this._view.initializePaginationEvents((page) => {
      if (page !== this._currentPage) {
        if (this._map) {
          this._map.remove();
          this._map = null;
          this._markers = [];
          this._userLocationMarker = null;
        }

        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = `/page/${page}`;
          });
        } else {
          window.location.hash = `/page/${page}`;
        }
      }
    });
  }
}

export default HomePage;
