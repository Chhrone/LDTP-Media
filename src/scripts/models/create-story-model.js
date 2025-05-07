import CONFIG from '../config';
import authPresenter from '../presenter/auth-presenter';
import { getLocationString } from '../utils/geocoding-service';
import ImageCompressor from '../utils/image-compressor';

class CreateStoryModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
  }

  /**
   * Create a new story
   * @param {FormData} formData - Form data containing photo, description, and optional lat/lon
   * @returns {Promise<Object>} - Created story data
   */
  async createStory(formData) {
    try {

      if (!formData.get('photo')) {
        throw new Error('Photo is required');
      }

      if (!formData.get('description')) {
        throw new Error('Description is required');
      }


      const compressedFormData = new FormData();


      const photoFile = formData.get('photo');
      if (photoFile && photoFile instanceof File) {
        try {

          if (photoFile.size > 900 * 1024) {
            console.log('Image is large, compressing...', photoFile.size / 1024, 'KB');

            const quality = photoFile.size > 2 * 1024 * 1024 ? 0.6 : 0.7;
            const compressedPhoto = await ImageCompressor.compressImage(photoFile, 1200, 1200, quality);
            compressedFormData.append('photo', compressedPhoto);
            console.log('Compressed image size:', compressedPhoto.size / 1024, 'KB');
          } else {

            compressedFormData.append('photo', photoFile);
          }
        } catch (error) {
          console.error('Error compressing image:', error);

          compressedFormData.append('photo', photoFile);
        }
      }


      for (const [key, value] of formData.entries()) {
        if (key !== 'photo') {
          compressedFormData.append(key, value);
        }
      }


      const response = await fetch(`${this._baseUrl}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authPresenter.getToken()}`,
        },
        body: compressedFormData,
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }


      if (!responseJson.story) {
        console.log('API Response:', responseJson);
        return {
          success: true,
          message: 'Story created successfully'
        };
      }

      const storyData = {
        id: responseJson.story?.id,
        name: responseJson.story?.name,
        description: responseJson.story?.description,
        photo: responseJson.story?.photoUrl,
        createdAt: responseJson.story?.createdAt,
        lat: responseJson.story?.lat,
        lon: responseJson.story?.lon,
        location: null,
      };

      if (storyData.lat && storyData.lon) {
        try {
          storyData.location = await getLocationString(storyData.lat, storyData.lon);
        } catch (error) {
          console.error(`Error getting location for story ${storyData.id}:`, error);
          storyData.location = 'Unknown location';
        }
      }

      return storyData;
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error(error.message || 'Failed to create story. Please try again later.');
    }
  }


}

export default CreateStoryModel;
