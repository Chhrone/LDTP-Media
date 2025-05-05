import HomeModel from '../models/home-model';
import HomeView from '../views/home-view';
import AuthHelper from '../utils/auth-helper';
import { parseActivePathname } from '../routes/url-parser';
import { getLocationString } from '../utils/geocoding-service';
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
      vintage: 'vintage',
      dark: 'dataviz-dark'
    };
  }

  async render() {
    // Check if user is logged in, redirect to login if not
    if (!AuthHelper.checkAuth()) {
      return '';
    }

    // Get page from URL using the parseActivePathname function
    const { page } = parseActivePathname();
    if (page && !isNaN(parseInt(page, 10))) {
      this._currentPage = parseInt(page, 10);
    } else {
      this._currentPage = 1;
    }

    try {
      const data = await this._model.getHomeData(this._currentPage);
      return this._view.getTemplate(data);
    } catch (error) {
      console.error('Error rendering home page:', error);
      return '<div class="container"><h2>Failed to load home page</h2></div>';
    }
  }

  async afterRender() {
    this._initPaginationEvents();
    await this._initMap();
    this._initMapStyleControls();
    this._initLocateMeButton();
    this._initHeroCTAEvents();
    console.log('Home page rendered with pagination and map');
  }

  _initHeroCTAEvents() {
    // Add smooth scrolling for the "Explore Map" button
    const exploreMapBtn = document.querySelector('.hero-btn-secondary');
    if (exploreMapBtn) {
      exploreMapBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const mapSection = document.getElementById('map-section');
        if (mapSection) {
          mapSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }

    // Add scroll to top functionality for the "Create Your Story" button
    const createStoryBtn = document.querySelector('.hero-btn-primary');
    if (createStoryBtn) {
      createStoryBtn.addEventListener('click', () => {
        // Store a flag in sessionStorage to indicate we should scroll to top after transition
        sessionStorage.setItem('scrollToTopAfterCreateStory', 'true');
      });
    }
  }

  _initLocateMeButton() {
    const locateButton = document.getElementById('locate-me-button');
    if (!locateButton) return;

    locateButton.addEventListener('click', async () => {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        // Show a notification in the map container instead of an alert
        this._showMapNotification('Location services are not supported by your browser');
        return;
      }

      // Show loading state
      locateButton.classList.add('loading');
      locateButton.innerHTML = '<i class="fas fa-spinner"></i> Locating...';

      try {
        // Request user location directly without confirmation dialog
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;

        // Create user location marker with custom icon if not exists
        if (this._map) {
          // Remove previous user location marker if exists
          if (this._userLocationMarker) {
            this._map.removeLayer(this._userLocationMarker);
          }

          // Create custom icon for user location
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<i class="fas fa-user-circle"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          // Add user location marker
          this._userLocationMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(this._map);

          // Get location string from geocoding service
          try {
            const locationString = await getLocationString(latitude, longitude);
            const popupContent = `
              <div class="map-popup-content">
                <div class="map-popup-title">Your Location</div>
                <div class="map-popup-location">
                  <i class="fas fa-map-marker-alt"></i> ${locationString}
                </div>
              </div>
            `;
            this._userLocationMarker.bindPopup(popupContent);
          } catch (error) {
            console.error('Error getting location string:', error);
            this._userLocationMarker.bindPopup('<div class="map-popup-content"><div class="map-popup-title">Your Location</div></div>');
          }

          // Fly to user location
          this._map.flyTo([latitude, longitude], 13, {
            animate: true,
            duration: 1.5
          });

          // Open popup after flying
          setTimeout(() => {
            this._userLocationMarker.openPopup();
          }, 1600);
        }
      } catch (error) {
        console.error('Error getting location:', error);

        // Handle specific error cases
        if (error.code === 1) {
          // Permission denied
          this._showMapNotification('Please enable location services in your browser to use this feature');
        } else if (error.code === 2) {
          // Position unavailable
          this._showMapNotification('Unable to determine your location. Please try again later');
        } else if (error.code === 3) {
          // Timeout
          this._showMapNotification('Location request timed out. Please try again');
        } else {
          // Generic error
          this._showMapNotification('Unable to access your location');
        }
      } finally {
        // Always reset button state
        locateButton.classList.remove('loading');
        locateButton.innerHTML = '<i class="fas fa-location-arrow"></i> Locate Me';
      }
    });
  }

  _showMapNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'map-notification';
    notification.innerHTML = `
      <div class="map-notification-content">
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
      </div>
    `;

    // Add to map container
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      // Remove any existing notifications
      const existingNotification = mapContainer.querySelector('.map-notification');
      if (existingNotification) {
        existingNotification.remove();
      }

      mapContainer.appendChild(notification);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 500);
      }, 5000);
    }
  }

  async _initMap() {
    try {
      const mapContainer = document.getElementById('map-container');
      if (!mapContainer) return;

      // Get stories data for the current page
      const data = await this._model.getHomeData(this._currentPage);
      const stories = data.featuredStories;

      // Filter stories with location data for the map
      const storiesWithLocation = stories.filter(story => story.lat && story.lon);

      // We still initialize the map even if there are no stories with location
      if (storiesWithLocation.length === 0) {
        // Just show a message in the map container but still initialize the map
        const messageElement = document.createElement('div');
        messageElement.className = 'map-message';
        messageElement.innerHTML = '<p>No location data available for stories on this page.</p>';
        mapContainer.appendChild(messageElement);
      } else {
        console.log(`Found ${storiesWithLocation.length} stories with location data out of ${stories.length} total stories`);
      }

      // Initialize the map
      maptilersdk.config.apiKey = CONFIG.MAPTILER_KEY;

      // Create the map
      this._map = new L.Map('map-container', {
        center: [0, 0],
        zoom: 2,
        scrollWheelZoom: true // Enable scroll zoom by default
      });

      // Add the base tile layer
      L.tileLayer(`https://api.maptiler.com/maps/${this._mapStyles[this._currentMapStyle]}/256/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_KEY}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(this._map);

      // Add markers for each story with location
      this._addMarkers(storiesWithLocation);

      // Fit the map to show all markers
      if (this._markers.length > 0) {
        const group = new L.featureGroup(this._markers);
        this._map.fitBounds(group.getBounds().pad(0.1));
      }

      // Add a zoom control with buttons
      L.control.zoom({
        position: 'bottomright'
      }).addTo(this._map);

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

  _addMarkers(stories) {
    // Clear existing markers
    if (this._markers.length > 0) {
      this._markers.forEach(marker => this._map.removeLayer(marker));
      this._markers = [];
    }

    // Add new markers
    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);

        // Create popup content
        const popupContent = `
          <div class="map-popup-content">
            <div class="map-popup-title">${story.title}</div>
            ${story.location ? `
              <div class="map-popup-location">
                <i class="fas fa-map-marker-alt"></i> ${story.location}
              </div>
            ` : ''}
            <a href="#/story/${story.id}" class="map-popup-link">Read Story</a>
          </div>
        `;

        marker.bindPopup(popupContent);
        this._markers.push(marker);
      }
    });
  }

  _initMapStyleControls() {
    const styleButtons = document.querySelectorAll('.map-style-button');

    styleButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Skip if already active
        if (button.classList.contains('active')) return;

        // Update active button
        styleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Get the selected style
        const style = button.dataset.style;
        this._currentMapStyle = style;

        // Update the map style
        if (this._map) {
          // Remove current tile layer
          this._map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
              this._map.removeLayer(layer);
            }
          });

          // Add new tile layer
          L.tileLayer(`https://api.maptiler.com/maps/${this._mapStyles[style]}/256/{z}/{x}/{y}.png?key=${CONFIG.MAPTILER_KEY}`, {
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
          }).addTo(this._map);
        }
      });
    });
  }

  _initPaginationEvents() {
    const paginationLinks = document.querySelectorAll('.pagination-link');

    paginationLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const page = parseInt(link.dataset.page, 10);

        if (page !== this._currentPage) {
          // Clean up map before navigation
          if (this._map) {
            this._map.remove();
            this._map = null;
            this._markers = [];
            this._userLocationMarker = null;
          }

          // Proper SPA navigation - change hash and let the router handle it
          window.location.hash = `/page/${page}`;
          // No need to call _refreshPage as the hashchange event will trigger app.renderPage()
        }
      });
    });
  }
}

export default HomePage;
