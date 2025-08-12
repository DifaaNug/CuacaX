import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WeatherData } from '../types/weather';
import { ThemedText } from './ThemedText';

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
                <ThemedText style={styles.location}>
                  {locationName || weather.location}
            </ThemedText>
          </View>
          {showResetButton && onResetLocation && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={onResetLocation}
            >
              <Text style={styles.resetButtonText}>📍 GPS</Text>
            </TouchableOpacity>
          )}
        </View>
        <ThemedText style={styles.date}>
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </ThemedText>
      </View>
    </LinearGradient>

    {/* Body dengan background putih */}
    <View style={styles.mainWeather}>
      <Text style={styles.weatherIcon}>
        {getWeatherIcon(weather.icon)}
      </Text>
      <View style={styles.temperatureContainer}>
        <ThemedText style={styles.temperature}>
          {weather.temperature}°
        </ThemedText>
      </View>
      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.description}>
          {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
        </ThemedText>
        <ThemedText style={styles.feelsLike}>
          Terasa seperti {weather.feelsLike}°
        </ThemedText>
      </View>
    </View>

      <View style={styles.detailsWrapper}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💨</Text>
              <View style={styles.detailTextContainer}>
                <ThemedText style={styles.detailValue}>{weather.windSpeed}</ThemedText>
                <ThemedText style={styles.detailUnit}>km/h</ThemedText>
              </View>
              <ThemedText style={styles.detailLabel}>Angin</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💧</Text>
              <View style={styles.detailTextContainer}>
                <ThemedText style={styles.detailValue}>{weather.humidity}</ThemedText>
                <ThemedText style={styles.detailUnit}>%</ThemedText>
              </View>
              <ThemedText style={styles.detailLabel}>Kelembaban</ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👁️</Text>
              <View style={styles.detailTextContainer}>
                <ThemedText style={styles.detailValue}>{weather.visibility}</ThemedText>
                <ThemedText style={styles.detailUnit}>km</ThemedText>
              </View>
              <ThemedText style={styles.detailLabel}>Jarak Pandang</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🌡️</Text>
              <View style={styles.detailTextContainer}>
                <ThemedText style={styles.detailValue}>{weather.pressure}</ThemedText>
                <ThemedText style={styles.detailUnit}>hPa</ThemedText>
              </View>
              <ThemedText style={styles.detailLabel}>Tekanan</ThemedText>
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
    minHeight: 420,
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
