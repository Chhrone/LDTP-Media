import CONFIG from '../config';
import { getLocationString } from '../utils/geocoding-service';
import authPresenter from '../presenter/auth-presenter';

class DetailStoryModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
  }

  async getStoryById(id) {
    try {
      // Add location=1 parameter to get location data
      const url = new URL(`${this._baseUrl}/stories/${id}`);
      url.searchParams.append('location', 1);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authPresenter.getToken()}`,
        },
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      const story = responseJson.story;

      // Format the story data
      const storyData = {
        id: story.id,
        title: story.name,
        description: story.description,
        photo: story.photoUrl,
        createdAt: story.createdAt,
        author: story.name, // Using name as author since API doesn't have separate author field
        lat: story.lat,
        lon: story.lon,
        location: null,
      };

      // Add location data if available
      if (story.lat && story.lon) {
        try {
          storyData.location = await getLocationString(story.lat, story.lon);
        } catch (error) {
          console.error(`Error getting location for story ${story.id}:`, error);
          storyData.location = 'Unknown location';
        }
      }

      return storyData;
    } catch (error) {
      console.error('Error fetching story details:', error);
      throw new Error('Failed to load story details. Please try again later.');
    }
  }
}

export default DetailStoryModel;
