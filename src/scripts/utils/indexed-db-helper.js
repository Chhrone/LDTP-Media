/**
 * IndexedDB Helper for offline data storage
 * Provides functions for saving, retrieving, and deleting stories
 */
class IndexedDBHelper {
  static DB_NAME = 'ldtp-media-db';
  static DB_VERSION = 1;
  static OBJECT_STORE_NAME = 'stories';
  static dbInstance = null;

  /**
   * Open the IndexedDB database
   * @returns {Promise<IDBDatabase>} The database instance
   */
  static openDB() {
    // If we already have a connection, return it
    if (this.dbInstance) {
      return Promise.resolve(this.dbInstance);
    }

    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('Your browser doesn\'t support IndexedDB'));
        return;
      }

      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        reject(new Error('Error opening IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.dbInstance = event.target.result;

        // Handle connection closing
        this.dbInstance.onclose = () => {
          this.dbInstance = null;
        };

        // Handle connection errors
        this.dbInstance.onerror = () => {
          this.dbInstance = null;
        };

        resolve(this.dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.OBJECT_STORE_NAME)) {
          db.createObjectStore(this.OBJECT_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save a story to IndexedDB
   * @param {Object} story - The story object to save
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  static async saveStory(story) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.OBJECT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.OBJECT_STORE_NAME);

        // Add timestamp for sorting
        const storyToSave = {
          ...story,
          savedAt: new Date().toISOString()
        };

        const request = store.put(storyToSave);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(new Error('Error saving story to IndexedDB'));
        };

        // Don't close the database connection after transaction
      });
    } catch (error) {
      console.error('Error in saveStory:', error);
      return false;
    }
  }

  /**
   * Get all saved stories from IndexedDB
   * @returns {Promise<Array>} Array of saved stories
   */
  static async getAllStories() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.OBJECT_STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.OBJECT_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error('Error getting stories from IndexedDB'));
        };

        // Don't close the database connection after transaction
      });
    } catch (error) {
      console.error('Error in getAllStories:', error);
      return [];
    }
  }

  /**
   * Delete a story from IndexedDB
   * @param {string} id - The ID of the story to delete
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  static async deleteStory(id) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.OBJECT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.OBJECT_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(new Error('Error deleting story from IndexedDB'));
        };

        // Don't close the database connection after transaction
      });
    } catch (error) {
      console.error('Error in deleteStory:', error);
      return false;
    }
  }

  /**
   * Check if a story is already saved
   * @param {string} id - The ID of the story to check
   * @returns {Promise<boolean>} True if the story is saved, false otherwise
   */
  static async isStorySaved(id) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.OBJECT_STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.OBJECT_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(!!request.result);
        };

        request.onerror = () => {
          reject(new Error('Error checking if story is saved'));
        };

        // Don't close the database connection after transaction
      });
    } catch (error) {
      console.error('Error in isStorySaved:', error);
      return false;
    }
  }

  /**
   * Close the database connection
   * Should be called when the application is about to be unloaded
   */
  static closeDB() {
    if (this.dbInstance) {
      this.dbInstance.close();
      this.dbInstance = null;
    }
  }
}

export default IndexedDBHelper;
