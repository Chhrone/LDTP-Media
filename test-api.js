// Test script to check the API response structure
const apiUrl = 'https://story-api.dicoding.dev/v1/stories';

// Get token from localStorage if available
const token = localStorage.getItem('user-token') || 'YOUR_TOKEN_HERE';

async function fetchStories() {
  try {
    const response = await fetch(`${apiUrl}?location=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // Check if stories have lat and lon data
    if (data.listStory && data.listStory.length > 0) {
      console.log('First story data:');
      console.log(JSON.stringify(data.listStory[0], null, 2));

      // Check if lat and lon exist
      const hasLocation = data.listStory.some(story =>
        story.lat !== undefined && story.lon !== undefined);

      console.log(`Stories have location data: ${hasLocation}`);

      // Print all stories with location data
      const storiesWithLocation = data.listStory.filter(story =>
        story.lat !== undefined && story.lon !== undefined);

      console.log(`Number of stories with location: ${storiesWithLocation.length}`);

      if (storiesWithLocation.length > 0) {
        console.log('Sample story with location:');
        console.log(JSON.stringify(storiesWithLocation[0], null, 2));
      }
    }
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}

fetchStories();
