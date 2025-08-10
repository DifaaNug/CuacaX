import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { WeatherMap } from '../../components/WeatherMap';
import { WeatherService } from '../../services/weatherService';
import { WeatherData } from '../../types/weather';

const { width } = Dimensions.get('window');

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
        <ThemedText type="title">Peta Cuaca</ThemedText>
        <ThemedText style={styles.subtitle}>
          Jelajahi kondisi cuaca di berbagai lokasi
        </ThemedText>
      </ThemedView>
      
      <View style={styles.mapContainer}>
        <WeatherMap
          currentWeather={currentWeather || undefined}
          onLocationSelect={handleLocationSelect}
          height={width * 0.75}
        />
        {loading && (
          <ThemedView style={styles.loadingOverlay}>
            <ThemedText>Memuat data cuaca...</ThemedText>
          </ThemedView>
        )}
      </View>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">Cara Menggunakan</ThemedText>
        <ThemedText style={styles.description}>
          • Tap pada peta untuk melihat cuaca di lokasi tersebut{'\n'}
          • Gunakan tombol &quot;Gunakan Lokasi Saat Ini&quot; untuk kembali ke GPS{'\n'}
          • Peta menampilkan kondisi cuaca real-time
        </ThemedText>
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
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  infoContainer: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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