import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import SpotifyService from '../services/spotifyService';

const { height } = Dimensions.get('window');

export default function TopTracksScreen({ route, navigation }) {
  const { initialTerm } = route.params;
  
  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [termFooter, setTermFooter] = useState(getTermFooter(initialTerm));
  
  const spotifyService = new SpotifyService();

  function getTermFooter(term) {
    switch(term) {
      case 'short_term': return 'Your listening history over the last 4 weeks';
      case 'medium_term': return 'Your listening history over the last 6 months';
      case 'long_term': return 'Really? These are your all time favourites?';
      default: return 'Your listening history over the last 6 months';
    }
  }

  useEffect(() => {
    fetchTopTracks();
  }, [selectedTerm]);

  const fetchTopTracks = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await spotifyService.getTopTracks(selectedTerm, 50);
      
      // Handle both single track and array responses
      if (result) {
        const tracksArray = Array.isArray(result) ? result : [result];
        setTracks(tracksArray);
      } else {
        setTracks([]);
      }
    } catch (err) {
      console.error('Error fetching top tracks:', err);
      setError(err.message);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (term, footerText) => {
    setSelectedTerm(term);
    setTermFooter(footerText);
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTrackItem = ({ item, index }) => (
    <View style={styles.listItem}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      
      <View style={styles.trackImage}>
        {item.album && item.album.images && item.album.images.length > 0 ? (
          <Image 
            source={{ uri: item.album.images[0].url }}
            style={styles.imageStyle}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>NO IMAGE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.artists && item.artists.length > 0 && (
          <Text style={styles.trackArtist} numberOfLines={1}>
            by {item.artists[0].name}
          </Text>
        )}
        
        {item.album && (
          <Text style={styles.trackAlbum} numberOfLines={1}>
            {item.album.name}
          </Text>
        )}
        
        <View style={styles.trackMeta}>
          {item.duration_ms && (
            <Text style={styles.trackDuration}>
              {formatDuration(item.duration_ms)}
            </Text>
          )}
          {item.popularity !== undefined && (
            <Text style={styles.trackPopularity}>
              {item.popularity}% popularity
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7ed957" />
        <Text style={styles.loadingText}>Loading your top 50 tracks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        
        <Text style={styles.title}>Top 50 Tracks</Text>
        
        <View style={styles.termRow}>
          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'short_term' && styles.selectedTerm]}
            onPress={() => handleTermChange('short_term', 'Your listening history over the last 4 weeks')}
          >
            <Text style={[styles.termButtonText, selectedTerm === 'short_term' && styles.selectedText]}>
              4 Weeks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'medium_term' && styles.selectedTerm]}
            onPress={() => handleTermChange('medium_term', 'Your listening history over the last 6 months')}
          >
            <Text style={[styles.termButtonText, selectedTerm === 'medium_term' && styles.selectedText]}>
              6 Months
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.termButton, selectedTerm === 'long_term' && styles.selectedTerm]}
            onPress={() => handleTermChange('long_term', 'Really? These are your all time favourites?')}
          >
            <Text style={[styles.termButtonText, selectedTerm === 'long_term' && styles.selectedText]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.termFooter}>{termFooter}</Text>
      </View>

      <FlatList
        data={tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tracks found</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#545454',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#7ed957',
  },

  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#7ed957',
    borderRadius: 6,
    zIndex: 1000,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000',
  },

  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },

  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  termButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6d6b6b',
  },

  selectedTerm: {
    backgroundColor: '#1DB954',
  },

  termButtonText: {
    color: 'white',
    fontSize: 14,
  },

  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },

  termFooter: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6d6b6b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7ed957',
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#272525',
  },

  rankBadge: {
    backgroundColor: '#7ed957',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    overflow: 'hidden',
  },

  imageStyle: {
    width: '100%',
    height: '100%',
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

  placeholderText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  trackInfo: {
    flex: 1,
  },

  trackName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },

  trackArtist: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 2,
  },

  trackAlbum: {
    fontSize: 13,
    color: '#aaaaaa',
    fontStyle: 'italic',
    marginBottom: 4,
  },

  trackMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  trackDuration: {
    fontSize: 12,
    color: '#7ed957',
    fontWeight: 'bold',
  },

  trackPopularity: {
    fontSize: 12,
    color: '#aaaaaa',
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
    marginBottom: 20,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },

  emptyText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});