import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AirQualityData, TemperatureAnomaly, WeatherData } from '../types/weather';

// Only configure notifications for non-web platforms
if (Platform.OS !== 'web') {
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
}

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web platform');
      return false;
    }

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
    // Skip on web platform
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      // Get Expo push token (only for native platforms)
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
        await AsyncStorage.setItem('expo_push_token', token);
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }

  static setupNotificationListeners(): void {
    // Skip on web platform
    if (Platform.OS === 'web') {
      return;
    }

    // Listen for received notifications
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      
      // If it's a daily weather notification, schedule the next one
      if (notification.request.content.data?.type === 'daily_weather') {
        console.log('Daily weather notification received, scheduling next one...');
        this.scheduleDailyWeatherUpdate(7); // Re-schedule for tomorrow
      }
    });

    // Listen for notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      
      // Handle notification tap actions here if needed
      const notificationType = response.notification.request.content.data?.type;
      
      if (notificationType === 'daily_weather') {
        console.log('User tapped daily weather notification');
        // Could navigate to weather screen
      } else if (notificationType === 'weather_alert') {
        console.log('User tapped weather alert notification');
        // Could navigate to alerts screen
      }
    });
  }

  static async scheduleDailyWeatherUpdate(hour: number = 7): Promise<void> {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Scheduled notifications not supported on web');
      return;
    }

    try {
      // Cancel existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Calculate time until next notification
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, 0, 0, 0);
      
      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const timeDifference = scheduledTime.getTime() - now.getTime();
      
      if (Platform.OS === 'android') {
        // For Android, use TIME_INTERVAL trigger
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Cuaca Harian 🌤️',
            body: 'Periksa prakiraan cuaca dan kualitas udara hari ini!',
            data: { type: 'daily_weather' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.max(Math.floor(timeDifference / 1000), 60), // At least 60 seconds
            repeats: false, // We'll reschedule manually
          },
        });
        
        console.log(`Daily weather notification scheduled for Android in ${Math.floor(timeDifference / 1000 / 60)} minutes`);
      } else {
        // For iOS, use DATE trigger
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Cuaca Harian 🌤️',
            body: 'Periksa prakiraan cuaca dan kualitas udara hari ini!',
            data: { type: 'daily_weather' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: scheduledTime,
          },
        });
        
        console.log(`Daily weather notification scheduled for iOS at ${scheduledTime.toLocaleString()}`);
      }
      
    } catch (error) {
      console.error('Error scheduling daily weather update:', error);
      throw error;
    }
  }

  static async sendWeatherAlert(title: string, body: string, data: any = {}): Promise<void> {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Instant notifications not supported on web:', title);
      return;
    }

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
      // First check if user has enabled alerts
      const prefsJson = await AsyncStorage.getItem('userPreferences');
      if (prefsJson) {
        const userPrefs = JSON.parse(prefsJson);
        if (userPrefs.alertsEnabled === false) {
          console.log('🚫 Weather alerts disabled by user preferences - skipping all notifications');
          return;
        }
      }
      
      console.log('📢 Checking weather alerts with user preferences enabled');

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