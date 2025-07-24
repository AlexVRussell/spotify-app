// First, you'll need to install bottom tabs if you haven't:
// npm install @react-navigation/bottom-tabs

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Import your screens
import HomeScreen from './screens/HomeScreen';
import SiftAwayScreen from './screens/SiftAwayScreen';
import TopArtistsScreen from './screens/TopArtistsScreen';
import TopTracksScreen from './screens/TopTracksScreen';

const Tab = createBottomTabNavigator();

// Simple icon components (you can replace with actual icons later)
const HomeIcon = ({ focused, color }) => (
  <Text style={{ fontSize: 24, color }}>{focused ? '🏠' : '🏡'}</Text>
);

const SiftIcon = ({ focused, color }) => (
  <Text style={{ fontSize: 24, color }}>{focused ? '🎵' : '🎶'}</Text>
);

const ArtistsIcon = ({ focused, color }) => (
  <Text style={{ fontSize: 24, color }}>{focused ? '👨‍🎤' : '🎤'}</Text>
);

const TracksIcon = ({ focused, color }) => (
  <Text style={{ fontSize: 24, color }}>{focused ? '🎧' : '🎼'}</Text>
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#272525',
          borderTopColor: '#7ed957',
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#7ed957',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#545454',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          headerShown: false, // Hide header since HomeScreen has its own title
        }}
      />
      <Tab.Screen 
        name="SiftAway" 
        component={SiftAwayScreen}
        options={{
          tabBarIcon: SiftIcon,
          title: 'Sift Away',
        }}
      />
      <Tab.Screen 
        name="TopArtistsScreen" 
        component={TopArtistsScreen}
        options={{
          tabBarIcon: ArtistsIcon,
          title: 'Top Artists',
          tabBarLabel: 'Artists',
        }}
      />
      <Tab.Screen 
        name="TopTracksScreen" 
        component={TopTracksScreen}
        options={{
          tabBarIcon: TracksIcon,
          title: 'Top Tracks',
          tabBarLabel: 'Tracks',
        }}
      />
    </Tab.Navigator>
  );
}