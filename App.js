import React from 'react';
import LoginScreen from './screens/LoginScreen';
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#545454' }}>
      <LoginScreen />;
    </SafeAreaView>
  )
}
