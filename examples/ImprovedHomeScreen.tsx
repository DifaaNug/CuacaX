// Contoh implementasi perbaikan untuk home screen
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AirQualityCard } from '../components/AirQualityCard';
import { HealthTipsCard } from '../components/HealthTipsCard';
import { LastUpdate } from '../components/LastUpdate';
import { WeatherCard } from '../components/WeatherCard';
import { WeatherForecast } from '../components/WeatherForecast';
import { layouts, shadowPresets, spacing } from '../utils/enhancedStyleUtils';

export default function ImprovedHomeScreen() {
  // Mock data untuk contoh
  const mockWeatherData = {
    temperature: 26,
    description: 'light rain',
    feelsLike: 26,
    humidity: 74,
    windSpeed: 1.89,
    visibility: 10,
    pressure: 1010,
    icon: '10d',
    location: 'Cileunyi',
    uvIndex: 12,
    dewPoint: 22,
    coordinates: {
      lat: -6.9175,
      lon: 107.6191
    }
  };

  const mockForecast = [
    { day: 'Hari ini', icon: '🌦️', high: 26, low: 21, description: 'Hujan Ringan' },
    { day: 'Besok', icon: '⛅', high: 28, low: 22, description: 'Berawan' },
    { day: 'Kamis', icon: '☀️', high: 30, low: 23, description: 'Cerah' },
    { day: 'Jumat', icon: '🌧️', high: 25, low: 20, description: 'Hujan' },
    { day: 'Sabtu', icon: '⛅', high: 27, low: 21, description: 'Berawan' },
  ];

  const mockAirQuality = {
    aqi: 1,
    pm25: 3.27,
    pm10: 4.45,
    o3: 34.18,
    no2: 0.35,
    so2: 1.2,
    co: 0.8,
    quality: 'Good' as const,
    recommendations: [
      'Udara sangat baik untuk aktivitas outdoor',
      'Tidak diperlukan perlindungan khusus'
    ]
  };

  const mockHealthTips = [
    {
      id: '1',
      title: 'Tetap Terhidrasi',
      description: 'Minum banyak air sepanjang hari, bahkan jika Anda tidak merasa haus',
      category: 'heat' as const,
      conditions: ['suhu tinggi', 'cuaca panas'],
      icon: '💧'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Update Indicator */}
        <LastUpdate timestamp={new Date()} />
        
        {/* Main Weather Card */}
        <WeatherCard 
          weather={mockWeatherData}
          locationName="Cileunyi"
          showResetButton={true}
          style={styles.mainCard}
        />

        {/* Weather Forecast */}
        <WeatherForecast forecast={mockForecast} />

        {/* Air Quality & UV Index */}
        <AirQualityCard 
          airQuality={mockAirQuality}
          uvIndex={12}
        />

        {/* Health Tips */}
        <HealthTipsCard tips={mockHealthTips} />

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...layouts.container,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  mainCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadowPresets.heavy,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});
