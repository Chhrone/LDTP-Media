/**
 * Map utilities for handling map operations across the application
 * Provides functions for map initialization, markers, and location services
 */
// No imports needed from geocoding-service

class MapUtilities {
  /**
   * Initializes a Leaflet map with base configuration
   * @param {Object} options
   * @param {string} options.containerId
   * @param {Object} options.config
   * @param {string} options.currentStyle
   * @param {Object} options.mapStyles
   * @param {Array} options.stories
   * @returns {Object}
   */
  static async initializeMap(options) {
    const { containerId, config, currentStyle, mapStyles, stories = [] } = options;

    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return { map: null, markers: [] };

    const storiesWithLocation = stories.filter(story => story.lat && story.lon);

    const map = new L.Map(containerId, {
      center: [0, 0],
      zoom: 2,
      scrollWheelZoom: true
    });

    L.tileLayer(`https://api.maptiler.com/maps/${mapStyles[currentStyle]}/256/{z}/{x}/{y}.png?key=${config.MAPTILER_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    // Add loading indicator to the map container
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'map-loading';
    loadingIndicator.innerHTML = '<div class="loading-spinner"></div><p>Loading location data...</p>';
    mapContainer.appendChild(loadingIndicator);

    try {
      const markers = await MapUtilities.addStoryMarkers(map, storiesWithLocation);

      if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      if (loadingIndicator.parentNode) {
        loadingIndicator.remove();
      }

      return { map, markers };
    } catch (error) {
      console.error('Error initializing map:', error);

      if (loadingIndicator.parentNode) {
        loadingIndicator.remove();
      }

      const errorMessage = document.createElement('div');
      errorMessage.className = 'map-message';
      errorMessage.innerHTML = '<p>Error loading map data. Please try again later.</p>';
      mapContainer.appendChild(errorMessage);

      return { map, markers: [] };
    }
  }

  /**
   * Adds markers for stories with location data
   * @param {Object} map
   * @param {Array} stories
   * @returns {Array}
   */
  static async addStoryMarkers(map, stories) {
    const markers = [];

    // Import the geocoding service dynamically to avoid circular dependencies
    const { getDetailedLocation } = await import('./geocoding-service');

    for (const story of stories) {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);

        try {
          const { locationString, details } = await getDetailedLocation(story.lat, story.lon);

          const popupContent = `
            <div class="map-popup-content">
              <div class="map-popup-title">${story.title}</div>
              <div class="map-popup-location">
                <i class="fas fa-map-marker-alt"></i> ${locationString}
              </div>
              ${details ? `
                <div class="map-popup-details">
                  ${details.place && details.place !== 'Unknown' ? `<div><strong>Place:</strong> ${details.place}</div>` : ''}
                  ${details.county && details.county !== 'Unknown' ? `<div><strong>County:</strong> ${details.county}</div>` : ''}
                  ${details.subregion && details.subregion !== 'Unknown' ? `<div><strong>Region:</strong> ${details.subregion}</div>` : ''}
                  ${details.country && details.country !== 'Unknown' ? `<div><strong>Country:</strong> ${details.country}</div>` : ''}
                </div>
              ` : ''}
              <a href="#/story/${story.id}" class="map-popup-link">Read Story</a>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 300 });
        } catch (error) {
          console.error('Error getting location information for marker:', error);

          const fallbackPopupContent = `
            <div class="map-popup-content">
              <div class="map-popup-title">${story.title}</div>
              <a href="#/story/${story.id}" class="map-popup-link">Read Story</a>
            </div>
          `;

          marker.bindPopup(fallbackPopupContent);
        }

        markers.push(marker);
      }
    }

    return markers;
  }

  /**
   * Updates the map style
   * @param {Object} map
   * @param {string} style
   * @param {Object} mapStyles
   * @param {string} apiKey
   */
  static updateMapStyle(map, style, mapStyles, apiKey) {
    if (!map) return;

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(`https://api.maptiler.com/maps/${mapStyles[style]}/256/{z}/{x}/{y}.png?key=${apiKey}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);
  }

  /**
   * Creates a user location marker on the map
   * @param {Object} map
   * @param {number} latitude
   * @param {number} longitude
   * @param {Object} existingMarker
   * @returns {Object}
   */
  static async createUserLocationMarker(map, latitude, longitude, existingMarker = null) {
    if (!map) return null;

    if (existingMarker) {
      map.removeLayer(existingMarker);
    }

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: '<i class="fas fa-user-circle"></i>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);

    try {
      const { getDetailedLocation } = await import('./geocoding-service');

      const { locationString, details } = await getDetailedLocation(latitude, longitude);

      const popupContent = `
        <div class="map-popup-content">
          <div class="map-popup-title">Your Location</div>
          <div class="map-popup-location">
            <i class="fas fa-map-marker-alt"></i> ${locationString}
          </div>
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

      marker.bindPopup(popupContent, { maxWidth: 300 });
    } catch (error) {
      console.error('Error getting location information for user marker:', error);

      const fallbackPopupContent = `
        <div class="map-popup-content">
          <div class="map-popup-title">Your Location</div>
          <div class="map-popup-coordinates">
            <i class="fas fa-map-pin"></i> Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}
          </div>
        </div>
      `;

      marker.bindPopup(fallbackPopupContent);
    }

    return marker;
  }

  /**
   * Shows a notification in the map container
   * @param {string} message
   * @param {string} containerId
   * @param {number} duration
   */
  static showMapNotification(message, containerId, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = 'map-notification';
    notification.innerHTML = `
      <div class="map-notification-content">
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
      </div>
    `;

    const mapContainer = document.getElementById(containerId);
    if (mapContainer) {
      const existingNotification = mapContainer.querySelector('.map-notification');
      if (existingNotification) {
        existingNotification.remove();
      }

      mapContainer.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 500);
      }, duration);
    }
  }
}

export default MapUtilities;
