import { formatSimpleDate } from '../utils/index';
import MapUtilities from '../utils/map-utilities';
import NavigationUtilities from '../utils/navigation-utilities';

class HomeView {
  constructor() {
    this.formatSimpleDate = formatSimpleDate;
  }

  getTemplate(data) {
    const { title, description, featuredStories, pagination } = data;

    return `
      <div class="container-fluid" style="view-transition-name: home-return">
        <section class="hero" style="view-transition-name: hero-section">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <h1>${title}</h1>
            <p>${description}</p>
            <div class="hero-cta-container">
              <a href="#/create-story" class="hero-btn hero-btn-primary" style="view-transition-name: create-story-button">Create Your Story</a>
              <a href="#map-section" class="hero-btn hero-btn-secondary">Explore Map</a>
            </div>
          </div>
        </section>
      </div>
      <div class="container" style="view-transition-name: home-content">

        <section class="featured-stories">
          <h2>Featured Stories</h2>
          <div id="stories-list" class="stories-list">
            ${featuredStories.map(story => `
              <article class="story-card" data-story-id="${story.id}" style="view-transition-name: story-card-${story.id}">
                ${story.photo ? `<figure class="story-image" style="view-transition-name: story-image-${story.id}">
                  <img src="${story.photo}" alt="${story.title}" loading="lazy">
                  <figcaption class="visually-hidden">${story.title}</figcaption>
                </figure>` : ''}
                <div class="story-content" style="view-transition-name: story-content-${story.id}">
                  <h3 style="view-transition-name: story-title-${story.id}">${story.title}</h3>
                  <p>${story.excerpt}</p>

                  <div class="story-divider"></div>

                  <div class="story-info">
                    <div class="left-info">
                      ${story.location ? `<div class="story-location">
                        <i class="fas fa-map-marker-alt"></i> ${story.location}
                      </div>` : ''}
                      <div class="story-date">
                        <i class="fas fa-calendar-alt"></i> <time datetime="${story.createdAt}">${this.formatSimpleDate(story.createdAt)}</time>
                      </div>
                    </div>
                    <div class="right-info">
                      <div class="story-actions">
                        <a href="#/story/${story.id}" class="story-action-link" data-story-id="${story.id}">Read More</a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>

          ${this._getPaginationTemplate(pagination)}
        </section>

        <aside id="map-section" class="map-section" style="view-transition-name: map-section">
          <h2>Story Locations</h2>
          <div class="map-actions">
            <div class="map-style-controls">
              <button class="map-style-button active" data-style="streets">Streets</button>
              <button class="map-style-button" data-style="outdoor">Outdoor</button>
              <button class="map-style-button" data-style="aquarelle">Aquarelle</button>
              <button class="map-style-button" data-style="bright">Bright</button>
              <button class="map-style-button" data-style="dark">Dark</button>
            </div>
            <button id="locate-me-button" class="locate-me-button">
              <i class="fas fa-location-arrow"></i> Locate Me
            </button>
          </div>
          <div id="map-container" class="map-container"></div>
        </aside>
      </div>
    `;
  }

  _getPaginationTemplate(pagination) {
    const { currentPage, totalPages } = pagination;

    let paginationLinks = '';

    const firstDisabled = currentPage <= 1 ? 'disabled' : '';
    paginationLinks += `<a href="#/page/1"
                          class="pagination-link pagination-first ${firstDisabled}"
                          data-page="1"
                          title="First Page"
                          ${firstDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-double-left"></i>
                        </a>`;

    const prevDisabled = currentPage <= 1 ? 'disabled' : '';
    paginationLinks += `<a href="#/page/${currentPage - 1}"
                          class="pagination-link pagination-prev ${prevDisabled}"
                          data-page="${currentPage - 1}"
                          title="Previous Page"
                          ${prevDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-left"></i>
                        </a>`;

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 3);

    if (endPage - startPage < 3) {
      startPage = Math.max(1, endPage - 3);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage ? 'active' : '';
      paginationLinks += `<a href="#/page/${i}"
                            class="pagination-link pagination-number ${isActive}"
                            data-page="${i}"
                            title="Page ${i}">
                            ${i}
                          </a>`;
    }

    const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
    paginationLinks += `<a href="#/page/${currentPage + 1}"
                          class="pagination-link pagination-next ${nextDisabled}"
                          data-page="${currentPage + 1}"
                          title="Next Page"
                          ${nextDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-right"></i>
                        </a>`;

    const lastDisabled = currentPage >= totalPages ? 'disabled' : '';
    paginationLinks += `<a href="#/page/${totalPages}"
                          class="pagination-link pagination-last ${lastDisabled}"
                          data-page="${totalPages}"
                          title="Last Page"
                          ${lastDisabled ? 'aria-disabled="true"' : ''}>
                          <i class="fas fa-angle-double-right"></i>
                        </a>`;

    return `
      <div class="pagination" style="view-transition-name: pagination-section">
        ${paginationLinks}
      </div>
    `;
  }

  /**
   * Initializes the map with story markers
   * @param {Object} options 
   * @param {Array} options.stories 
   * @param {string} options.currentMapStyle 
   * @param {Object} options.mapStyles 
   * @param {Object} options.config 
   * @returns {Object} Map and markers objects
   */
  async initializeMap(options) {
    try {
      const { stories, currentMapStyle, mapStyles, config } = options;
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) return { map: null, markers: [] };

      const storiesWithLocation = stories.filter(story => story.lat && story.lon);

      if (storiesWithLocation.length === 0) {
        const messageElement = document.createElement('div');
        messageElement.className = 'map-message';
        messageElement.innerHTML = '<p>No location data available for stories on this page.</p>';
        mapContainer.appendChild(messageElement);
      }

      maptilersdk.config.apiKey = config.MAPTILER_KEY;

      const { map, markers } = await MapUtilities.initializeMap({
        containerId: 'map-container',
        config,
        currentStyle: currentMapStyle,
        mapStyles,
        stories: storiesWithLocation
      });

      this._addZoomInfoMessage(mapContainer);

      return { map, markers };
    } catch (error) {
      console.error('Error initializing map:', error);
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        mapContainer.innerHTML = '<p class="text-center">Failed to load map. Please try again later.</p>';
      }
      return { map: null, markers: [] };
    }
  }

  /**
   * Adds zoom info message to the map container
   * @param {HTMLElement} mapContainer 
   */
  _addZoomInfoMessage(mapContainer) {
    const zoomInfoElement = document.createElement('div');
    zoomInfoElement.className = 'map-zoom-info';
    zoomInfoElement.innerHTML = '<i class="fas fa-mouse"></i> Scroll to zoom in/out';
    mapContainer.appendChild(zoomInfoElement);

    setTimeout(() => {
      zoomInfoElement.classList.add('fade-out');
      setTimeout(() => {
        if (zoomInfoElement.parentNode) {
          zoomInfoElement.remove();
        }
      }, 1000);
    }, 5000);
  }

  /**
   * Initializes map style control buttons
   * @param {Function} onStyleChange 
   */
  initializeMapStyleControls(onStyleChange) {
    const styleButtons = document.querySelectorAll('.map-style-button');

    styleButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('active')) return;

        styleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const style = button.dataset.style;

        if (onStyleChange) {
          onStyleChange(style);
        }
      });
    });
  }

  /**
   * Initializes the locate me button functionality
   * @param {Function} onLocateMe- Callback for locate me button click
   */
  initializeLocateMeButton(onLocateMe) {
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

        if (onLocateMe) {
          await onLocateMe(position.coords.latitude, position.coords.longitude);
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
   * Initializes pagination links with event handlers
   * @param {Function} onPageChange
   */
  initializePaginationEvents(onPageChange) {
    NavigationUtilities.setupPaginationLinks(onPageChange);
  }

  /**
   * Initializes hero section call-to-action buttons
   */
  initializeHeroCTAEvents() {
    NavigationUtilities.setupSmoothScrolling('.hero-btn-secondary', '#map-section');
  }
}

export default HomeView;
