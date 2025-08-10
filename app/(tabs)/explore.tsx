import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { FirebaseExample } from '../../components/FirebaseExample';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import WeatherMap from '../../components/WeatherMap';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const [, setCurrentLocation] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
  });

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setCurrentLocation({ latitude, longitude });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore & Firebase Demo</ThemedText>
      </ThemedView>
      
      {/* Firebase Demo Section */}
      <View style={styles.demoContainer}>
        <FirebaseExample />
      </View>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Peta Cuaca</ThemedText>
      </ThemedView>
      
      <View style={styles.mapContainer}>
        <WeatherMap
          onLocationSelect={handleLocationSelect}
          height={width * 0.8}
        />
      </View>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">Informasi Peta</ThemedText>
        <ThemedText style={styles.description}>
          Peta ini menampilkan kondisi cuaca real-time di berbagai lokasi. 
          Anda dapat menjelajahi kondisi cuaca di area sekitar atau mencari lokasi tertentu.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  titleContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  demoContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: width * 0.8,
  },
  infoContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  description: {
    marginTop: 8,
    lineHeight: 20,
    color: '#6B7280',
  },
});