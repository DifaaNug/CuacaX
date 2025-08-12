import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [showEmbeddedMap, setShowEmbeddedMap] = useState(false);

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

  const translateWeatherDescription = (description: string) => {
    const translations: { [key: string]: string } = {
      'clear sky': 'Cerah',
      'few clouds': 'Sedikit Berawan',
      'scattered clouds': 'Berawan',
      'broken clouds': 'Berawan Tebal',
      'overcast clouds': 'Mendung',
      'shower rain': 'Hujan Ringan',
      'rain': 'Hujan',
      'light rain': 'Hujan Ringan',
      'moderate rain': 'Hujan Sedang',
      'heavy intensity rain': 'Hujan Lebat',
      'thunderstorm': 'Badai Petir',
      'snow': 'Salju',
      'mist': 'Kabut',
      'fog': 'Kabut Tebal',
      'haze': 'Berkabut',
      'drizzle': 'Gerimis'
    };
    
    const lowerDesc = description.toLowerCase();
    return translations[lowerDesc] || description.charAt(0).toUpperCase() + description.slice(1);
  };

  const handleMapAreaPress = () => {
    Alert.alert(
      'Pilih Tampilan Peta',
      'Bagaimana Anda ingin melihat peta?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Tampilkan di Aplikasi', 
          onPress: () => setShowEmbeddedMap(true)
        },
        { 
          text: 'Buka di Browser', 
          onPress: openWebMap 
        },
        {
          text: 'Input Koordinat Manual',
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

  const generateMapHTML = () => {
    const lat = currentWeather?.coordinates?.lat || -6.2088;
    const lon = currentWeather?.coordinates?.lon || 106.8456;
    const locationName = currentWeather?.location || 'Jakarta';
    const temperature = currentWeather?.temperature || 25;
    const description = translateWeatherDescription(currentWeather?.description || 'Cerah');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            #map { width: 100%; height: 100vh; }
            .weather-info {
                position: absolute;
                top: 10px;
                left: 10px;
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #3B82F6;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                z-index: 1000;
            }
        </style>
    </head>
    <body>
        <div class="weather-info">
            <div><strong>📍 ${locationName}</strong></div>
            <div>🌡️ ${temperature}°C</div>
            <div>☁️ ${description}</div>
        </div>
        <button class="close-btn" onclick="window.ReactNativeWebView?.postMessage('close')">Tutup</button>
        <iframe
            id="map"
            src="https://www.google.com/maps/embed/v1/view?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${lat},${lon}&zoom=12"
            allowfullscreen>
        </iframe>
        <script>
            // Handle map clicks if needed
            window.addEventListener('message', function(event) {
                if (event.data.type === 'coordinates') {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'locationSelected',
                        latitude: event.data.lat,
                        longitude: event.data.lon
                    }));
                }
            });
        </script>
    </body>
    </html>
    `;
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

      {/* Interactive Map - WebView or Placeholder */}
      {showEmbeddedMap ? (
        <View style={[
          styles.mapContainer,
          height ? { height: height - 160 } : { flex: 1 }
        ]}>
          <WebView
            source={{ html: generateMapHTML() }}
            style={styles.webMap}
            onMessage={(event) => {
              const data = event.nativeEvent.data;
              if (data === 'close') {
                setShowEmbeddedMap(false);
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'locationSelected' && onLocationSelect) {
                    onLocationSelect(parsed.latitude, parsed.longitude);
                  }
                } catch (error) {
                  console.log('WebView message parse error:', error);
                }
              }
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.mapPlaceholder, 
            { backgroundColor: primaryColor + '10' },
            height ? { height: height - 160 } : { flex: 1 }
          ]}
          onPress={handleMapAreaPress}
          activeOpacity={0.8}
        >
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapTitle}>Google Maps Interaktif</Text>
          <Text style={styles.mapSubtitle}>
            Tap untuk menampilkan peta interaktif{'\n'}dalam aplikasi atau browser
          </Text>
        </TouchableOpacity>
      )}

      {/* Weather Information Card */}
      {currentWeather && (
        <View style={styles.weatherInfoCard}>
          <View style={styles.weatherRow}>
            <Text style={styles.locationIcon}>�</Text>
            <Text style={styles.locationText}>{currentWeather.location}</Text>
          </View>
          <View style={styles.weatherRow}>
            <Text style={styles.tempIcon}>🌡️</Text>
            <Text style={styles.temperatureText}>{currentWeather.temperature}°C</Text>
          </View>
          <View style={styles.weatherRow}>
            <Text style={styles.descIcon}>☁️</Text>
            <Text style={styles.descriptionText}>
              {translateWeatherDescription(currentWeather.description)}
            </Text>
          </View>
        </View>
      )}

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
              📍 Koordinat: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
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
    lineHeight: 20,
  },
  weatherInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadowPresets.small,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  tempIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  descIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  weatherInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
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
    marginTop: 16,
    alignItems: 'center',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  webMap: {
    flex: 1,
    borderRadius: 12,
  },
});

export default WeatherMap;
