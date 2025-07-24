import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import SpotifyService from '../services/spotifyService';

const { height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [selectedTerm, setSelectedTerm] = useState('medium_term');
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [libraryCount, setLibraryCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [termFooter, setTermFooter] = useState('Your listening history over the last 6 months'); 

  const spotifyService = new SpotifyService();

  useEffect(() => {
    fetchSpotifyData();
  }, [selectedTerm]);

  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    let timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setTookTooLong(true);
      }, 5000);
    } else {
      setTookTooLong(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchSpotifyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        artistData,
        trackData,
        savedTracks,
        playlists,
        userProfile
      ] = await Promise.all([
        spotifyService.getTopArtists(selectedTerm, 1),
        spotifyService.getTopTracks(selectedTerm, 1),
        spotifyService.getSavedTracks(1),
        spotifyService.getUserPlaylists(),  
        spotifyService.getUserProfile()
      ]);

      setTopArtist(artistData);
      setTopTrack(trackData);
    } catch (err) {
      console.error('Error fetching Spotify data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7ed957" />
        {tookTooLong ? (
          <>
            <Text style={styles.loadingText}>Still waiting? Probably a HTTP 502 :|</Text>
            <Text style={styles.loadingText}>Spotify's taking their sweet time...</Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Loading your data... PLEASE GIMME A SEC</Text>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please check your Spotify connection</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Siftify</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('TopArtistsScreen', { initialTerm: selectedTerm })}>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.cardTitle}>Top Artist</Text>
                <Text style={styles.cardContent}>
                  {topArtist ? topArtist.name : 'No artist data available'}
                </Text>
                {topArtist && topArtist.genres && topArtist.genres.length > 0 && (
                  <Text style={styles.cardSubtext}>
                    {topArtist.genres.slice(0, 2).join(', ')}
                  </Text>
                )}
                <Text style={styles.tapHint}>Tap to see top 50</Text>
              </View>
              <View style={styles.cardImage}>
                {topArtist && topArtist.images && topArtist.images.length > 0 ? (
                  <Image 
                    source={{ uri: topArtist.images[0].url }}
                    style={styles.imageStyle}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.placeholderText}>ARTIST PIC</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('TopTracksScreen', { initialTerm: selectedTerm })}>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.cardTitle}>Top Song</Text>
                <Text style={styles.cardContent}>
                  {topTrack ? topTrack.name : 'No track data available'}
                </Text>
                {topTrack && topTrack.artists && topTrack.artists.length > 0 && (
                  <Text style={styles.cardSubtext}>
                    by {topTrack.artists[0].name}
                  </Text>
                )}
                <Text style={styles.tapHint}>Tap to see top 50</Text>
              </View>
              <View style={styles.cardImage}>
                {topTrack && topTrack.album && topTrack.album.images && topTrack.album.images.length > 0 ? (
                  <Image 
                    source={{ uri: topTrack.album.images[0].url }}
                    style={styles.imageStyle}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.placeholderText}>SONG PIC</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.statsTitle}>Music Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{libraryCount}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{playlistCount}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>

        <View style={styles.termRow}>
          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'short_term' && styles.selectedTerm]}
            onPress={() => { 
              setSelectedTerm('short_term'); 
              setTermFooter('Your listening history over the last 4 weeks'); 
            }}
          >
            <Text style={[styles.cardContent, selectedTerm === 'short_term' && styles.selectedText]}>
              4 Weeks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'medium_term' && styles.selectedTerm]}
            onPress={() => { 
              setSelectedTerm('medium_term'); 
              setTermFooter('Your listening history over the last 6 months'); 
            }}
          >
            <Text style={[styles.cardContent, selectedTerm === 'medium_term' && styles.selectedText]}>
              6 Months
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'long_term' && styles.selectedTerm]}
            onPress={() => { 
              setSelectedTerm('long_term'); 
              setTermFooter('Really? This is your all time favourite?');
            }}
          >
            <Text style={[styles.cardContent, selectedTerm === 'long_term' && styles.selectedText]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.termFooter}>{termFooter}</Text>
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#545454',
  },

  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#545454',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  errorSubtext: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: height * 0.05,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#6d6b6bff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7ed957',
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 10, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowColor: '#272525ff',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textBlock: {
    flex: 1,
    marginRight: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },

  cardContent: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },

  cardSubtext: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 2,
    fontStyle: 'italic',
  },

  tapHint: {
    fontSize: 12,
    color: '#7ed957',
    marginTop: 4,
    fontStyle: 'italic',
  },

  cardImage: {
    width: 80,
    height: 80,
    backgroundColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statBlock: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7ed957',
  },

  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },

  termButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedTerm: {
    backgroundColor: '#1DB954',
  },

  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },

  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowColor: '#272525ff',
  },

  termFooter: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
