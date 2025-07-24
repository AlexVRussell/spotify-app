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

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
        rotate.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();
        translateY.flattenOffset();
        
        if (Math.abs(gestureState.dx) > 120) {
          // Swipe detected
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
            
            // Reset and move to next card
            translateX.setValue(0);
            translateY.setValue(0);
            rotate.setValue(0);
            setCurrentIndex(prev => prev + 1);
          });
        } else {
          // Snap back
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
    loadTracks();
  }, [selectedPlaylist]);

  const loadPlaylists = async () => {
    try {
      const userPlaylists = await spotifyService.getUserPlaylists();
      setPlaylists([{ id: 'liked', name: 'Liked Songs' }, ...userPlaylists]);
    } catch (err) {
      console.error('Error loading playlists:', err);
    }
  };

  const loadTracks = async () => {
    setLoading(true);
    try {
      let loadedTracks = [];
      if (selectedPlaylist.id === 'liked') {
        loadedTracks = await spotifyService.getSavedTracks(50);
      } else {
        const playlistItems = await spotifyService.getPlaylistTracks(selectedPlaylist.id, 50);
        loadedTracks = playlistItems.map(item => item.track);
      }
      
      const validTracks = loadedTracks.filter(track => 
        track && track.id && track.name && track.artists && track.artists.length > 0
      );
      
      setTracks(validTracks);
      setCurrentIndex(0);
      // Reset animations when new tracks load
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
    } catch (err) {
      console.error('Error loading tracks:', err);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (Math.abs(translationX) > 120) {
        // Swipe detected
        const direction = translationX > 0 ? 'right' : 'left';
        
        Animated.timing(translateXAnimated, {
          toValue: direction === 'right' ? 500 : -500,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (direction === 'left') {
            console.log('Would remove:', tracks[currentIndex]?.name);
          } else {
            console.log('Would keep:', tracks[currentIndex]?.name);
          }
          
          // Reset and move to next card
          translateX.setValue(0);
          translateY.setValue(0);
          setCurrentIndex(prev => prev + 1);
        });
      } else {
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleButtonSwipe = (direction) => {
    if (direction === 'left') {
      console.log('Would remove:', tracks[currentIndex]?.name);
    } else {
      console.log('Would keep:', tracks[currentIndex]?.name);
    }
    // Reset animations and move to next card
    translateX.setValue(0);
    translateY.setValue(0);
    rotate.setValue(0);
    setCurrentIndex(prev => prev + 1);
  };

  const currentTrack = tracks[currentIndex];

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
      {/* Playlist Selector */}
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
        {currentTrack && currentIndex < tracks.length ? (
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: rotate.interpolate({
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
            {tracks.length === 0 ? 'No tracks found in this playlist.' : 'All songs reviewed!'}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      {currentTrack && currentIndex < tracks.length && (
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
        {currentIndex + 1} / {tracks.length}
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