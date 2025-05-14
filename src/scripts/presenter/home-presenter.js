import HomeModel from '../models/home-model';
import HomeView from '../views/home-view';
import AuthHelper from '../utils/auth-helper';
import { parseActivePathname } from '../routes/url-parser';
import MapUtilities from '../utils/map-utilities';
import NavigationUtilities from '../utils/navigation-utilities';
import IndexedDBHelper from '../utils/indexed-db-helper';
import CONFIG from '../config';
import Swal from '../utils/swal-config';

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
    this._initSaveStoryButtons();
    await this._checkSavedStories();
    NavigationUtilities.handleReturnToStory(this._currentPage);
  }

  /**
   * Initializes save story buttons
   */
  _initSaveStoryButtons() {
    this._view.initializeSaveStoryButtons(this._handleSaveStory.bind(this));
  }

  /**
   * Checks which stories are already saved and updates UI accordingly
   */
  async _checkSavedStories() {
    try {
      const data = await this._model.getHomeData(this._currentPage);
      const stories = data.featuredStories;

      for (const story of stories) {
        const isSaved = await IndexedDBHelper.isStorySaved(story.id);
        this._view.updateSaveButtonState(story.id, isSaved);
      }
    } catch (error) {
      console.error('Error checking saved stories:', error);
    }
  }

  /**
   * Handles saving or unsaving a story
   * @param {string} storyId - The ID of the story to save or unsave
   * @returns {Promise<boolean>} - Whether the operation was successful
   */
  async _handleSaveStory(storyId) {
    try {
      // Check if story is already saved
      const isSaved = await IndexedDBHelper.isStorySaved(storyId);

      if (isSaved) {
        // If already saved, delete it (unsave)
        const success = await IndexedDBHelper.deleteStory(storyId);

        if (success) {
          Swal.customFire({
            title: 'Removed',
            text: 'Story removed from your archive',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return false; // Return false to indicate it's now unsaved
        } else {
          throw new Error('Failed to remove story from archive');
        }
      } else {
        // If not saved, save it
        const storyData = await this._model.getStoryById(storyId);
        const success = await IndexedDBHelper.saveStory(storyData);

        if (success) {
          Swal.customFire({
            title: 'Saved!',
            text: 'Story saved to your archive',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return true; // Return true to indicate it's now saved
        } else {
          throw new Error('Failed to save story');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving story:', error);
      Swal.customFire({
        title: 'Error',
        text: 'Failed to update story. Please try again.',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return isSaved; // Return the original state
    }
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
