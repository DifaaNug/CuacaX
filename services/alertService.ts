import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AirQualityData, Alert, TemperatureAnomaly } from '../types/weather';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class AlertService {
  private static readonly ALERTS_STORAGE_KEY = 'weather_alerts';
  private static readonly PREFERENCES_STORAGE_KEY = 'notification_preferences';

  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  static async checkTemperatureAnomalies(anomalies: TemperatureAnomaly[], location: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const preferences = await this.getNotificationPreferences();
    
    for (const anomaly of anomalies) {
      if (anomaly.type === 'heat_wave' && preferences.heatWave) {
        const alert = this.createHeatWaveAlert(anomaly, location);
        alerts.push(alert);
        await this.sendNotification(alert);
      } else if (anomaly.type === 'cold_wave' && preferences.coldWave) {
        const alert = this.createColdWaveAlert(anomaly, location);
        alerts.push(alert);
        await this.sendNotification(alert);
      }
    }
    
    await this.saveAlerts(alerts);
    return alerts;
  }

  static async checkAirQuality(airQuality: AirQualityData, location: string): Promise<Alert | null> {
    const preferences = await this.getNotificationPreferences();
    
    if (!preferences.airQuality || airQuality.aqi <= 2) {
      return null;
    }
    
    const alert: Alert = {
      id: `air_quality_${Date.now()}`,
      type: 'poor_air_quality',
      title: `Poor Air Quality Alert - ${location}`,
      message: `Air quality is ${airQuality.quality.toLowerCase()} (AQI: ${airQuality.aqi}). ${airQuality.recommendations[0]}`,
      severity: airQuality.aqi >= 4 ? 'high' : 'medium',
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: airQuality.recommendations
    };
    
    await this.sendNotification(alert);
    await this.saveAlert(alert);
    return alert;
  }

  static async checkUVIndex(uvIndex: number, location: string): Promise<Alert | null> {
    const preferences = await this.getNotificationPreferences();
    
    if (!preferences.uvIndex || uvIndex < 8) {
      return null;
    }
    
    const alert: Alert = {
      id: `uv_index_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'high_uv',
      title: `High UV Index Alert - ${location}`,
      message: `UV Index is very high (${uvIndex}). Limit sun exposure and use sunscreen.`,
      severity: uvIndex >= 11 ? 'extreme' : 'high',
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: [
        'Apply SPF 30+ sunscreen',
        'Wear protective clothing',
        'Seek shade during peak hours (10 AM - 4 PM)',
        'Wear sunglasses and a wide-brimmed hat'
      ]
    };
    
    await this.sendNotification(alert);
    await this.saveAlert(alert);
    return alert;
  }

  private static createHeatWaveAlert(anomaly: TemperatureAnomaly, location: string): Alert {
    const severityMessages = {
      medium: 'Take precautions to stay cool.',
      high: 'Heat wave conditions detected. Stay hydrated and avoid prolonged sun exposure.',
      extreme: 'Extreme heat wave! Stay indoors and seek air conditioning.'
    };
    
    const recommendations = {
      medium: [
        'Drink plenty of water',
        'Wear light-colored, loose clothing',
        'Limit outdoor activities during peak hours'
      ],
      high: [
        'Stay hydrated with water and electrolytes',
        'Remain indoors during peak heat hours',
        'Wear protective clothing and sunscreen',
        'Check on elderly and vulnerable individuals'
      ],
      extreme: [
        'Stay indoors with air conditioning',
        'Drink water regularly, even if not thirsty',
        'Avoid alcohol and caffeine',
        'Never leave anyone in a parked vehicle',
        'Seek immediate medical attention for heat exhaustion symptoms'
      ]
    };
    
    return {
      id: `heat_wave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'heat_wave',
      title: `Heat Wave Alert - ${location}`,
      message: `Temperature ${anomaly.temperature}°C (${anomaly.anomaly > 0 ? '+' : ''}${anomaly.anomaly}°C above normal). ${severityMessages[anomaly.severity as keyof typeof severityMessages]}`,
      severity: anomaly.severity,
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: recommendations[anomaly.severity as keyof typeof recommendations]
    };
  }

  private static createColdWaveAlert(anomaly: TemperatureAnomaly, location: string): Alert {
    const severityMessages = {
      medium: 'Dress warmly and be cautious of cold weather.',
      high: 'Cold wave conditions detected. Take extra precautions against cold.',
      extreme: 'Extreme cold wave! Avoid prolonged outdoor exposure.'
    };
    
    const recommendations = {
      medium: [
        'Dress in layers',
        'Wear warm clothing and accessories',
        'Limit time outdoors'
      ],
      high: [
        'Dress in multiple layers',
        'Cover exposed skin',
        'Keep homes adequately heated',
        'Check on elderly and vulnerable individuals'
      ],
      extreme: [
        'Avoid unnecessary outdoor exposure',
        'Dress in multiple warm layers',
        'Protect extremities from frostbite',
        'Ensure adequate home heating',
        'Seek immediate medical attention for hypothermia symptoms'
      ]
    };
    
    return {
      id: `cold_wave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'cold_wave',
      title: `Cold Wave Alert - ${location}`,
      message: `Temperature ${anomaly.temperature}°C (${anomaly.anomaly}°C below normal). ${severityMessages[anomaly.severity as keyof typeof severityMessages]}`,
      severity: anomaly.severity,
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: recommendations[anomaly.severity as keyof typeof recommendations]
    };
  }

  private static async sendNotification(alert: Alert): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;
    
    const severityPriority = {
      low: Notifications.AndroidNotificationPriority.DEFAULT,
      medium: Notifications.AndroidNotificationPriority.HIGH,
      high: Notifications.AndroidNotificationPriority.MAX,
      extreme: Notifications.AndroidNotificationPriority.MAX
    };
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: alert.message,
        data: { alertId: alert.id, type: alert.type },
        priority: severityPriority[alert.severity],
      },
      trigger: null, // Send immediately
    });
  }

  private static async saveAlert(alert: Alert): Promise<void> {
    try {
      const existingAlerts = await this.getStoredAlerts();
      const updatedAlerts = [alert, ...existingAlerts.slice(0, 49)]; // Keep only last 50 alerts
      await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  }

  private static async saveAlerts(alerts: Alert[]): Promise<void> {
    try {
      const existingAlerts = await this.getStoredAlerts();
      const updatedAlerts = [...alerts, ...existingAlerts].slice(0, 50); // Keep only last 50 alerts
      await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  static async getStoredAlerts(): Promise<Alert[]> {
    try {
      const alertsJson = await AsyncStorage.getItem(this.ALERTS_STORAGE_KEY);
      if (!alertsJson) return [];
      
      const alerts = JSON.parse(alertsJson);
      return alerts.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
    } catch (error) {
      console.error('Error getting stored alerts:', error);
      return [];
    }
  }

  static async getActiveAlerts(): Promise<Alert[]> {
    const alerts = await this.getStoredAlerts();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return alerts.filter(alert => 
      alert.isActive && alert.timestamp > twentyFourHoursAgo
    );
  }

  static async dismissAlert(alertId: string): Promise<void> {
    try {
      const alerts = await this.getStoredAlerts();
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, isActive: false } : alert
      );
      await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  }

  private static async getNotificationPreferences() {
    try {
      const prefsJson = await AsyncStorage.getItem(this.PREFERENCES_STORAGE_KEY);
      if (!prefsJson) {
        return {
          heatWave: true,
          coldWave: true,
          airQuality: true,
          uvIndex: true,
          severeWeather: true
        };
      }
      return JSON.parse(prefsJson);
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        heatWave: true,
        coldWave: true,
        airQuality: true,
        uvIndex: true,
        severeWeather: true
      };
    }
  }

  static async updateNotificationPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }
}
