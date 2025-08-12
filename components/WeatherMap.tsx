import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { WeatherData } from '../types/weather';
import { shadowPresets } from '../utils/styleUtils';
import { ThemedView } from './ThemedView';

interface WeatherMapProps {
  currentWeather?: WeatherData;
  onLocationSelect?: (latitude: number, longitude: number) => void;
  height?: number;
}

export function WeatherMap({ 
  currentWeather, 
  onLocationSelect, 
  height = 300 
}: WeatherMapProps) {
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi Diperlukan', 'Aplikasi memerlukan akses lokasi untuk fitur peta.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi saat ini.');
    }
  };

  const handleLocationPress = async () => {
    if (isGettingLocation) return; // Prevent multiple calls
    
    setIsGettingLocation(true);
    
    try {
      // Get fresh location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi Diperlukan', 'Aplikasi memerlukan akses lokasi untuk fitur ini.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);
      
      if (onLocationSelect) {
        onLocationSelect(location.coords.latitude, location.coords.longitude);
        Alert.alert('Berhasil', `Lokasi berhasil diperbarui!\nLat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi saat ini. Pastikan GPS aktif dan coba lagi.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const openWebMap = async () => {
    const lat = currentWeather?.coordinates?.lat || -6.2088;
    const lon = currentWeather?.coordinates?.lon || 106.8456;
    const googleMapsUrl = `https://www.google.com/maps/@${lat},${lon},15z`;
    
    try {
      await WebBrowser.openBrowserAsync(googleMapsUrl);
    } catch (error) {
      console.error('Error opening web map:', error);
      Alert.alert('Error', 'Gagal membuka peta di browser.');
    }
  };

  const handleMapAreaPress = () => {
    Alert.alert(
      'Buka Peta Interaktif',
      'Pilih cara untuk melihat peta:',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Buka di Browser', 
          onPress: openWebMap 
        },
        {
          text: 'Pilih Lokasi Manual',
          onPress: () => {
            Alert.prompt(
              'Masukkan Koordinat',
              'Format: latitude,longitude\nContoh: -6.2088,106.8456',
              (text) => {
                if (text && onLocationSelect) {
                  const coords = text.split(',');
                  if (coords.length === 2) {
                    const lat = parseFloat(coords[0].trim());
                    const lon = parseFloat(coords[1].trim());
                    if (!isNaN(lat) && !isNaN(lon)) {
                      onLocationSelect(lat, lon);
                    } else {
                      Alert.alert('Error', 'Format koordinat tidak valid.');
                    }
                  }
                }
              }
            );
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={[
      styles.container, 
      { backgroundColor, borderColor },
      height ? { height } : { flex: 1 }
    ]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🗺️</Text>
        <Text style={styles.title}>Peta Cuaca</Text>
      </View>

      {/* Interactive Fallback Map for Expo Go */}
      <TouchableOpacity 
        style={[
          styles.mapPlaceholder, 
          { backgroundColor: primaryColor + '10' },
          height ? { height: height - 100 } : { flex: 1 }
        ]}
        onPress={handleMapAreaPress}
        activeOpacity={0.8}
      >
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapTitle}>Google Maps Interaktif</Text>
        <Text style={styles.mapSubtitle}>
          Tap untuk membuka peta di browser atau input koordinat manual.{'\n'}
          Koordinat: {currentWeather?.coordinates?.lat.toFixed(4) || '-6.2088'}, {currentWeather?.coordinates?.lon.toFixed(4) || '106.8456'}
        </Text>
        
        <View style={styles.interactiveHint}>
          <Text style={styles.tapIcon}>👆</Text>
          <Text style={styles.tapText}>Tap untuk interaksi</Text>
        </View>
        
        {currentWeather && (
          <View style={styles.weatherInfo}>
            <Text style={styles.locationText}>
              📍 {currentWeather.location}
            </Text>
            <Text style={styles.weatherText}>
              🌡️ {currentWeather.temperature}°C
            </Text>
            <Text style={styles.weatherDesc}>
              {currentWeather.description}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[
            styles.locationButton, 
            { backgroundColor: isGettingLocation ? '#9CA3AF' : primaryColor }
          ]}
          onPress={handleLocationPress}
          disabled={isGettingLocation}
        >
          <Text style={styles.locationButtonText}>
            {isGettingLocation ? '🔄 Mencari Lokasi...' : '📍 Gunakan Lokasi Saat Ini'}
          </Text>
        </TouchableOpacity>
        
        {userLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.coordText}>
              📍 {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadowPresets.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  weatherInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  weatherText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weatherDesc: {
    fontSize: 12,
    opacity: 0.8,
  },
  locationButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  mapView: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  weatherOverlay: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 180,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  interactiveHint: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  tapIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tapText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default WeatherMap;
