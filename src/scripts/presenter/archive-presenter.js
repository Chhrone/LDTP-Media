import ArchiveView from '../views/archive-view';
import ArchiveModel from '../models/archive-model';
import AuthHelper from '../utils/auth-helper';
import Swal from '../utils/swal-config';

class ArchivePage {
  constructor() {
    this._view = new ArchiveView();
    this._model = new ArchiveModel();
  }

  /**
   * Render the archive page
   * @returns {string} The HTML template
   */
  async render() {
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    return this._view.getTemplate();
  }

  /**
   * After render hook
   * Loads saved stories and sets up event listeners
   */
  async afterRender() {
    this._view.showLoading();
    this._view.setUnsaveStoryCallback(this._handleUnsaveStory.bind(this));

    try {
      const savedStories = await this._model.getSavedStories();
      this._view.updateView(savedStories);
    } catch (error) {
      console.error('Error rendering archive page:', error);
      this._view.showError(error.message);
    }
  }

  /**
   * Handle unsaving a story
   * @param {string} storyId - The ID of the story to unsave
   */
  async _handleUnsaveStory(storyId) {
    try {
      const success = await this._model.deleteStory(storyId);

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

        // Refresh the view
        const savedStories = await this._model.getSavedStories();
        this._view.updateView(savedStories);
      } else {
        throw new Error('Failed to remove story from archive');
      }
    } catch (error) {
      console.error('Error unsaving story:', error);
      Swal.customFire({
        title: 'Error',
        text: 'Failed to remove story. Please try again.',
        icon: 'error',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  /**
   * Clean up resources when the page is destroyed
   */
  destroy() {
    // Clean up any resources or event listeners
  }
}

export default ArchivePage;
