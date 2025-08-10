import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AirQualityData, TemperatureAnomaly, WeatherData } from '../types/weather';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return false;
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('weather-alerts', {
          name: 'Weather Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        await Notifications.setNotificationChannelAsync('emergency-weather', {
          name: 'Emergency Weather',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
          sound: 'default',
        });
      }

      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async getDeviceToken(): Promise<string | null> {
    try {
      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Using Expo push token');
      return token.data;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  static async saveTokenToDatabase(): Promise<void> {
    try {
      const token = await this.getDeviceToken();
      if (token) {
        console.log('Device token saved locally:', token);
        // Could save to AsyncStorage or Firebase if needed
      }
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  }

  static async scheduleDailyWeatherUpdate(hour: number = 7): Promise<void> {
    try {
      // Cancel existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Schedule daily weather update
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Weather Update',
          body: 'Check today\'s weather forecast and air quality!',
          data: { type: 'daily_weather' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute: 0,
          repeats: true,
        },
      });
      
      console.log(`Daily weather notification scheduled for ${hour}:00`);
    } catch (error) {
      console.error('Error scheduling daily weather update:', error);
    }
  }

  static async sendWeatherAlert(title: string, body: string, data: any = {}): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'weather_alert', ...data },
        },
        trigger: null, // Send immediately
      });
      
      console.log('Weather alert sent:', title);
    } catch (error) {
      console.error('Error sending weather alert:', error);
    }
  }

  static async checkAndSendWeatherAlerts(
    weather: WeatherData,
    airQuality: AirQualityData,
    anomalies: TemperatureAnomaly[]
  ): Promise<void> {
    try {
      // Check for extreme weather conditions
      if (weather.temperature > 35) {
        await this.sendWeatherAlert(
          'High Temperature Alert',
          `Temperature is ${weather.temperature}°C. Stay hydrated and avoid prolonged sun exposure.`,
          { temperature: weather.temperature }
        );
      }

      if (weather.temperature < 10) {
        await this.sendWeatherAlert(
          'Low Temperature Alert',
          `Temperature is ${weather.temperature}°C. Dress warmly and take care.`,
          { temperature: weather.temperature }
        );
      }

      // Check air quality
      if (airQuality.aqi >= 4) {
        await this.sendWeatherAlert(
          'Poor Air Quality Alert',
          `Air quality is ${airQuality.quality}. Limit outdoor activities.`,
          { aqi: airQuality.aqi }
        );
      }

      // Check temperature anomalies
      const todayAnomaly = anomalies[anomalies.length - 1];
      if (todayAnomaly && Math.abs(todayAnomaly.anomaly) > 7) {
        await this.sendWeatherAlert(
          'Temperature Anomaly Alert',
          `Temperature is ${todayAnomaly.anomaly > 0 ? 'much higher' : 'much lower'} than normal.`,
          { anomaly: todayAnomaly.anomaly }
        );
      }
    } catch (error) {
      console.error('Error checking and sending weather alerts:', error);
    }
  }

  static async sendTestNotification(): Promise<void> {
    try {
      await this.sendWeatherAlert(
        'Test Notification',
        'This is a test notification from CuacaX weather app!',
        { test: true }
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  static async deleteToken(): Promise<void> {
    try {
      // For Expo, we don't need to explicitly delete tokens
      console.log('Token deletion handled by Expo');
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  }
}