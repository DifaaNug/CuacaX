import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ThemedView } from '../../components/ThemedView';
import { WeatherMap } from '../../components/WeatherMap';
import { WeatherService } from '../../services/weatherService';
import { WeatherData } from '../../types/weather';
import { shadowPresets } from '../../utils/styleUtils';

export default function ExploreScreen() {
  const [currentLocation, setCurrentLocation] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
  });
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load weather for initial location
  useEffect(() => {
    loadWeatherForLocation(currentLocation.latitude, currentLocation.longitude);
  }, [currentLocation.latitude, currentLocation.longitude]);

  const loadWeatherForLocation = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const weather = await WeatherService.getCurrentWeather(latitude, longitude);
      setCurrentWeather(weather);
    } catch (error) {
      console.error('Error loading weather for selected location:', error);
      Alert.alert('Error', 'Gagal memuat data cuaca untuk lokasi yang dipilih.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (latitude: number, longitude: number) => {
    setCurrentLocation({ latitude, longitude });
    await loadWeatherForLocation(latitude, longitude);
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <Text style={styles.title}>Peta Cuaca</Text>
        <Text style={styles.subtitle}>
          Jelajahi kondisi cuaca di berbagai lokasi
        </Text>
      </ThemedView>
      
      <View style={styles.mapContainer}>
        <WeatherMap
          currentWeather={currentWeather || undefined}
          onLocationSelect={handleLocationSelect}
          height={undefined} // Let it use flex: 1 from container
        />
        {loading && (
          <ThemedView style={styles.loadingOverlay}>
            <Text>Memuat data cuaca...</Text>
          </ThemedView>
        )}
      </View>

      <ThemedView style={styles.infoContainer}>
        <Text style={styles.subtitleText}>Cara Menggunakan</Text>
        <Text style={styles.description}>
          • Tap pada peta untuk membuka di browser atau input koordinat{'\n'}
          • Gunakan tombol &quot;Gunakan Lokasi Saat Ini&quot; untuk GPS{'\n'}
          • Peta menampilkan kondisi cuaca real-time
        </Text>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...shadowPresets.medium,
  },
  infoContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...shadowPresets.small,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});