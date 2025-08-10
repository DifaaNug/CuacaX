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

  const getGradientColors = (iconCode: string): readonly [string, string, ...string[]] => {
    if (iconCode.includes('01d')) return ['#4299E1', '#3182CE'] as const; // Sunny
    if (iconCode.includes('01n')) return ['#2D3748', '#1A202C'] as const; // Clear night
    if (iconCode.includes('02') || iconCode.includes('03')) return ['#63B3ED', '#4299E1'] as const; // Cloudy
    if (iconCode.includes('09') || iconCode.includes('10')) return ['#718096', '#4A5568'] as const; // Rainy
    if (iconCode.includes('11')) return ['#4A5568', '#2D3748'] as const; // Thunderstorm
    if (iconCode.includes('13')) return ['#E2E8F0', '#CBD5E0'] as const; // Snow
    if (iconCode.includes('50')) return ['#A0AEC0', '#718096'] as const; // Mist
    return ['#4299E1', '#3182CE'] as const; // Default
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
      <LinearGradient
        colors={getGradientColors(weather.icon)}
        style={[styles.container, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
          <View style={styles.detailItem}>
            <ThemedText style={styles.detailValue}>{weather.windSpeed} km/h</ThemedText>
            <ThemedText style={styles.detailLabel}>Angin</ThemedText>
          </View>

          <View style={styles.detailItem}>
            <ThemedText style={styles.detailValue}>{weather.humidity}%</ThemedText>
            <ThemedText style={styles.detailLabel}>Kelembaban</ThemedText>
          </View>

          <View style={styles.detailItem}>
            <ThemedText style={styles.detailValue}>{weather.visibility} km</ThemedText>
            <ThemedText style={styles.detailLabel}>Jarak Pandang</ThemedText>
          </View>

          <View style={styles.detailItem}>
            <ThemedText style={styles.detailValue}>{weather.pressure} hPa</ThemedText>
            <ThemedText style={styles.detailLabel}>Tekanan</ThemedText>
          </View>
        </View>
      </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: screenWidth * 0.06, // Responsive padding
    margin: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 400,
  },
  header: {
    marginBottom: 32,
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
    marginBottom: 40,
    zIndex: 1,
  },
  weatherIcon: {
    fontSize: Math.min(120, screenWidth * 0.3), // Responsive icon size
    marginBottom: 16,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: Math.min(64, screenWidth * 0.16), // Responsive font size
    fontWeight: '100',
    color: '#FFFFFF',
    lineHeight: Math.min(64, screenWidth * 0.16),
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: Math.min(20, screenWidth * 0.05), // Responsive font size
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  feelsLike: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
  },
  detailsWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: screenWidth * 0.15, // Minimum width for each item
    marginVertical: 5,
  },
  detailValue: {
    fontSize: Math.min(18, screenWidth * 0.045), // Responsive font size
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: Math.min(13, screenWidth * 0.032), // Responsive font size
    color: '#FFFFFF',
    opacity: 0.8,
    fontWeight: '500',
    textAlign: 'center',
  },
});
