import AsyncStorage from '@react-native-async-storage/async-storage';

const API_LINK_KEY = 'api_link';
const API_KEY_KEY = 'api_key';

export interface FishEntry {
  id?: number;
  caught_by: string;
  species: string;
  length_inches: number;
  catch_date: string;
}

export const apiService = {
  // Get stored API configuration
  getApiConfig: async () => {
    try {
      const apiLink = await AsyncStorage.getItem(API_LINK_KEY) || '';
      const apiKey = await AsyncStorage.getItem(API_KEY_KEY) || '';
      return { apiLink, apiKey };
    } catch (error) {
      console.error('Failed to load API config:', error);
      throw error;
    }
  },

  // Get all fish entries
  getAllFish: async (): Promise<FishEntry[]> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();
      
      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/get-fish`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch fish:', error);
      throw error;
    }
  },

  // Add new fish entry
  addFish: async (fishData: FishEntry): Promise<any> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();
      
      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/add-fish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(fishData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to add fish:', error);
      throw error;
    }
  },

  // Delete fish entry
  deleteFish: async (fishData: FishEntry): Promise<any> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();
      
      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/remove-fish`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(fishData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete fish:', error);
      throw error;
    }
  }
};