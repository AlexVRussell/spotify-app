import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TopArtistsScreen from './screens/TopArtistsScreen';
import TopTracksScreen from './screens/TopTracksScreen';

import { SpotifyAuthProvider, useSpotifyAuth } from './context/spotifyAuthContext';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { accessToken } = useSpotifyAuth();
  
  return (
    // Access token check is set to true for testing purposes
    // This will allow the HomeScreen to be displayed without logging in 
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!accessToken ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TopArtistsScreen" component={TopArtistsScreen} />
        <Stack.Screen name="TopTracksScreen" component={TopTracksScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SpotifyAuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SpotifyAuthProvider>
  );
}
