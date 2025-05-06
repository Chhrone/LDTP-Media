import CONFIG from '../config';

/**
 * Converts coordinates to location information (place, county, subregion, country)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Location information
 */
async function reverseGeocode(lat, lon) {
  try {
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    const url = `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${CONFIG.MAPTILER_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0];

      // Extract place name from the main feature
      const place = feature.text || null;

      // Initialize location components
      let county = null;
      let subregion = null;
      let country = null;

      // Extract context information
      if (feature.context) {
        for (const ctx of feature.context) {
          if (ctx.id.startsWith('country')) {
            country = ctx.text;
          } else if (ctx.id.startsWith('subregion')) {
            subregion = ctx.text;
          } else if (ctx.id.startsWith('county')) {
            county = ctx.text;
          }
        }
      }

      return { place, county, subregion, country };
    }

    return { place: null, county: null, subregion: null, country: null };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return { place: null, county: null, subregion: null, country: null, error: error.message };
  }
}

/**
 * Gets detailed location information for popup display
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Formatted location information
 */
async function getDetailedLocation(lat, lon) {
  try {
    const { place, county, subregion, country, error } = await reverseGeocode(lat, lon);

    if (error) {
      return {
        locationString: 'Unknown location',
        details: null
      };
    }

    // Build the main location string
    let locationString = 'Unknown location';
    if (subregion && country) {
      locationString = `${subregion}, ${country}`;
    } else if (country) {
      locationString = country;
    }

    // Build detailed information
    const details = {
      place: place || 'Unknown',
      county: county || 'Unknown',
      subregion: subregion || 'Unknown',
      country: country || 'Unknown'
    };

    return { locationString, details };
  } catch (error) {
    console.error('Error getting detailed location:', error);
    return {
      locationString: 'Unknown location',
      details: null
    };
  }
}

/**
 * Gets a simple location string in format "Subregion, Country"
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Formatted location string
 */
async function getLocationString(lat, lon) {
  try {
    const { locationString } = await getDetailedLocation(lat, lon);
    return locationString;
  } catch (error) {
    console.error('Error getting location string:', error);
    return 'Unknown location';
  }
}

export { reverseGeocode, getLocationString, getDetailedLocation };
