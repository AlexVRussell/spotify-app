import React from 'react';
import LoginScreen from './screens/LoginScreen';
import { SafeAreaView } from 'react-native';
import { SpotifyAuthProvider } from './context/spotifyAuthContext';

export default function App() {
  return (
    <SpotifyAuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#545454' }}>
        <LoginScreen />;
      </SafeAreaView>
    </SpotifyAuthProvider>  
  )
}
