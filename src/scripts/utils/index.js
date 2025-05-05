export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format date as "4 May 2025"
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatSimpleDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array The array to shuffle
 * @returns {Array} A new shuffled array
 */
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
