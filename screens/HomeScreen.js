import React from 'react';
import { View, Dimensions, Text, StyleSheet, ScrollView } from 'react-native';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Siftify</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Top Artist</Text>
            <Text style={styles.cardContent}>[Artist Name]</Text>
          </View>
          <View style={styles.cardImage}>
            <Text>ARTIST PIC</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Top Song</Text>
            <Text style={styles.cardContent}>[Song Name]</Text>
          </View>
          <View style={styles.cardImage}>
            <Text>SONG PIC</Text>
          </View>
        </View>
      </View>

      {/**
      * ---*DISCLAIMER*---
      * Unsure if these sections are needed/formatted but will leave them here for now
      * ---*DISCLAIMER*---
      */}
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
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#545454',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    marginTop: height * 0.05,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#545454',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7ed957',
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    marginRight: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  cardContent: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  cardImage: {
    width: 80,
    height: 80,
    backgroundColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
