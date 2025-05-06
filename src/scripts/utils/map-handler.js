/**
 * Map handler utility for Leaflet map operations
 * Provides functions for map initialization, marker creation, and location services
 */
import { getLocationString } from './geocoding-service';

class MapHandler {
  /**
   * Initializes a Leaflet map with custom markers and event handlers
   * @param {Object} options - Map configuration options
   * @param {string} options.mapElementId - ID of the map container element
   * @param {Object} options.mapConfig - Map configuration with API key, styles, etc.
   * @param {Function} options.onMapClick - Callback for map click events
   * @param {Function} options.onStyleChange - Callback for map style changes
   * @returns {Object} Map and marker objects
   */
  static async initializeMap(options) {
    const { mapElementId, mapConfig, onMapClick, onStyleChange } = options;
    
    const map = L.map(mapElementId).setView(mapConfig.defaultCenter, mapConfig.defaultZoom);
    let marker = null;

    // Add the base tile layer
    L.tileLayer(
      `https://api.maptiler.com/maps/${mapConfig.mapStyles.streets}/256/{z}/{x}/{y}.png?key=${mapConfig.apiKey}`,
      {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }
    ).addTo(map);

    // Add click event to the map
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      marker = await MapHandler.updateOrCreateMarker(map, marker, lat, lng);

      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    return { map, marker };
  }

  /**
   * Updates an existing marker or creates a new one
   * @param {Object} map - Leaflet map instance
   * @param {Object} marker - Existing marker or null
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Object} Updated or new marker
   */
  static async updateOrCreateMarker(map, marker, lat, lng) {
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      const customIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<i class="fas fa-user-circle"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    }

    try {
      const locationString = await getLocationString(lat, lng);
      const popupContent = `
        <div class="map-popup-content">
          <div class="map-popup-title">Your Location</div>
          <div class="map-popup-location">
            <i class="fas fa-map-marker-alt"></i> ${locationString}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      marker.on('mouseover', function() {
        this.openPopup();
      });
      marker.on('mouseout', function() {
        this.closePopup();
      });
    } catch (error) {
      console.error('Error getting location string:', error);
    }

    return marker;
  }

  /**
   * Initializes the locate me button functionality
   * @param {Object} options - Configuration options
   * @param {string} options.buttonId - ID of the locate me button
   * @param {Object} options.map - Leaflet map instance
   * @param {Object} options.marker - Leaflet marker instance or null
   * @param {Function} options.onLocationFound - Callback for when location is found
   */
  static initializeLocateMe(options) {
    const { buttonId, map, marker, onLocationFound } = options;
    const locateMeButton = document.getElementById(buttonId);
    
    if (!locateMeButton) return;

    locateMeButton.addEventListener('click', async () => {
      if (!navigator.geolocation) {
        alert('Location services are not supported by your browser');
        return;
      }

      locateMeButton.classList.add('loading');
      locateMeButton.innerHTML = '<i class="fas fa-spinner"></i> Locating...';

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);

        const updatedMarker = await MapHandler.updateOrCreateMarker(map, marker, latitude, longitude);
        updatedMarker.openPopup();

        if (onLocationFound) {
          onLocationFound(latitude, longitude, updatedMarker);
        }
      } catch (error) {
        console.error('Error getting location:', error);

        if (error.code === 1) {
          alert('Please enable location services in your browser to use this feature');
        } else if (error.code === 2) {
          alert('Unable to determine your location. Please try again later');
        } else if (error.code === 3) {
          alert('Location request timed out. Please try again');
        } else {
          alert('Unable to access your location');
        }
      } finally {
        locateMeButton.classList.remove('loading');
        locateMeButton.innerHTML = '<i class="fas fa-location-arrow"></i> Locate Me';
      }
    });
  }

  /**
   * Searches for a location using MapTiler geocoding API
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.apiKey - MapTiler API key
   * @param {Object} options.map - Leaflet map instance
   * @param {Object} options.marker - Leaflet marker instance or null
   * @param {Function} options.onLocationFound - Callback for when location is found
   */
  static async searchLocation(options) {
    const { query, apiKey, map, marker, onLocationFound } = options;
    
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const location = data.features[0];
        const [lng, lat] = location.center;

        map.setView([lat, lng], 13);
        const updatedMarker = await MapHandler.updateOrCreateMarker(map, marker, lat, lng);
        updatedMarker.openPopup();

        if (onLocationFound) {
          onLocationFound(lat, lng, updatedMarker);
        }
        
        return { lat, lng, marker: updatedMarker };
      } else {
        alert('Location not found. Please try a different search term.');
        return null;
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location. Please try again.');
      return null;
    }
  }
}

export default MapHandler;
