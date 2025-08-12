import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HapticService } from '../services/hapticService';
import { WeatherData } from '../types/weather';

const { width: screenWidth } = Dimensions.get('window');

interface WeatherCardProps {
  weather: WeatherData;
  style?: any;
  locationName?: string;
  showResetButton?: boolean;
  onResetLocation?: () => void;
}

export function WeatherCard({ weather, style, locationName, showResetButton, onResetLocation }: WeatherCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);
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

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={[styles.container, style]}>
        {/* Header dengan aksen biru */}
        <LinearGradient
          colors={['#4A90E2', '#2563EB']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.header}>
            <View style={styles.locationContainer}>
              <View style={styles.locationBadge}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.location}>
                  {locationName || weather.location}
            </Text>
          </View>
          {showResetButton && onResetLocation && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                HapticService.medium();
                onResetLocation();
              }}
            >
              <Text style={styles.resetButtonText}>📍 GPS</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </Text>
      </View>
    </LinearGradient>

    {/* Body dengan background putih */}
    <View style={styles.mainWeather}>
      <Text style={styles.weatherIcon}>
        {getWeatherIcon(weather.icon)}
      </Text>
      <View style={styles.temperatureContainer}>
        <Text style={styles.temperature}>
          {weather.temperature}°
        </Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {translateWeatherDescription(weather.description)}
        </Text>
        <Text style={styles.feelsLike}>
          Terasa seperti {weather.feelsLike}°
        </Text>
      </View>
    </View>

      <View style={styles.detailsWrapper}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💨</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailValue}>{weather.windSpeed}</Text>
                <Text style={styles.detailUnit}>km/h</Text>
              </View>
              <Text style={styles.detailLabel}>Angin</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💧</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailValue}>{weather.humidity}</Text>
                <Text style={styles.detailUnit}>%</Text>
              </View>
              <Text style={styles.detailLabel}>Kelembaban</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👁️</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailValue}>{weather.visibility}</Text>
                <Text style={styles.detailUnit}>km</Text>
              </View>
              <Text style={styles.detailLabel}>Jarak Pandang</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🌡️</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailValue}>{weather.pressure}</Text>
                <Text style={styles.detailUnit}>hPa</Text>
              </View>
              <Text style={styles.detailLabel}>Tekanan</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>☀️</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailValue}>
                  {weather.sunrise ? weather.sunrise.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : '--:--'}
                </Text>
                <Text style={styles.detailUnit}></Text>
              </View>
              <Text style={styles.detailLabel}>Matahari Terbit</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🌙</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailValue}>
                  {weather.sunset ? weather.sunset.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : '--:--'}
                </Text>
                <Text style={styles.detailUnit}></Text>
              </View>
              <Text style={styles.detailLabel}>Matahari Terbenam</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    margin: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 480, // Increased height for sunrise/sunset
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  headerGradient: {
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenWidth * 0.05,
    paddingBottom: screenWidth * 0.04,
  },
  header: {
    marginBottom: 16, // More compact
    zIndex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: 'flex-start',
    maxWidth: screenWidth * 0.8, // Responsive max width
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  location: {
    fontSize: Math.min(18, screenWidth * 0.045), // Responsive font size
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  date: {
    fontSize: Math.min(15, screenWidth * 0.038), // Responsive font size
    color: '#FFFFFF',
    opacity: 0.85,
    marginTop: 8,
    fontWeight: '400',
  },
  mainWeather: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenWidth * 0.04,
  },
  weatherIcon: {
    fontSize: Math.min(100, screenWidth * 0.25), // Smaller icon
    marginBottom: 12, // Reduced margin
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: Math.min(64, screenWidth * 0.16), // Responsive font size
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: Math.min(64, screenWidth * 0.16),
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: Math.min(20, screenWidth * 0.05), // Responsive font size
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  feelsLike: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    color: '#6B7280',
    textAlign: 'center',
  },
  detailsWrapper: {
    backgroundColor: '#F3F7FF',
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginHorizontal: screenWidth * 0.05,
    marginBottom: screenWidth * 0.04,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    zIndex: 1,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12, // Reduced gap
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, // Reduced gap
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 75,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailIcon: {
    fontSize: 20, // Slightly smaller
    marginBottom: 6, // Reduced margin
  },
  detailTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: Math.min(20, screenWidth * 0.05),
    fontWeight: '700',
    color: '#1F2937',
  },
  detailUnit: {
    fontSize: Math.min(14, screenWidth * 0.035),
    fontWeight: '500',
    color: '#374151',
    opacity: 0.8,
    marginLeft: 2,
  },
  detailLabel: {
    fontSize: Math.min(12, screenWidth * 0.03),
    color: '#6B7280',
    opacity: 0.85,
    fontWeight: '500',
    textAlign: 'center',
  },
});
