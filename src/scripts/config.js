const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  KEY_TOKEN: 'user-token',
  KEY_USER: 'user-data',
  MAPTILER_KEY: 'DZu1rZPAffLH8pjXp8sd', // MapTiler API key
  DEFAULT_CENTER: [0, 0], // Default map center coordinates
  DEFAULT_ZOOM: 2, // Default map zoom level
  MAP_STYLE: 'streets-v2', // Default map style
  MAP_STYLES: {
    streets: 'streets-v2',
    outdoor: 'outdoor-v2',
    aquarelle: 'winter',
    bright: 'bright-v2',
    dark: 'dataviz-dark'
  }
};

export default CONFIG;
