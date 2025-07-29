import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SiftAwayScreen from './screens/SiftAwayScreen';
import TopArtistsScreen from './screens/TopArtistsScreen';
import TopTracksScreen from './screens/TopTracksScreen';
import AccountScreen from './screens/AccountScreen';

import { SpotifyAuthProvider, useSpotifyAuth } from './context/spotifyAuthContext';
import { Image } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeIcon = () => (
  <Image
    source={require("./assets/house.png")}
    style={{ width: 28, height: 28, tintColor: 'white', marginBottom: 5,}}
  />
);

const SiftIcon = () => (
  <Image
    source={require("./assets/siftify-icon.png")}
    style={{ width: 28, height: 28, tintColor: 'white', marginBottom: 5,}}
  />
);

const AccountIcon = () => (
  <Image
    source={require("./assets/account-icon.png")}
    style={{ width: 28, height: 28, tintColor: 'white', marginBottom: 5,}}
  />
);

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#272525',
          borderTopColor: '#7ed957',
          borderTopWidth: 2,
          height: 95,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#7ed957',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="SiftAway" 
        component={SiftAwayScreen}
        options={{
          tabBarIcon: SiftIcon,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          tabBarIcon: AccountIcon,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { accessToken } = useSpotifyAuth();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!accessToken ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
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