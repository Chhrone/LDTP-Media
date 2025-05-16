import DetailStoryView from '../views/detail-story-view';
import DetailStoryModel from '../models/detail-story-model';
import AuthHelper from '../utils/auth-helper';
import { parseActivePathname } from '../routes/url-parser';
import { getDetailedLocation } from '../utils/geocoding-service';
import IndexedDBHelper from '../utils/indexed-db-helper';
import CONFIG from '../config';
import Swal from '../utils/swal-config';

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
      this._initSaveButton();
      await this._checkIfStorySaved(id);
    } catch (error) {
      console.error('Error rendering detail story page:', error);
      this._view.showError(error.message);
    }
  }

  _initBackButton() {
    this._view.initializeBackButton(() => {
      // Check the referrer to determine where to go back to
      const referrer = sessionStorage.getItem('storyReferrer');

      if (referrer === 'archive') {
        // If came from archive, go back to archive
        window.location.hash = '/archive';
      } else if (referrer === 'pagination') {
        // If came from a pagination page, go back to that page
        const lastPage = sessionStorage.getItem('lastViewedPage');
        if (lastPage && lastPage !== '1') {
          window.location.hash = `/page/${lastPage}`;
        } else {
          window.location.hash = '/';
        }
      } else {
        // Default: go back to home or specific page
        const lastPage = sessionStorage.getItem('lastViewedPage');
        if (lastPage && lastPage !== '1') {
          window.location.hash = `/page/${lastPage}`;
        } else {
          window.location.hash = '/';
        }
      }
    });
  }

  /**
   * Initializes the save button with a click handler
   */
  _initSaveButton() {
    this._view.initializeSaveButton(this._handleSaveStory.bind(this));
  }

  /**
   * Checks if the story is already saved and updates the UI accordingly
   * @param {string} storyId - The ID of the story to check
   */
  async _checkIfStorySaved(storyId) {
    try {
      const isSaved = await IndexedDBHelper.isStorySaved(storyId);
      this._view.updateSaveButtonState(isSaved);
    } catch (error) {
      console.error('Error checking if story is saved:', error);
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
