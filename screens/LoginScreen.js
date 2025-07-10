import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { authenticateWithSpotify } from '../services/spotifyAuth';
import { useSpotifyAuth } from '../context/spotifyAuthContext';

// Decompose the dimensions of the window to use for styling
const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { accessToken, setAccessToken } = useSpotifyAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const tokenData = await authenticateWithSpotify();
      setAccessToken(tokenData.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * LoginScreen component
   * This component includes:
   * - The app title
   * - An icon image
   * - A login button that triggers Spotify authentication
   * - The footer with developer information
   */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siftify</Text>
      <Image source={require('../assets/siftify-icon.png')} style={styles.icon} />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      {accessToken && <Text style={styles.token}>Logged in!</Text>}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Developed by Alex Russell of Dalhousie University</Text>
      </View>
    </View>
  );
}


// Style sheet for the LoginScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#545454',
  },
  icon: {
    width: 250,
    height: 150,
    marginBottom: height * 0.1,
    marginLeft: 22,
  },
  title: {
    fontFamily : 'Arial',
    fontWeight: 'bold',
    fontSize: 72,
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#7ed957',
    padding: 10,
    borderRadius: 7,
    marginBottom: 10,
  },
  loginButtonText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 32,
    textAlign: 'center',
  },
  token: {
    marginTop: 20,
    fontSize: 14,
    color: 'green',
  },
  footer: {
    position: 'absolute',
    color: '#fff',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});