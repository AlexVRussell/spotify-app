import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { authenticateWithSpotify } from '../services/spotifyAuth';
import { Image } from 'react-native';

// Decompose the height from the window object
const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [token, setToken] = useState(null);

  const handleLogin = async () => {
    try {
      const data = await authenticateWithSpotify();
      setToken(data.access_token);
      console.log('Access token:', data.access_token);
    } catch (err) {
      console.error('Auth failed:', err);
    }
  };

  // Renders the login screen with 
  // - Title
  // - Spotify login button
  // - Token status message 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siftify</Text>
      <Image source={require('../assets/siftify-icon.png')} style={styles.icon}/>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      {token && <Text style={styles.token}>Logged in!</Text>}
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
    marginBottom: height * 0.1, // 5% of the screen height
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
