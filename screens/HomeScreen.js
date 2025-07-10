import React from 'react';
import { View, Dimensions, Text, StyleSheet, ScrollView } from 'react-native';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Siftify</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Artist</Text>
        <Text style={styles.cardContent}>[Artist Name]</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Song</Text>
        <Text style={styles.cardContent}>[Song Name]</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recently Played</Text>
        <Text style={styles.cardContent}>[Track List]</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Library</Text>
        <Text style={styles.cardContent}>[Saved Albums/Tracks]</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: height * 0.05,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 16,
    color: '#555',
  },
});
