import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import SpotifyService from '../services/spotifyService';

const { width, height } = Dimensions.get('window');

export default function SiftAwayScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState({ id: 'liked', name: 'Liked Songs' });
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const processedTracks = useRef(new Set());
  
  const BATCH_SIZE = 25;
  const PRELOAD_THRESHOLD = 5;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20,

      onPanResponderGrant: () => {
        translateX.stopAnimation();
        translateY.stopAnimation();
        rotate.stopAnimation();
        translateX.setValue(0);
        translateY.setValue(0);
        rotate.setValue(0);
      },

      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
        rotate.setValue(gestureState.dx);
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 120) {
          const direction = gestureState.dx > 0 ? 'right' : 'left';

          Animated.timing(translateX, {
            toValue: direction === 'right' ? 500 : -500,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            if (direction === 'left') {
              console.log('Would remove:', tracks[currentIndex]?.name);
            } else {
              console.log('Would keep:', tracks[currentIndex]?.name);
            }
            translateX.setValue(0);
            translateY.setValue(0);
            rotate.setValue(0);
            setCurrentIndex(prev => prev + 1);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const spotifyService = new SpotifyService();

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    loadInitialTracks();
  }, [selectedPlaylist]);

  // Check if we need to load more tracks
  useEffect(() => {
    const remainingTracks = tracks.length - currentIndex;
    if (remainingTracks <= PRELOAD_THRESHOLD && !isLoadingMore && currentIndex > 0) {
      loadMoreTracks();
    }
  }, [currentIndex, tracks.length]);

  const loadPlaylists = async () => {
    try {
      const userPlaylists = await spotifyService.getUserPlaylists();
      setPlaylists([{ id: 'liked', name: 'Liked Songs' }, ...userPlaylists]);
    } catch (err) {
      console.error('Error loading playlists:', err);
    }
  };

  const loadInitialTracks = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setTracks([]);
    processedTracks.current.clear();
    
    try {
      await loadTracksFromOffset(0, true);
    } catch (err) {
      console.error('Error loading initial tracks:', err);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTracks = async () => {
    if (isLoadingMore || tracks.length >= totalTracks) return;
    
    setIsLoadingMore(true);
    try {
      await loadTracksFromOffset(tracks.length, false);
    } catch (err) {
      console.error('Error loading more tracks:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadTracksFromOffset = async (offset, isInitial = false) => {
    try {
      let loadedTracks = [];
      let total = 0;

      if (selectedPlaylist.id === 'liked') {
        if (isInitial) {
          const countData = await spotifyService.getSavedTracksCount();
          total = countData;
          setTotalTracks(total);
        }
        
        const savedItems = await spotifyService.getSavedTracks(BATCH_SIZE, offset);
        loadedTracks = savedItems.map(item => item.track);
      } else {
        const playlistItems = await spotifyService.getPlaylistTracks(
          selectedPlaylist.id, 
          BATCH_SIZE, 
          offset
        );
        
        if (isInitial && playlistItems.length > 0) {
          const fullPlaylistData = await spotifyService.makeRequest(
            `/playlists/${selectedPlaylist.id}?fields=tracks(total)`
          );
          total = fullPlaylistData.tracks?.total || playlistItems.length;
          setTotalTracks(total);
        }
        
        loadedTracks = playlistItems.map(item => item.track);
      }

      const validTracks = loadedTracks.filter(track =>
        track && 
        track.id && 
        track.name && 
        track.artists && 
        track.artists.length > 0 &&
        !processedTracks.current.has(track.id)
      ); 

      validTracks.forEach(track => processedTracks.current.add(track.id));

      if (isInitial) {
        setTracks(validTracks);
      } else {
        setTracks(prev => [...prev, ...validTracks]);
      }

      // Reset animation values
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);

    } catch (error) {
      throw error;
    }
  };

  const handleSwipe = async (direction) => {
    const currentTrack = tracks[currentIndex];
    if (!currentTrack) return;

    if (direction === 'left') {
      console.log('Would remove:', currentTrack.name);
      // Where we would actually remove the track
      // await removeTrack(currentTrack);
    } else {
      console.log('Would keep:', currentTrack.name);
    }

    // Reset animation
    translateX.setValue(0);
    translateY.setValue(0);
    rotate.setValue(0);
    setCurrentIndex(prev => prev + 1);
  };

  const handleButtonSwipe = (direction) => {
    handleSwipe(direction);
  };

  // Optional: Remove track from playlist/liked songs
  const removeTrack = async (track) => {
    try {
      if (selectedPlaylist.id === 'liked') {
        await spotifyService.unlikeTrack(track.id);
      } else {
        await spotifyService.removeTrackFromPlaylist(selectedPlaylist.id, track.uri);
      }
    } catch (error) {
      console.error('Error removing track:', error);
    }
  };

  const currentTrack = tracks[currentIndex];
  const hasMoreTracks = currentIndex < tracks.length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading playlist songs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Playlist Selection */}
      <View style={styles.playlistRow}>
        {playlists.map(pl => (
          <TouchableOpacity
            key={pl.id}
            style={[
              styles.playlistButton,
              selectedPlaylist.id === pl.id && styles.selectedPlaylist
            ]}
            onPress={() => setSelectedPlaylist(pl)}
          >
            <Text style={[
              styles.playlistText,
              selectedPlaylist.id === pl.id && styles.selectedPlaylistText
            ]}>
              {pl.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card Display */}
      <View style={styles.cardContainer}>
        {currentTrack && hasMoreTracks ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  {
                    rotate: rotate.interpolate({
                      inputRange: [-200, 0, 200],
                      outputRange: ['-30deg', '0deg', '30deg']
                    })
                  }
                ]
              }
            ]}
          >
            {currentTrack.album?.images?.[0]?.url ? (
              <Image
                source={{ uri: currentTrack.album.images[0].url }}
                style={styles.albumArt}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}
            <Text style={styles.trackName} numberOfLines={2}>
              {currentTrack.name}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentTrack.artists?.[0]?.name}
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.noTracks}>
            {totalTracks === 0 ? 'No tracks found in this playlist.' : 'All songs reviewed!'}
          </Text>
        )}
        
        {/* Loading indicator for more tracks */}
        {isLoadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#1DB954" />
            <Text style={styles.loadingMoreText}>Loading more songs...</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {currentTrack && hasMoreTracks && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleButtonSwipe('left')}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keepButton}
            onPress={() => handleButtonSwipe('right')}
          >
            <Text style={styles.buttonText}>Keep</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.progressText}>
        {Math.min(currentIndex + 1, totalTracks)} / {totalTracks}
        {tracks.length < totalTracks && ` (${tracks.length} loaded)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  loadingMoreContainer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: '#bbb',
    marginTop: 5,
    fontSize: 12,
  },
  playlistRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playlistButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1DB954',
    margin: 4,
  },
  selectedPlaylist: {
    backgroundColor: '#1DB954',
  },
  playlistText: {
    color: '#1DB954',
  },
  selectedPlaylistText: {
    color: '#fff',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.85,
    height: height * 0.6,
    backgroundColor: '#333',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  albumArt: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 10,
    marginBottom: 20,
  },
  noImageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#bbb',
    fontSize: 16,
  },
  trackName: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  keepButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressText: {
    color: '#bbb',
    textAlign: 'center',
    paddingBottom: 20,
    fontSize: 16,
  },
  noTracks: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});