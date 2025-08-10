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

export default function TopArtistsScreen({ route, navigation }) {
  const { initialTerm } = route.params;
  
  const [selectedTerm, setSelectedTerm] = useState(initialTerm);
  const [artists, setArtists] = useState([]);
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
    fetchTopArtists();
  }, [selectedTerm]);

  const fetchTopArtists = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await spotifyService.getTopArtists(selectedTerm, 50);
      
      // Handle both single artist and array responses
      if (result) {
        const artistsArray = Array.isArray(result) ? result : [result];
        setArtists(artistsArray);
      } else {
        setArtists([]);
      }
    } catch (err) {
      console.error('Error fetching top artists:', err);
      setError(err.message);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (term, footerText) => {
    setSelectedTerm(term);
    setTermFooter(footerText);
  };

  const renderArtistItem = ({ item, index }) => (
    <View style={styles.listItem}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      
      <View style={styles.artistImage}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0].url }}
            style={styles.imageStyle}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>NO IMAGE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.genres && item.genres.length > 0 && (
          <Text style={styles.artistGenres} numberOfLines={1}>
            {item.genres.slice(0, 2).join(', ')}
          </Text>
        )}
        
        {item.followers && (
          <Text style={styles.artistFollowers}>
            {item.followers.total ? `${item.followers.total.toLocaleString()} followers` : ''}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7ed957" />
        <Text style={styles.loadingText}>Loading your top 50 artists...</Text>
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
        <Text style={styles.title}>Top 50 Artists</Text>
        
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
        data={artists}
        renderItem={renderArtistItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No artists found</Text>
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
    backgroundColor: '#efe7cdff', 
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
    borderBottomColor: '#9ACA90',
  },

  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#266F4C', 
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
    color: '#266F4C',
    textAlign: 'center',
    marginBottom: 20,
  },

  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#aaa87d',
  },

  termButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f4e0',
    borderWidth: 1,
    borderColor: '#9ACA90',
  },

  selectedTerm: {
    backgroundColor: '#9ACA90',
  },

  termButtonText: {
    color: '#266F4C',
    fontSize: 14,
  },

  selectedText: {
    color: '#e9e7cff',
    fontWeight: 'bold',
  },

  termFooter: {
    color: '#444',
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
    backgroundColor: '#f5f4e0', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9ACA90',
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#aaa87d',
  },

  rankBadge: {
    backgroundColor: '#266F4C',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  rankText: {
    color: '#f5f4e0',
    fontWeight: 'bold',
    fontSize: 14,
  },

  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },

  placeholderText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  artistInfo: {
    flex: 1,
  },

  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#266F4C',
    marginBottom: 2,
  },

  artistGenres: {
    fontSize: 14,
    color: '#266F4CB3',
    fontStyle: 'italic',
    marginBottom: 2,
  },

  artistFollowers: {
    fontSize: 12,
    color: '#9ACA90',
  },

  loadingText: {
    color: '#266F4C',
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
    color: '#266F4C',
    fontSize: 16,
    textAlign: 'center',
  },
});