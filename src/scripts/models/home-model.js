import CONFIG from '../config';
import { getLocationString } from '../utils/geocoding-service';
import authPresenter from '../presenter/auth-presenter';

class HomeModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
  }

  async getHomeData(page = 1, size = 12) {
    try {
      const url = new URL(`${this._baseUrl}/stories`);
      url.searchParams.append('page', page);
      url.searchParams.append('size', size);
      url.searchParams.append('location', 0);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authPresenter.getToken()}`,
        },
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      const stories = await Promise.all(responseJson.listStory.map(async story => {
        const storyData = {
          id: story.id,
          title: story.name,
          excerpt: this._createExcerpt(story.description),
          photo: story.photoUrl,
          createdAt: story.createdAt,
          lat: story.lat,
          lon: story.lon,
          location: null,
        };

        if (story.lat && story.lon) {
          try {
            storyData.location = await getLocationString(story.lat, story.lon);
          } catch (error) {
            console.error(`Error getting location for story ${story.id}:`, error);
            storyData.location = 'Unknown location';
          }
        }

        return storyData;
      }));

      return {
        title: 'Welcome to Loughshinny Dublinn Travel Post',
        description: 'Share your stories with the world',
        featuredStories: stories,
        pagination: {
          currentPage: page,
          totalPages: 8,
          pageSize: size
        }
      };
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw new Error('Failed to load stories. Please try again later.');
    }
  }

  _createExcerpt(text, maxWords = 40) {
    if (!text) return '';

    const words = text.trim().split(/\s+/);

    if (words.length <= maxWords) return text;

    const truncatedWords = words.slice(0, maxWords);

    for (let i = 0; i < truncatedWords.length; i++) {
      if (truncatedWords[i].length > 30) {
        truncatedWords[i] = truncatedWords[i].substring(0, 30) + '...';
      }
    }

    // Return the truncated text with ellipsis
    return truncatedWords.join(' ') + '...';
  }

  /**
   * Get a story by ID
   * @param {string} id - The ID of the story to get
   * @returns {Promise<Object>} - The story data
   */
  async getStoryById(id) {
    try {
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

      const storyData = {
        id: story.id,
        title: story.name,
        description: story.description,
        photo: story.photoUrl,
        createdAt: story.createdAt,
        author: story.name,
        lat: story.lat,
        lon: story.lon,
        location: null,
      };

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

export default HomeModel;
