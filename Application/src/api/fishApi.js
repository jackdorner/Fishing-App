import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key constants
const API_KEY_STORAGE_KEY = '@fishing_app_api_key';
const API_URL_STORAGE_KEY = '@fishing_app_api_url';

// Create a function to get the API client with current settings
const getApiClient = async () => {
  try {
    // Get stored API settings
    const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY) || 'your-api-key-here';
    const apiUrl = await AsyncStorage.getItem(API_URL_STORAGE_KEY) || 'https://your-api-gateway-url.amazonaws.com/prod';
    
    // Create and return axios instance with current settings
    return axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });
  } catch (error) {
    console.error('Error getting API client:', error);
    // Fallback to default values if AsyncStorage fails
    return axios.create({
      baseURL: 'https://your-api-gateway-url.amazonaws.com/prod',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'your-api-key-here'
      }
    });
  }
};

export const fishApi = {
  /**
   * Get all fish entries from the database
   * @returns {Promise} Promise with fish data
   */
  getAllFish: async () => {
    try {
      const apiClient = await getApiClient();
      const response = await apiClient.get('/get-fish');
      return response.data;
    } catch (error) {
      console.error('Error fetching fish data:', error);
      throw error;
    }
  },

  /**
   * Add a new fish catch to the database via queue
   * @param {Object} fishData - The fish catch data
   * @param {string} fishData.caught_by - Name of person who caught the fish
   * @param {string} fishData.species - Fish species
   * @param {number} fishData.length_inches - Length in inches
   * @param {string} fishData.catch_date - Date in YYYY-MM-DD format
   * @returns {Promise} Promise with result
   */
  addFish: async (fishData) => {
    try {
      const apiClient = await getApiClient();
      const response = await apiClient.post('/add-fish', fishData);
      return response.data;
    } catch (error) {
      console.error('Error adding fish:', error);
      throw error;
    }
  },

  /**
   * Delete a fish entry from the database via queue
   * @param {Object} fishData - The fish data to delete
   * @returns {Promise} Promise with result
   */
  deleteFish: async (fishData) => {
    try {
      const apiClient = await getApiClient();
      const response = await apiClient.delete('/remove-fish', { data: fishData });
      return response.data;
    } catch (error) {
      console.error('Error deleting fish:', error);
      throw error;
    }
  }
};