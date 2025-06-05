import AsyncStorage from '@react-native-async-storage/async-storage';

const API_LINK_KEY = 'api_link';
const API_KEY_KEY = 'api_key';

export interface FishEntry {
  name: string;
  species: string;
  length_in: number;
  catch_date: string;
}

export interface ContestPlace {
  place: number;
  name: string;
}

export interface Contest {
  id?: number;
  name: string;
  date: string;
  places: ContestPlace[];
  created_at?: string;
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
  },

  // Get all contest entries
  getAllContests: async (): Promise<Contest[]> => {
    try {
      const { apiLink, apiKey } = await apiService.getApiConfig();
      
      if (!apiLink || !apiKey) {
        throw new Error('API configuration not set. Please configure in Settings.');
      }

      const response = await fetch(`${apiLink}/get-fish?type=CONTEST`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const contests = await response.json();
      
      // Transform the data to match our interface if needed
      return contests.map((contest: any) => ({
        id: contest.id,
        name: contest.name,
        date: contest.contest_date,
        places: contest.places || [],
        created_at: contest.created_at
      }));
    } catch (error) {
      console.error('Failed to fetch contests:', error);
      throw error;
    }
  },

  // Add new contest
  addContest: async (contestData: Contest): Promise<any> => {
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
        body: JSON.stringify({
          type: "CONTEST",
          data: {
            name: contestData.name,
            date: contestData.date,
            places: contestData.places
          }
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
  deleteContest: async (contestName: string): Promise<any> => {
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
        body: JSON.stringify({
          type: "CONTEST",
          data: {
            name: contestName
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete contest:', error);
      throw error;
    }
  }
};