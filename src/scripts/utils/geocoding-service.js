import CONFIG from '../config';

/**
 * Reverse geocode a latitude and longitude to get subregion and country
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} - Location information with subregion and country
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

      let subregion = null;
      let country = null;

      if (feature.context) {
        for (const ctx of feature.context) {
          if (ctx.id.startsWith('country')) {
            country = ctx.text;
          } else if (ctx.id.startsWith('subregion')) {
            subregion = ctx.text;
          }
        }
      }

      return { subregion, country };
    }

    return { subregion: null, country: null };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return { subregion: null, country: null, error: error.message };
  }
}

/**
 * Get location string in the format "Subregion, Country"
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} - Formatted location string
 */
async function getLocationString(lat, lon) {
  try {
    const { subregion, country, error } = await reverseGeocode(lat, lon);

    if (error) {
      return 'Unknown location';
    }

    if (subregion && country) {
      return `${subregion}, ${country}`;
    } else if (country) {
      return country;
    }

    return 'Unknown location';
  } catch (error) {
    console.error('Error getting location string:', error);
    return 'Unknown location';
  }
}

export { reverseGeocode, getLocationString };
