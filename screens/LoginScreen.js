import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { authenticateWithSpotify } from '../services/spotifyAuth';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siftify</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#545454',
  },
  title: {
    fontFamily : 'Poppins',
    fontWeight: 'bold',
    fontSize: 50,
    marginBottom: height * 0.1,
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#7ed957',
    padding: 10,
    borderRadius: 7,
    marginBottom: 10,
  },
  loginButtonText: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});
