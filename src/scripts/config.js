// Konfigurasi aplikasi
const CONFIG = {
  // API dan autentikasi
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  KEY_TOKEN: 'user-token',
  KEY_USER: 'user-data',

  // Konfigurasi peta
  MAPTILER_KEY: 'DZu1rZPAffLH8pjXp8sd',
  DEFAULT_CENTER: [0, 0],
  DEFAULT_ZOOM: 2,
  MAP_STYLE: 'streets-v2',

  // Gaya peta yang tersedia
  MAP_STYLES: {
    streets: 'streets-v2',
    outdoor: 'outdoor-v2',
    aquarelle: 'winter',
    bright: 'bright-v2',
    dark: 'dataviz-dark'
  },

  // Push Notification
  VAPID_PUBLIC_KEY: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
  KEY_NOTIFICATION_SUBSCRIPTION: 'notification-subscription'
};

export default CONFIG;
