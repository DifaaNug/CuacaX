import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { AirQualityCard } from '../../components/AirQualityCard';
import { AlertsCard } from '../../components/AlertsCard';
import { EmergencyTipsModal } from '../../components/EmergencyTipsModal';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { HealthTipsCard } from '../../components/HealthTipsCard';
import { LoadingAnimation } from '../../components/LoadingAnimation';
import { TemperatureAnomalyChart } from '../../components/TemperatureAnomalyChart';
import { WeatherCard } from '../../components/WeatherCard';
import { useLocation } from '../../contexts/LocationContext';
import { AlertService } from '../../services/alertService';
import { DatabaseService } from '../../services/databaseService';
import { HealthTipService } from '../../services/healthTipService';
import { NotificationService } from '../../services/notificationService';
import { WeatherService } from '../../services/weatherService';
import { AirQualityData, HealthTip, TemperatureAnomaly, Alert as WeatherAlert, WeatherData } from '../../types/weather';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [temperatureAnomalies, setTemperatureAnomalies] = useState<TemperatureAnomaly[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const { selectedLocation, resetToCurrentLocation } = useLocation();

  const getCurrentLocation = useCallback(async (): Promise<{ lat: number; lon: number } | null> => {
    try {
      // If a location is selected from favorites, use that
      if (selectedLocation) {
        return {
          lat: selectedLocation.latitude,
          lon: selectedLocation.longitude,
        };
      }

      // Otherwise get current GPS location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to Jakarta coordinates
      return {
        lat: -6.2088,
        lon: 106.8456,
      };
    }
  }, [selectedLocation]);

  const loadWeatherData = useCallback(async () => {
    try {
      const coords = await getCurrentLocation();
      if (!coords) return;

      // Load weather data
      const weather = await WeatherService.getCurrentWeather(coords.lat, coords.lon);
      const uvIndex = await WeatherService.getUVIndex(coords.lat, coords.lon);
      weather.uvIndex = uvIndex;
      setWeatherData(weather);

      // Load air quality data
      const airQualityData = await WeatherService.getAirQuality(coords.lat, coords.lon);
      setAirQuality(airQualityData);

      // Load temperature anomalies
      const anomalies = await WeatherService.getHistoricalData(coords.lat, coords.lon, 7);
      setTemperatureAnomalies(anomalies);

      // Check for alerts
      const temperatureAlerts = await AlertService.checkTemperatureAnomalies(anomalies, weather.location);
      const airQualityAlert = await AlertService.checkAirQuality(airQualityData, weather.location);
      const uvAlert = await AlertService.checkUVIndex(uvIndex, weather.location);
      
      const newAlerts = [
        ...temperatureAlerts,
        ...(airQualityAlert ? [airQualityAlert] : []),
        ...(uvAlert ? [uvAlert] : [])
      ];
      
      const existingAlerts = await AlertService.getActiveAlerts();
      
      // Deduplicate alerts by ID to prevent duplicate keys
      const allAlerts = [...newAlerts, ...existingAlerts];
      const uniqueAlerts = allAlerts.filter((alert, index, self) => 
        index === self.findIndex(a => a.id === alert.id)
      );
      
      setAlerts(uniqueAlerts);

      // Get health tips
      const hasHeatWave = anomalies.some(a => a.type === 'heat_wave');
      const hasColdWave = anomalies.some(a => a.type === 'cold_wave');
      
      const tips = HealthTipService.getRelevantTips(weather, airQualityData, hasHeatWave, hasColdWave);
      const emergencyHealthTips = HealthTipService.getEmergencyTips(weather, airQualityData);
      
      // Combine regular tips with emergency tips
      const allTips = [...tips, ...emergencyHealthTips];
      setHealthTips(allTips);

      // Save weather data to database for history
      await DatabaseService.saveWeatherHistory(weather);

      // Check and send weather alerts
      await NotificationService.checkAndSendWeatherAlerts(weather, airQualityData, anomalies);

    } catch (error) {
      console.error('Error loading weather data:', error);
      Alert.alert('Error', 'Gagal memuat data cuaca. Periksa koneksi internet Anda.');
    }
  }, [getCurrentLocation]);

  const requestLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Lokasi Diperlukan',
        'Aplikasi ini memerlukan akses lokasi untuk memberikan informasi cuaca yang akurat.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'OK', onPress: loadWeatherData }
        ]
      );
      return false;
    }
    return true;
  }, [loadWeatherData]);

  const initializeApp = useCallback(async () => {
    try {
      // Wait for location permission first
      await requestLocationPermission();
      await loadWeatherData();

      // Initialize notifications after auth is ready (with delay)
      setTimeout(async () => {
        try {
          const notificationPermission = await NotificationService.requestPermissions();
          if (notificationPermission) {
            await NotificationService.saveTokenToDatabase();
            // Schedule daily weather updates
            await NotificationService.scheduleDailyWeatherUpdate(7);
          }
        } catch (error) {
          console.log('Notification setup will retry later:', error);
        }
      }, 2000); // 2 second delay to ensure auth is ready
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Gagal memuat data cuaca. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [requestLocationPermission, loadWeatherData]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Reload weather data when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      loadWeatherData();
    }
  }, [selectedLocation, loadWeatherData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  }, [loadWeatherData]);

  const handleDismissAlert = async (alertId: string) => {
    try {
      await AlertService.dismissAlert(alertId);
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, isActive: false } : alert
        )
      );
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleEmergencyTips = () => {
    setShowEmergencyModal(true);
  };

  const getEmergencyTips = (): HealthTip[] => {
    return healthTips.filter(tip => 
      tip.category === 'heat' || 
      tip.category === 'cold' || 
      tip.category === 'air_quality' ||
      tip.category === 'uv'
    );
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Main Weather Card */}
      {weatherData && (
        <WeatherCard 
          weather={weatherData} 
          locationName={selectedLocation?.name}
          showResetButton={!!selectedLocation}
          onResetLocation={() => {
            resetToCurrentLocation();
            loadWeatherData();
          }}
        />
      )}

        {/* Alerts Section */}
        <AlertsCard 
          alerts={alerts} 
          onDismissAlert={handleDismissAlert}
        />

        {/* Air Quality and UV Index */}
        {airQuality && weatherData && (
          <AirQualityCard 
            airQuality={airQuality} 
            uvIndex={weatherData.uvIndex} 
          />
        )}

        {/* Temperature Anomaly Chart */}
        <TemperatureAnomalyChart anomalies={temperatureAnomalies} />

        {/* Health Tips */}
        <HealthTipsCard 
          tips={healthTips}
        />

        {/* Emergency Tips Modal */}
        <EmergencyTipsModal
          visible={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          emergencyTips={getEmergencyTips()}
        />

        {/* Floating Action Button for Emergency Tips */}
        <FloatingActionButton
          onPress={handleEmergencyTips}
          icon="🚨"
          backgroundColor="#EF4444"
        />
      </ScrollView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      backgroundColor: '#F3F4F6',
    },
    scrollContent: {
      paddingBottom: 100, // Extra space for floating button
      minHeight: screenWidth * 1.5, // Responsive min height
    },
  });
