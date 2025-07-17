import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import SpotifyService from '../services/spotifyService';

const { height } = Dimensions.get('window');

export default function HomeScreen() {

  // Set the default time range to 'medium_term'
  const [selectedTerm, setSelectedTerm] = useState('medium_term');
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termFooter, setTermFooter] = useState('Your listening history over the last 6 months');

  const spotifyService = new SpotifyService();

  // Runs useEffect when we change the selected term
  useEffect(() => {
    fetchSpotifyData();
  }, [selectedTerm]);

  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    let timeout;

    if (loading) {
      timeout = setTimeout(() => {
        setTookTooLong(true);
      }, 5000); // 5 seconds
    } else {
      setTookTooLong(false);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchSpotifyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both top artist and track concurrently for better performance
      const [artistData, trackData] = await Promise.all([
        spotifyService.getTopArtists(selectedTerm, 1),
        spotifyService.getTopTracks(selectedTerm, 1)
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
            <Text style={styles.loadingText}>Still waiting? Probably a HTTP 502 🙃</Text>
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

        {/* ---*DISCLAIMER*---
            Unsure if these sections are needed/formatted but will leave them here for now
            ---*DISCLAIMER*--- */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recently Played</Text>
          <Text style={styles.cardContent}>[Track List]</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Library</Text>
          <Text style={styles.cardContent}>[Saved Albums/Tracks]</Text>
        </View>

        <View style={styles.termRow}>
          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'short_term' && styles.selectedTerm]}
            onPress={() => { setSelectedTerm('short_term'); setTermFooter('Your listening history over the last 4 weeks'); }}
          >
            <Text style={[styles.cardContent, selectedTerm === 'short_term' && styles.selectedText]}>
              4 Weeks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'medium_term' && styles.selectedTerm]}
            onPress={() => { setSelectedTerm('medium_term'); setTermFooter('Your listening history over the last 6 months'); }}
          >
            <Text style={[styles.cardContent, selectedTerm === 'medium_term' && styles.selectedText]}>
              6 Months
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'long_term' && styles.selectedTerm]}
            onPress={() => { setSelectedTerm('long_term'); setTermFooter('Really? This is your all time favourite?');}}
          >
            <Text style={[styles.cardContent, selectedTerm === 'long_term' && styles.selectedText]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.termFooter}>{termFooter}</Text>
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
    backgroundColor: '#545454',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7ed957',
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  placeholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  },
  termFooter: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});