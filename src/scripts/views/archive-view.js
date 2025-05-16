import { formatSimpleDate } from '../utils/index';

class ArchiveView {
  constructor() {
    this.formatSimpleDate = formatSimpleDate;
  }

  /**
   * Get the template for the archive page
   * @returns {string} The HTML template
   */
  getTemplate() {
    return `
      <div class="container" style="view-transition-name: archive-page">
        <section class="archive-page">
          <h1 class="page-title">Saved Stories</h1>
          <div id="archive-content" class="archive-content">
            <!-- Archive content will be loaded here -->
          </div>
        </section>
      </div>
    `;
  }

  /**
   * Get the template for the loading state
   * @returns {string} The HTML template
   */
  getLoadingTemplate() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading saved stories...</p>
      </div>
    `;
  }

  /**
   * Get the template for the empty state
   * @returns {string} The HTML template
   */
  getEmptyTemplate() {
    return `
      <div class="empty-state">
        <i class="fas fa-bookmark empty-icon"></i>
        <h2>No Saved Stories</h2>
        <p>You haven't saved any stories yet. Browse stories and click the save button to add them here.</p>
        <a href="#/" class="btn">Browse Stories</a>
      </div>
    `;
  }

  /**
   * Get the template for the error state
   * @param {string} message - The error message
   * @returns {string} The HTML template
   */
  getErrorTemplate(message = 'Failed to load saved stories. Please try again later.') {
    return `
      <div class="error-container">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="#/" class="btn">Back to Home</a>
      </div>
    `;
  }

  /**
   * Get the template for the saved stories list
   * @param {Array} stories - The saved stories
   * @returns {string} The HTML template
   */
  getSavedStoriesTemplate(stories) {
    return `
      <h2>Your Saved Stories</h2>
      <div id="saved-stories-list" class="stories-list">
        ${stories.map(story => this._createStoryCardTemplate(story)).join('')}
      </div>
    `;
  }

  /**
   * Create a story card template
   * @param {Object} story - The story object
   * @returns {string} The HTML template
   */
  _createStoryCardTemplate(story) {
    return `
      <article class="story-card" data-story-id="${story.id}" style="view-transition-name: story-card-${story.id}">
        ${story.photo ? `<figure class="story-image" style="view-transition-name: story-image-${story.id}">
          <img src="${story.photo}" alt="${story.title}" loading="lazy" crossorigin="anonymous">
          <figcaption class="visually-hidden">${story.title}</figcaption>
        </figure>` : ''}
        <div class="story-content" style="view-transition-name: story-content-${story.id}">
          <h3 style="view-transition-name: story-title-${story.id}">${story.title}</h3>
          <p>${story.description ? this._createExcerpt(story.description) : ''}</p>

          <div class="story-divider"></div>

          <div class="story-info">
            <div class="left-info">
              <div class="story-date">
                <i class="fas fa-calendar-alt"></i> <time datetime="${story.createdAt}">${this.formatSimpleDate(story.createdAt)}</time>
              </div>
            </div>
            <div class="right-info">
              <div class="story-actions">
                <button class="btn-icon save-story-btn saved" data-story-id="${story.id}" title="Remove from archive">
                  <i class="fas fa-bookmark saved"></i>
                </button>
                <a href="#/story/${story.id}" class="story-action-link" data-story-id="${story.id}">Read More</a>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Create an excerpt from a description
   * @param {string} description - The full description
   * @param {number} maxLength - The maximum length of the excerpt
   * @returns {string} The excerpt
   */
  _createExcerpt(description, maxLength = 150) {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  }

  /**
   * Show the loading state
   */
  showLoading() {
    const archiveContent = document.getElementById('archive-content');
    if (archiveContent) {
      archiveContent.innerHTML = this.getLoadingTemplate();
    }
  }

  /**
   * Show the error state
   * @param {string} message - The error message
   */
  showError(message) {
    const archiveContent = document.getElementById('archive-content');
    if (archiveContent) {
      archiveContent.innerHTML = this.getErrorTemplate(message);
    }
  }

  /**
   * Update the view with saved stories
   * @param {Array} stories - The saved stories
   */
  updateView(stories) {
    const archiveContent = document.getElementById('archive-content');
    if (archiveContent) {
      if (stories.length === 0) {
        archiveContent.innerHTML = this.getEmptyTemplate();
      } else {
        archiveContent.innerHTML = this.getSavedStoriesTemplate(stories);
        this._initUnsaveButtons();
      }
    }
  }

  /**
   * Initialize unsave buttons
   */
  _initUnsaveButtons() {
    const unsaveButtons = document.querySelectorAll('.save-story-btn');
    unsaveButtons.forEach(button => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const storyId = button.dataset.storyId;

        // Immediately hide the story card for instant feedback
        const storyCard = button.closest('.story-card');
        if (storyCard) {
          storyCard.style.opacity = '0.5';
          storyCard.style.transition = 'opacity 0.3s ease';
        }

        // Call the unsave function
        if (this.onUnsaveStory) {
          await this.onUnsaveStory(storyId);
        }
      });
    });
  }

  /**
   * Set the unsave story callback
   * @param {Function} callback - The callback function
   */
  setUnsaveStoryCallback(callback) {
    this.onUnsaveStory = callback;
  }
}

export default ArchiveView;
