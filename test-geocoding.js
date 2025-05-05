// Test script to check the geocoding service
import { reverseGeocode, getLocationString } from './src/scripts/utils/geocoding-service';

// Test coordinates (New York City)
const lat = 40.7128;
const lon = -74.0060;

async function testGeocoding() {
  try {
    console.log(`Testing geocoding for coordinates: ${lat}, ${lon}`);
    
    // Test reverseGeocode function
    console.log('Testing reverseGeocode function:');
    const locationInfo = await reverseGeocode(lat, lon);
    console.log(JSON.stringify(locationInfo, null, 2));
    
    // Test getLocationString function
    console.log('Testing getLocationString function:');
    const locationString = await getLocationString(lat, lon);
    console.log(`Location string: ${locationString}`);
  } catch (error) {
    console.error('Error testing geocoding:', error);
  }
}

testGeocoding();
