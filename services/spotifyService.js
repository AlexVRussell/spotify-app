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

  async getSavedTracks(limit = 50, offset = 0) {
    try {
      const data = await this.makeRequest(`/me/tracks?limit=${limit}&offset=${offset}`);
      return data.items;
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
      return [];
    }
  }

  async unlikeTrack(trackId) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseURL}/me/tracks?ids=${trackId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to unlike track: ${response.status}`);
    }
  }

  async removeTrackFromPlaylist(playlistId, trackUri) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseURL}/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracks: [{ uri: trackUri }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove track: ${response.status}`);
    }
  }

  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    const data = await this.makeRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
    return data.items;
  }

  async getUserPlaylists(limit = 20) {
    const data = await this.makeRequest(`/me/playlists?limit=${limit}`);
    return data.items;
  }

  async getUserProfile() {
    try {
      const data = await this.makeRequest(`/me`);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getSavedTracksCount() {
    try {
      const data = await this.makeRequest(`/me/tracks?limit=1`);
      return data.total || 0;
    } catch (error) {
      console.error('Error fetching saved tracks count:', error);
      return 0;
    }
  }
}

export default spotifyService;
