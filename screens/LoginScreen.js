import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { authenticateWithSpotify } from '../services/spotifyAuth';

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
      <Text style={styles.title}>Swipify</Text>
      <Button title="Login with Spotify" onPress={handleLogin} />
      {token && <Text style={styles.token}>Logged in!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  token: {
    marginTop: 20,
    fontSize: 14,
    color: 'green',
  },
});
