import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { AirQualityData } from '../types/weather';

const { width: screenWidth } = Dimensions.get('window');

interface AirQualityCardProps {
  airQuality: AirQualityData;
  uvIndex: number;
}

export function AirQualityCard({ airQuality, uvIndex }: AirQualityCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10B981';
    if (aqi <= 100) return '#F59E0B';
    if (aqi <= 150) return '#EF4444';
    if (aqi <= 200) return '#9333EA';
    if (aqi <= 300) return '#7C2D12';
    return '#450A0A';
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return 'Baik';
    if (aqi <= 100) return 'Sedang';
    if (aqi <= 150) return 'Tidak Sehat';
    if (aqi <= 200) return 'Sangat Tidak Sehat';
    if (aqi <= 300) return 'Berbahaya';
    return 'Ekstrem';
  };

  const getUVColor = (uv: number) => {
    if (uv <= 2) return '#10B981';
    if (uv <= 5) return '#F59E0B';
    if (uv <= 7) return '#F97316';
    if (uv <= 10) return '#EF4444';
    return '#9333EA';
  };

  const getUVStatus = (uv: number) => {
    if (uv <= 2) return 'Rendah';
    if (uv <= 5) return 'Sedang';
    if (uv <= 7) return 'Tinggi';
    if (uv <= 10) return 'Sangat Tinggi';
    return 'Ekstrem';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.cardsRow}>
        {/* Air Quality Card */}
        <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: getAQIColor(airQuality.aqi) }]}>
              <Text style={styles.cardIcon}>💨</Text>
            </View>
            <Text style={styles.cardTitle}>Kualitas Udara</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressRing, { borderColor: getAQIColor(airQuality.aqi) }]}>
              <Text style={styles.progressValue}>{airQuality.aqi}</Text>
            </View>
            <Text style={styles.progressLabel}>AQI</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getAQIColor(airQuality.aqi) }]}>
            <Text style={styles.statusText}>{getAQIStatus(airQuality.aqi)}</Text>
          </View>

          <View style={styles.pollutantsGrid}>
            <View style={styles.pollutantItem}>
              <Text style={styles.pollutantLabel}>PM2.5</Text>
              <Text style={styles.pollutantValue}>{airQuality.pm25}</Text>
            </View>
            <View style={styles.pollutantItem}>
              <Text style={styles.pollutantLabel}>PM10</Text>
              <Text style={styles.pollutantValue}>{airQuality.pm10}</Text>
            </View>
            <View style={styles.pollutantItem}>
              <Text style={styles.pollutantLabel}>O₃</Text>
              <Text style={styles.pollutantValue}>{airQuality.o3}</Text>
            </View>
            <View style={styles.pollutantItem}>
              <Text style={styles.pollutantLabel}>NO₂</Text>
              <Text style={styles.pollutantValue}>{airQuality.no2}</Text>
            </View>
          </View>
        </View>

        {/* UV Index Card */}
        <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: getUVColor(uvIndex) }]}>
              <Text style={styles.cardIcon}>☀️</Text>
            </View>
            <Text style={styles.cardTitle}>Indeks UV</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressRing, { borderColor: getUVColor(uvIndex) }]}>
              <Text style={styles.progressValue}>{uvIndex}</Text>
            </View>
            <Text style={styles.progressLabel}>UV</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getUVColor(uvIndex) }]}>
            <Text style={styles.statusText}>{getUVStatus(uvIndex)}</Text>
          </View>

          <View style={styles.uvScale}>
            <LinearGradient
              colors={['#10B981', '#F59E0B', '#F97316', '#EF4444', '#9333EA']}
              style={styles.uvBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.uvLabels}>
              <Text style={styles.uvLabel}>0</Text>
              <Text style={styles.uvLabel}>5</Text>
              <Text style={styles.uvLabel}>11+</Text>
            </View>
          </View>

          <View style={styles.recommendations}>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationIcon}>💡</Text>
              <Text style={styles.recommendationText}>
                Hindari paparan sinar matahari
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationIcon}>👕</Text>
              <Text style={styles.recommendationText}>
                Gunakan kacamata hitam dan topi
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  cardsRow: {
    flexDirection: screenWidth < 400 ? 'column' : 'row', // Stack on small screens
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: screenWidth * 0.05, // Responsive padding
    backgroundColor: '#FFFFFF',
    minHeight: 280,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: Math.min(40, screenWidth * 0.1), // Responsive icon size
    height: Math.min(40, screenWidth * 0.1),
    borderRadius: Math.min(20, screenWidth * 0.05),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: Math.min(20, screenWidth * 0.05),
  },
  cardTitle: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    fontWeight: '600',
    color: '#1F2937',
    flexShrink: 1,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressRing: {
    width: Math.min(80, screenWidth * 0.2), // Responsive ring size
    height: Math.min(80, screenWidth * 0.2),
    borderRadius: Math.min(40, screenWidth * 0.1),
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: Math.min(24, screenWidth * 0.06), // Responsive font size
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: Math.min(12, screenWidth * 0.03), // Responsive font size
    fontWeight: '600',
  },
  pollutantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  pollutantItem: {
    backgroundColor: '#F9FAFB',
    flex: screenWidth < 400 ? 1 : 0, // Full width on small screens
    minWidth: screenWidth < 400 ? '48%' : 60, // Responsive min width
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  pollutantLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  pollutantValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  uvScale: {
    marginBottom: 16,
  },
  uvBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  uvLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uvLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  recommendations: {
    gap: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    fontWeight: '500',
  },
});
