import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { authenticateWithSpotify } from '../services/spotifyAuth';
import { useSpotifyAuth } from '../context/spotifyAuthContext';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siftify</Text>
      <Image source={require('../assets/siftify-logo-v3.2-removebg-preview.png')} style={styles.icon} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#e9e7cdff',
  },
  icon: {
    width: 250,
    height: 150,
    marginBottom: height * 0.1,
    marginLeft: 22,
  },
  title: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 72,
    color: '#9ACA90',
    shadowColor: '#266F4C', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  loginButton: {
    backgroundColor: '#266F4C',
    padding: 10,
    borderRadius: 7,
    marginBottom: 10,
  },
  loginButtonText: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    color: '#9ACA90',
    fontSize: 32,
    textAlign: 'center',
  },
  token: {
    marginTop: 20,
    fontSize: 14,
    color: '#FFFFFF', 
  },
  footer: {
    position: 'absolute',
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
    color: '#266F4C', 
    textAlign: 'center',
  },
});