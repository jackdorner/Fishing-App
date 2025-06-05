import AsyncStorage from '@react-native-async-storage/async-storage';

const API_LINK_KEY = 'api_link';
const API_KEY_KEY = 'api_key';

export interface FishEntry {
  name: string;
  species: string;
  length_in: number;
  catch_date: string;
}

export interface AddContest {
  contest_name: string;
  contest_date: string;
  place1: string;
  place2: string;
  place3: string;
  place4: string;
  place5: string;
}

export interface RemoveContest {
  contest_name: string;
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
  },

  // Add new contest
  addContest: async (contestData: AddContest): Promise<any> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();

      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/add-contest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          contest_name: contestData.contest_name,
          contest_date: contestData.contest_date,
          place1: contestData.place1,
          place2: contestData.place2,
          place3: contestData.place3,
          place4: contestData.place4,
          place5: contestData.place5
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to add contest:', error);
      throw error;
    }
  },

  // Delete contest
  deleteContest: async (contestData: RemoveContest): Promise<any> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();

      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/remove-contest`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          contest_name: contestData.contest_name
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to add contest:', error);
      throw error;
    }
  },
  //Get all contests
  getContests: async (): Promise<any> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();

      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/get-contests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.contests;
    } catch (error) {
      console.error('Failed to add contest:', error);
      throw error;
    }
  },

  // getFish
  getFish: async (): Promise<FishEntry[]> => {
    const { apiLink, apiKey } = await apiService.getApiConfig();
  
    const response = await fetch(`${apiLink}/get-fish`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });
  
    const result = await response.json();
  
    if (response.ok && result.body) {
      try {
        const parsed = JSON.parse(result.body);
  
        if (Array.isArray(parsed)) {
          return parsed.map((fish): FishEntry => ({
            name: fish.contestant_name, // Map to match FishEntry
            species: fish.species,
            length_in: fish.length_in,
            catch_date: fish.catch_date,
          }));
        }
      } catch (e) {
        console.error('Failed to parse fish response body:', e);
      }
    }
  
    throw new Error('Invalid response format from getFish');
  },
};