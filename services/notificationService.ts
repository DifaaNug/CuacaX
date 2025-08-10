import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import FirebaseNotificationService from './firebaseNotificationService';

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
  private static isExpoGo = true; // Assume Expo Go for now

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting notification permissions...');
      
      // Setup Android notification channels
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

      // Try Firebase first (works on web and development builds)
      const firebasePermission = await FirebaseNotificationService.requestPermissions();
      
      if (firebasePermission) {
        console.log('Firebase notification permissions granted');
        return true;
      }

      // Fallback to Expo notifications
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        console.log('Expo notification permissions granted');
        return true;
      }

      console.log('Notification permissions denied');
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get device token (FCM or Expo push token)
   */
  static async getDeviceToken(): Promise<string | null> {
    try {
      // Try Firebase FCM token first
      const fcmToken = await FirebaseNotificationService.getRegistrationToken();
      if (fcmToken) {
        console.log('Using Firebase FCM token');
        return fcmToken;
      }

      // Fallback to Expo push token
      if (this.isExpoGo) {
        console.log('Development mode: Using mock token for Expo Go');
        return `expo-mock-token-${Date.now()}`;
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync();
      console.log('Using Expo push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }

  /**
   * Save token to database
   */
  static async saveTokenToDatabase(): Promise<void> {
    try {
      console.log('Saving notification token to database...');
      
      // Use Firebase service for token management
      await FirebaseNotificationService.saveTokenToDatabase();
      
      console.log('Notification token saved successfully');
    } catch (error) {
      console.error('Error saving notification token:', error);
      throw error;
    }
  }

  /**
   * Schedule daily weather update notification
   */
  static async scheduleDailyWeatherUpdate(hour: number = 7): Promise<void> {
    try {
      console.log(`Scheduling daily weather update for ${hour}:00...`);
      
      // Use Firebase service for scheduling
      await FirebaseNotificationService.scheduleDailyWeatherUpdate(hour);
      
      console.log('Daily weather update scheduled successfully');
    } catch (error) {
      console.error('Error scheduling daily weather update:', error);
    }
  }

  /**
   * Send immediate notification
   */
  static async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      // Use Firebase service first
      await FirebaseNotificationService.sendWeatherAlert(title, body, data);
      
      // Fallback to Expo notifications for immediate display
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null, // Send immediately
      });
      
      console.log('Immediate notification sent:', title);
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  /**
   * Check and send weather alerts
   */
  static async checkAndSendWeatherAlerts(weather: any, airQuality: any, anomalies: any[]): Promise<void> {
    try {
      // Use Firebase service for weather alerts
      await FirebaseNotificationService.checkAndSendWeatherAlerts(weather, airQuality, anomalies);
    } catch (error) {
      console.error('Error checking and sending weather alerts:', error);
    }
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(): Promise<void> {
    try {
      await FirebaseNotificationService.testNotification();
      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Cleanup tokens on logout
   */
  static async cleanup(): Promise<void> {
    try {
      await FirebaseNotificationService.deleteToken();
      console.log('Notification service cleaned up');
    } catch (error) {
      console.error('Error cleaning up notification service:', error);
    }
  }
}

export default NotificationService;
