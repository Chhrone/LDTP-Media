import IndexedDBHelper from '../utils/indexed-db-helper';

class ArchiveModel {
  /**
   * Get all saved stories from IndexedDB
   * @returns {Promise<Array>} Array of saved stories
   */
  async getSavedStories() {
    try {
      const stories = await IndexedDBHelper.getAllStories();
      
      // Sort stories by savedAt timestamp (newest first)
      return stories.sort((a, b) => {
        return new Date(b.savedAt) - new Date(a.savedAt);
      });
    } catch (error) {
      console.error('Error getting saved stories:', error);
      return [];
    }
  }

  /**
   * Delete a story from IndexedDB
   * @param {string} id - The ID of the story to delete
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async deleteStory(id) {
    try {
      return await IndexedDBHelper.deleteStory(id);
    } catch (error) {
      console.error('Error deleting story:', error);
      return false;
    }
  }
}

export default ArchiveModel;
