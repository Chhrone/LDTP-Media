import { formatSimpleDate } from '../utils/index';

class DetailStoryView {
  constructor() {
    this.formatSimpleDate = formatSimpleDate;
  }

  getTemplate() {
    return `
      <div class="container">
        <div class="detail-story-container">
          <a href="#/" class="back-button">
            <i class="fas fa-arrow-left"></i> Back
          </a>
          <div class="detail-story-content-container">
            <!-- Detail story content will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  getLoadingTemplate() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading story details...</p>
      </div>
    `;
  }

  getErrorTemplate(message = 'Failed to load story details. Please try again later.') {
    return `
      <div class="error-container">
        <h2>Error</h2>
        <p>${message}</p>
        <a href="#/" class="btn">Back to Home</a>
      </div>
    `;
  }

  getDetailTemplate(story) {
    return `
      <div class="detail-story" style="view-transition-name: story-card-${story.id}">
        <div class="detail-story-header">
          <h1 class="detail-story-title" style="view-transition-name: story-title-${story.id}">${story.title}</h1>
          <div class="detail-story-meta">
            ${story.location ? `
              <div class="detail-story-location">
                <i class="fas fa-map-marker-alt"></i> ${story.location}
              </div>
            ` : ''}
            <div class="detail-story-date">
              <i class="fas fa-calendar-alt"></i> <time datetime="${story.createdAt}">${this.formatSimpleDate(story.createdAt)}</time>
            </div>
          </div>
        </div>

        ${story.photo ? `
          <figure class="detail-story-image" style="view-transition-name: story-image-${story.id}">
            <img src="${story.photo}" alt="${story.title}" loading="lazy">
            <figcaption class="visually-hidden">${story.title}</figcaption>
          </figure>
        ` : ''}

        <div class="detail-story-content" style="view-transition-name: story-content-${story.id}">
          <div class="detail-story-description">
            <p>${this._formatDescription(story.description)}</p>
          </div>

          ${story.lat && story.lon ? `
            <aside class="detail-story-map-container">
              <h2>Location</h2>
              <div id="detail-map" class="detail-map"></div>
            </aside>
          ` : ''}
        </div>

        <div class="detail-story-actions">
          <a href="#/" class="btn btn-back" id="back-to-stories">
            <i class="fas fa-arrow-left"></i> Back to Stories
          </a>
          <button class="btn btn-save" id="save-story-btn" data-story-id="${story.id}">
            <i class="fas fa-bookmark"></i> Save Story
          </button>
        </div>
      </div>
    `;
  }

  _formatDescription(text) {
    if (!text) return '';

    // Replace newlines with paragraph breaks
    return text
      .split('\n')
      .filter(paragraph => paragraph.trim() !== '')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }

  /**
   * Updates the content container with the provided HTML
   * @param {string} html
   */
  updateContentContainer(html) {
    const contentContainer = document.querySelector('.detail-story-content-container');
    if (contentContainer) {
      contentContainer.innerHTML = html;
    }
  }

  /**
   * Initializes the back button with a click handler
   * @param {Function} onBackClick
   */
  initializeBackButton(onBackClick) {
    const backButton = document.getElementById('back-to-stories');
    if (backButton && onBackClick) {
      backButton.addEventListener('click', (event) => {
        event.preventDefault();
        onBackClick();
      });
    }
  }

  /**
   * Initializes the save button with a click handler
   * @param {Function} onSaveClick
   */
  initializeSaveButton(onSaveClick) {
    const saveButton = document.getElementById('save-story-btn');
    if (saveButton && onSaveClick) {
      saveButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const storyId = saveButton.dataset.storyId;

        // Get current state and toggle it immediately for instant feedback
        const currentlySaved = saveButton.classList.contains('saved');
        this.updateSaveButtonState(!currentlySaved);

        // Call the save/unsave function and update again with the actual result
        const isSaved = await onSaveClick(storyId);

        // Only update if the result is different from what we expected
        if (isSaved !== !currentlySaved) {
          this.updateSaveButtonState(isSaved);
        }
      });
    }
  }

  /**
   * Updates the save button state based on whether the story is already saved
   * @param {boolean} isSaved - Whether the story is saved
   */
  updateSaveButtonState(isSaved) {
    const saveButton = document.getElementById('save-story-btn');
    if (saveButton) {
      if (isSaved) {
        saveButton.classList.add('saved');
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Remove from Archive';
      } else {
        saveButton.classList.remove('saved');
        saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Save to Archive';
      }
    }
  }

  /**
   * Shows loading state in the content container
   */
  showLoading() {
    this.updateContentContainer(this.getLoadingTemplate());
  }

  /**
   * Shows error state in the content container
   * @param {string} message
   */
  showError(message) {
    this.updateContentContainer(this.getErrorTemplate(message));
  }

  /**
   * Updates the view with story data
   * @param {Object} storyData
   */
  updateView(storyData) {
    this.updateContentContainer(this.getDetailTemplate(storyData));
  }

  /**
   * Initializes the map with story location data
   * @param {Object} storyData
   * @param {Object} mapConfig
   * @returns {Object}
   */
  async initializeMap(storyData, mapConfig) {
    try {
      const mapContainer = document.getElementById('detail-map');
      if (!mapContainer) return { map: null, marker: null };

      const map = L.map('detail-map').setView([storyData.lat, storyData.lon], 10);

      L.tileLayer(
        `https://api.maptiler.com/maps/${mapConfig.mapStyles.streets}/256/{z}/{x}/{y}.png?key=${mapConfig.apiKey}`,
        {
          attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }
      ).addTo(map);

      const marker = L.marker([storyData.lat, storyData.lon]).addTo(map);

      // Refresh the map after it's visible
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return { map, marker };
    } catch (error) {
      console.error('Error initializing map:', error);
      const mapContainer = document.getElementById('detail-map');
      if (mapContainer) {
        mapContainer.innerHTML = '<p class="text-center">Failed to load map</p>';
      }
      return { map: null, marker: null };
    }
  }

  /**
   * Updates the map marker popup with location information
   * @param {Object} marker
   * @param {Object} storyData
   * @param {Object} locationInfo
   */
  updateMapMarkerPopup(marker, storyData, locationInfo) {
    if (!marker) return;

    const { locationString, details } = locationInfo;

    const popupContent = `
      <div class="map-popup-content">
        <div class="map-popup-title">${storyData.title}</div>
        ${details ? `
          <div class="map-popup-details">
            ${details.place && details.place !== 'Unknown' ? `<div><strong>Place:</strong> ${details.place}</div>` : ''}
            ${details.county && details.county !== 'Unknown' ? `<div><strong>County:</strong> ${details.county}</div>` : ''}
            ${details.subregion && details.subregion !== 'Unknown' ? `<div><strong>Region:</strong> ${details.subregion}</div>` : ''}
            ${details.country && details.country !== 'Unknown' ? `<div><strong>Country:</strong> ${details.country}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 300 }).openPopup();
  }

  /**
   * Initializes session storage for navigation
   * @param {string} storyId
   * @param {string} currentPath
   * @param {string} referrerPath
   */
  initializeSessionStorage(storyId, currentPath, referrerPath) {
    sessionStorage.setItem('lastViewedStoryId', storyId);

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
  }
}

export default DetailStoryView;