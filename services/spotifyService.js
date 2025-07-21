import AsyncStorage from '@react-native-async-storage/async-storage';

class spotifyService {
  constructor() {
    this.baseURL = 'https://api.spotify.com/v1';
  }

  async getAccessToken() {
    try {
      const token = await AsyncStorage.getItem('spotify_access_token');
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async makeRequest(endpoint) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTopArtists(timeRange, limit = 50) {
    try {
      const data = await this.makeRequest(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
      if(limit == 1) {
        return data.items[0] || null;
      }
      return data.items || [];
      
    } catch (error) {
      console.error('Error fetching top artists:', error);
      return null;
    }
  }

  async getTopTracks(timeRange, limit = 50) {
    try {
      const data = await this.makeRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
      
      if (limit == 1) {
        return data.items[0] || null;
      } 
      return data.items || [];
      
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return null;
    }
  }

  async getRecentlyPlayed(limit = 10) {
    try {
      const data = await this.makeRequest(`/me/player/recently-played?limit=${limit}`);
      return data.items;
    } catch (error) {
      console.error('Error fetching recently played:', error);
      return [];
    }
  }

  async getSavedTracks(limit = 10) {
    try {
      const data = await this.makeRequest(`/me/tracks?limit=${limit}`);
      return data.items;
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
      return [];
    }
  }
}

export default spotifyService;
