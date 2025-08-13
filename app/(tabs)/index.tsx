import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AirQualityCard } from '../../components/AirQualityCard';
import { AlertsCard } from '../../components/AlertsCard';
import { ErrorState } from '../../components/ErrorState';
import { HealthTipsCard } from '../../components/HealthTipsCard';
import { LastUpdate } from '../../components/LastUpdate';
import { TemperatureAnomalyChart } from '../../components/TemperatureAnomalyChart';
import { WeatherCard } from '../../components/WeatherCard';
import { WeatherForecast } from '../../components/WeatherForecast';
import { WeatherSkeleton } from '../../components/WeatherSkeleton';
import { LocationData, useLocation } from '../../contexts/LocationContext';
import { AlertService } from '../../services/alertService';
import { DatabaseService } from '../../services/databaseService';
import { HapticService } from '../../services/hapticService';
import { HealthTipService } from '../../services/healthTipService';
import { NotificationService } from '../../services/notificationService';
import { WeatherService } from '../../services/weatherService';
import { AirQualityData, HealthTip, TemperatureAnomaly, Alert as WeatherAlert, WeatherData } from '../../types/weather';
import { spacing } from '../../utils/enhancedStyleUtils';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [temperatureAnomalies, setTemperatureAnomalies] = useState<TemperatureAnomaly[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { selectedLocation, resetToCurrentLocation } = useLocation();
  
  // Use ref to prevent excessive reloads when location changes rapidly
  const isLoadingWeatherRef = useRef(false);
  const lastSelectedLocationRef = useRef<LocationData | null>(null);

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

  const generateRealForecast = useCallback(async (lat: number, lon: number) => {
    try {
      console.log('🌅 Generating forecast for:', lat, lon);
      const forecastData = await WeatherService.getForecast(lat, lon);
      console.log('✅ Forecast data received:', forecastData?.length || 0, 'items');
      
      if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
        console.warn('⚠️ No forecast data available, returning empty array');
        return [];
      }
      
      const getDayName = (dayOffset: number) => {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayOffset);
        
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return dayNames[targetDate.getDay()];
      };
      
      return forecastData.slice(0, 5).map((forecast, index) => {
        if (!forecast || !forecast.temperature) {
          console.warn('⚠️ Invalid forecast item at index', index, forecast);
          return {
            day: getDayName(index),
            icon: '🌤️',
            high: 30,
            low: 24,
            description: 'Cuaca Tidak Tersedia'
          };
        }
        
        return {
          day: getDayName(index),
          icon: getWeatherIcon(forecast.icon || '01d'),
          high: forecast.temperature.max || 30,
          low: forecast.temperature.min || 24,
          description: translateWeatherDescription(forecast.description || 'clear sky')
        };
      });
    } catch (error) {
      console.error('❌ Error generating real forecast:', error);
      // Fallback to mock data if API fails
      return [];
    }
  }, []);

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

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  const loadWeatherData = useCallback(async () => {
    try {
      console.log('🌤️ Starting to load weather data...');
      setError(null); // Clear any previous errors
      const coords = await getCurrentLocation();
      if (!coords) {
        console.warn('⚠️ No coordinates available');
        return;
      }

      console.log('📍 Got coordinates:', coords);

      // Load weather data
      console.log('☀️ Fetching current weather...');
      const weather = await WeatherService.getCurrentWeather(coords.lat, coords.lon);
      console.log('✅ Weather data loaded:', weather.location, weather.temperature + '°C');
      
      console.log('🌅 Fetching UV index...');
      const uvIndex = await WeatherService.getUVIndex(coords.lat, coords.lon);
      weather.uvIndex = uvIndex;
      setWeatherData(weather);
      console.log('✅ UV index loaded:', uvIndex);

      // Generate real forecast data
      console.log('📅 Generating forecast...');
      const forecast = await generateRealForecast(coords.lat, coords.lon);
      setForecastData(forecast);
      console.log('✅ Forecast loaded:', forecast.length, 'days');

      // Update timestamp
      setLastUpdate(new Date());

      // Load air quality data
      console.log('🌬️ Fetching air quality...');
      let airQualityData: AirQualityData | null = null;
      try {
        airQualityData = await WeatherService.getAirQuality(coords.lat, coords.lon);
        setAirQuality(airQualityData);
        console.log('✅ Air quality loaded:', airQualityData.quality);
      } catch (airError) {
        console.warn('⚠️ Air quality failed, using fallback:', airError);
        setAirQuality(null);
      }

      // Load temperature anomalies with current temperature for realistic simulation
      console.log('📊 Fetching temperature anomalies...');
      let anomalies: TemperatureAnomaly[] = [];
      try {
        anomalies = await WeatherService.getHistoricalData(coords.lat, coords.lon, 7, weather.temperature);
        setTemperatureAnomalies(anomalies);
        console.log('✅ Temperature anomalies loaded:', anomalies.length, 'days');
      } catch (anomalyError) {
        console.warn('⚠️ Temperature anomalies failed, using fallback:', anomalyError);
        setTemperatureAnomalies([]);
      }

      // Check for alerts
      const temperatureAlerts = await AlertService.checkTemperatureAnomalies(anomalies, weather.location);
      const airQualityAlert = airQualityData ? await AlertService.checkAirQuality(airQualityData, weather.location) : null;
      const uvAlert = await AlertService.checkUVIndex(uvIndex, weather.location);
      
      const newAlerts = [
        ...temperatureAlerts,
        ...(airQualityAlert ? [airQualityAlert] : []),
        ...(uvAlert ? [uvAlert] : [])
      ];
      
      // Debug logging for development
      if (__DEV__) {
        console.log('New alerts generated:', newAlerts.length);
      }
      
      // Clear old alerts and only keep today's relevant alerts
      const today = new Date().toDateString();
      const existingAlerts = await AlertService.getActiveAlerts();
      
      // Filter existing alerts to only keep today's alerts
      const todayExistingAlerts = existingAlerts.filter(alert => 
        new Date(alert.timestamp).toDateString() === today
      );
      
      // Merge with new alerts, avoiding duplicates
      const allAlerts = [...todayExistingAlerts];
      newAlerts.forEach(newAlert => {
        const exists = allAlerts.some(existing => 
          existing.id === newAlert.id || 
          (existing.type === newAlert.type && 
           existing.location === newAlert.location)
        );
        if (!exists) {
          allAlerts.push(newAlert);
        }
      });
      
      if (__DEV__) {
        console.log('Final alerts count (today only):', allAlerts.length);
        console.log('🎯 Setting alerts in UI state (always display for user awareness)');
      }
      
      // Always display alerts in UI for user awareness - push notification preferences are handled separately
      setAlerts(allAlerts);
      
      if (__DEV__) {
        console.log('✅ Alerts set in UI state:', allAlerts.length);
      }

      // Get health tips
      const hasHeatWave = anomalies.some((a: TemperatureAnomaly) => a.type === 'heat_wave');
      const hasColdWave = anomalies.some((a: TemperatureAnomaly) => a.type === 'cold_wave');
      
      const tips = HealthTipService.getRelevantTips(weather, airQualityData || undefined, hasHeatWave, hasColdWave);
      setHealthTips(tips);

      // Save weather data to database for history
      await DatabaseService.logWeatherData(weather);

      // Check and send weather alerts (only if airQualityData is available)
      if (airQualityData) {
        await NotificationService.checkAndSendWeatherAlerts(weather, airQualityData, anomalies);
      }

    } catch (error) {
      console.error('Error loading weather data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data cuaca. Periksa koneksi internet Anda.';
      setError(errorMessage);
      HapticService.error(); // Error haptic feedback
    }
  }, [getCurrentLocation, generateRealForecast]);

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
      // Clear any old English alerts first
      await AlertService.clearEnglishAlerts();
      
      // Sync existing favorite locations to Firebase
      setTimeout(async () => {
        await DatabaseService.syncFavoriteLocationsToFirebase();
      }, 2000); // Wait 2 seconds for Firebase to be ready
      
      // Wait for location permission first
      await requestLocationPermission();
      await loadWeatherData();

      // Initialize notifications after auth is ready (with delay)
      setTimeout(async () => {
        try {
          // Check user preferences before setting up notifications
          const userPrefs = await DatabaseService.getUserPreferences();
          const notificationsEnabled = userPrefs?.alertsEnabled !== false; // Default to true if not set
          
          if (notificationsEnabled) {
            const notificationPermission = await NotificationService.requestPermissions();
            if (notificationPermission) {
              await NotificationService.saveTokenToDatabase();
              // Schedule daily weather updates
              await NotificationService.scheduleDailyWeatherUpdate(7);
            }
          } else {
            console.log('Notifications disabled by user preferences');
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
    // Clear any old English alerts on app start
    AlertService.clearEnglishAlerts();
  }, [initializeApp]);

  // Reload weather data when selected location changes - but prevent initial double call
  useEffect(() => {
    if (selectedLocation && weatherData && !isLoadingWeatherRef.current) {
      const prevLocation = lastSelectedLocationRef.current;
      const currentLocation = selectedLocation;
      
        // Only reload if location actually changed
        if (!prevLocation || 
            prevLocation.latitude !== currentLocation.latitude || 
            prevLocation.longitude !== currentLocation.longitude) {
          
          if (__DEV__) {
            console.log('🔄 Location changed to:', selectedLocation.name);
          }
          isLoadingWeatherRef.current = true;
          lastSelectedLocationRef.current = selectedLocation;        // Add a small delay to prevent rapid successive calls
        const timer = setTimeout(async () => {
          try {
            await loadWeatherData();
          } finally {
            isLoadingWeatherRef.current = false;
          }
        }, 500); // 500ms delay to prevent rapid calls
        
        return () => {
          clearTimeout(timer);
          isLoadingWeatherRef.current = false;
        };
      }
    }
  }, [selectedLocation, weatherData, loadWeatherData]);

  const onRefresh = useCallback(async () => {
    HapticService.light(); // Haptic feedback on refresh
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
    HapticService.success(); // Success feedback when done
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

  if (loading) {
    return <WeatherSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => {
      setError(null);
      loadWeatherData();
    }} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Update Indicator */}
        <LastUpdate timestamp={lastUpdate} />

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

        {/* Weather Forecast */}
        {forecastData.length > 0 && (
          <WeatherForecast forecast={forecastData} />
        )}

        {/* Air Quality and UV Index */}
        {airQuality && weatherData && (
          <AirQualityCard 
            airQuality={airQuality} 
            uvIndex={weatherData.uvIndex} 
          />
        )}

        {/* Alerts Section - Only show if there are alerts */}
        {alerts.length > 0 && (
          <AlertsCard 
            alerts={alerts} 
            onDismissAlert={handleDismissAlert}
          />
        )}

        {/* Temperature Anomaly Chart */}
        <TemperatureAnomalyChart anomalies={temperatureAnomalies} />

        {/* Health Tips */}
        <HealthTipsCard 
          tips={healthTips}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg, // Reduced padding since no FAB
    minHeight: screenWidth * 1.2,
  },
});