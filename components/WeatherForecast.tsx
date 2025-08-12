import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ForecastItem {
  day: string;
  icon: string;
  high: number;
  low: number;
  description: string;
}

interface WeatherForecastProps {
  forecast: ForecastItem[];
}

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  if (!forecast || forecast.length === 0) {
    return null; // Don't render if no forecast data
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📅</Text>
        <Text style={styles.title}>Prakiraan 5 Hari</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.forecastContainer}
      >
        {forecast.map((item, index) => (
          <View key={index} style={styles.forecastItem}>
            <Text style={styles.dayText}>{item.day}</Text>
            <Text style={styles.forecastIcon}>{item.icon}</Text>
            <View style={styles.temperatureContainer}>
              <Text style={styles.highTemp}>{Math.round(item.high)}°</Text>
              <Text style={styles.lowTemp}>{Math.round(item.low)}°</Text>
            </View>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  forecastContainer: {
    paddingHorizontal: 12,
  },
  forecastItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  forecastIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  temperatureContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  highTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  lowTemp: {
    fontSize: 14,
    color: '#6B7280',
  },
  descriptionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 80,
  },
});
