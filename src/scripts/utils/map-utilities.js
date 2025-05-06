/**
 * Map utilities for handling map operations across the application
 * Provides functions for map initialization, markers, and location services
 */
import { getLocationString } from './geocoding-service';

class MapUtilities {
  /**
   * Initializes a Leaflet map with base configuration
   * @param {Object} options - Map configuration options
   * @param {string} options.containerId - ID of the map container element
   * @param {Object} options.config - Map configuration with API key, styles, etc.
   * @param {string} options.currentStyle - Current map style to use
   * @param {Object} options.mapStyles - Map of style names to style IDs
   * @param {Array} options.stories - Array of stories with location data
   * @returns {Object} Map instance and markers array
   */
  static initializeMap(options) {
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

    const markers = MapUtilities.addStoryMarkers(map, storiesWithLocation);

    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    return { map, markers };
  }

  /**
   * Adds markers for stories with location data
   * @param {Object} map - Leaflet map instance
   * @param {Array} stories - Array of stories with location data
   * @returns {Array} Array of created markers
   */
  static addStoryMarkers(map, stories) {
    const markers = [];

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);

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
        markers.push(marker);
      }
    });

    return markers;
  }

  /**
   * Updates the map style
   * @param {Object} map - Leaflet map instance
   * @param {string} style - Style name to apply
   * @param {Object} mapStyles - Map of style names to style IDs
   * @param {string} apiKey - MapTiler API key
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
   * @param {Object} map - Leaflet map instance
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {Object} existingMarker - Existing marker to update (optional)
   * @returns {Object} The created or updated marker
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
      const locationString = await getLocationString(latitude, longitude);
      const popupContent = `
        <div class="map-popup-content">
          <div class="map-popup-title">Your Location</div>
          <div class="map-popup-location">
            <i class="fas fa-map-marker-alt"></i> ${locationString}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    } catch (error) {
      console.error('Error getting location string:', error);
      marker.bindPopup('<div class="map-popup-content"><div class="map-popup-title">Your Location</div></div>');
    }

    return marker;
  }

  /**
   * Shows a notification in the map container
   * @param {string} message - Message to display
   * @param {string} containerId - ID of the map container
   * @param {number} duration - Duration in milliseconds to show the notification
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
