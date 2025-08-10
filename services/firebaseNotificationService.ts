import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteToken, getMessaging, getToken, onMessage } from 'firebase/messaging';
import app, { auth, db } from '../lib/firebase';

import * as Device from 'expo-device';
import { Alert } from 'react-native';

class FirebaseNotificationService {
  private messaging: any = null;
  private isWeb = typeof window !== 'undefined';

  constructor() {
    if (this.isWeb) {
      try {
        this.messaging = getMessaging(app);
        this.setupMessageHandler();
      } catch (error) {
        console.log('Firebase messaging not available in this environment:', error);
      }
    }
  }

  /**
   * Request notification permissions and get FCM token
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isWeb) {
        console.log('FCM not supported in React Native Expo Go environment');
        return false;
      }

      // Check if Notification API is available (web only)
      if (typeof Notification === 'undefined') {
        console.log('Notification API not available in this environment');
        return false;
      }

      // Request permission for web
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM registration token
   */
  async getRegistrationToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.log('Messaging not initialized');
        return null;
      }

      const vapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.error('VAPID key not found');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: vapidKey
      });

      if (token) {
        console.log('FCM Registration Token:', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting registration token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to Firestore
   */
  async saveTokenToDatabase(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('User not authenticated, skipping token save');
        return;
      }

      const token = await this.getRegistrationToken();
      if (!token) {
        console.log('No token to save');
        return;
      }

      const tokenDoc = doc(db, 'fcmTokens', user.uid);
      
      await setDoc(tokenDoc, {
        token: token,
        userId: user.uid,
        platform: this.isWeb ? 'web' : 'mobile',
        deviceInfo: {
          brand: Device.brand || 'unknown',
          model: Device.modelName || 'unknown',
          os: Device.osName || 'unknown',
          version: Device.osVersion || 'unknown'
        },
        updatedAt: serverTimestamp(),
        isActive: true
      }, { merge: true });

      console.log('FCM token saved to database successfully');
    } catch (error) {
      console.error('Error saving FCM token to database:', error);
    }
  }

  /**
   * Setup foreground message handler
   */
  private setupMessageHandler(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      const { notification } = payload;
      
      if (notification) {
        // Show alert for foreground messages
        Alert.alert(
          notification.title || 'CuacaX',
          notification.body || 'New notification',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      }
    });
  }

  /**
   * Send weather alert notification via FCM
   */
  async sendWeatherAlert(title: string, body: string, data?: any): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Save notification to database for server to send
      const notificationDoc = doc(db, 'notifications', `${user.uid}_${Date.now()}`);
      
      await setDoc(notificationDoc, {
        userId: user.uid,
        title: title,
        body: body,
        data: data || {},
        type: 'weather_alert',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      console.log('Weather alert notification queued for sending');
    } catch (error) {
      console.error('Error queueing weather alert:', error);
    }
  }

  /**
   * Schedule daily weather update notification
   */
  async scheduleDailyWeatherUpdate(hour: number = 7): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Save schedule to database
      const scheduleDoc = doc(db, 'notificationSchedules', user.uid);
      
      await setDoc(scheduleDoc, {
        userId: user.uid,
        type: 'daily_weather',
        hour: hour,
        isActive: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log(`Daily weather notification scheduled for ${hour}:00`);
    } catch (error) {
      console.error('Error scheduling daily weather notification:', error);
    }
  }

  /**
   * Check and send weather alerts based on current conditions
   */
  async checkAndSendWeatherAlerts(weather: any, airQuality: any, anomalies: any[]): Promise<void> {
    try {
      // High temperature alert
      if (weather.temperature > 35) {
        await this.sendWeatherAlert(
          'Peringatan Suhu Tinggi! 🌡️',
          `Suhu saat ini ${weather.temperature}°C. Hindari aktivitas outdoor dan perbanyak minum air.`,
          { type: 'high_temperature', temperature: weather.temperature }
        );
      }

      // Poor air quality alert
      if (airQuality && airQuality.aqi > 150) {
        await this.sendWeatherAlert(
          'Kualitas Udara Buruk! 😷',
          `AQI saat ini ${airQuality.aqi}. Gunakan masker jika keluar rumah.`,
          { type: 'poor_air_quality', aqi: airQuality.aqi }
        );
      }

      // Temperature anomaly alerts
      const heatWave = anomalies.find(a => a.type === 'heat_wave');
      if (heatWave && heatWave.intensity !== undefined) {
        await this.sendWeatherAlert(
          'Gelombang Panas Terdeteksi! 🔥',
          `Suhu ${heatWave.intensity}°C di atas normal. Waspada heat stroke!`,
          { type: 'heat_wave', intensity: heatWave.intensity }
        );
      }

      const coldWave = anomalies.find(a => a.type === 'cold_wave');
      if (coldWave && coldWave.intensity !== undefined) {
        await this.sendWeatherAlert(
          'Cuaca Dingin Ekstrem! 🥶',
          `Suhu ${Math.abs(coldWave.intensity)}°C di bawah normal. Jaga kehangatan tubuh!`,
          { type: 'cold_wave', intensity: coldWave.intensity }
        );
      }
    } catch (error) {
      console.error('Error checking and sending weather alerts:', error);
    }
  }

  /**
   * Delete FCM token (for logout)
   */
  async deleteToken(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (this.messaging) {
        await deleteToken(this.messaging);
      }

      // Remove from database
      const tokenDoc = doc(db, 'fcmTokens', user.uid);
      await setDoc(tokenDoc, { isActive: false, deletedAt: serverTimestamp() }, { merge: true });

      console.log('FCM token deleted successfully');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<void> {
    await this.sendWeatherAlert(
      'Test Notification 🧪',
      'Firebase Cloud Messaging berhasil dikonfigurasi!',
      { type: 'test' }
    );
  }
}

export default new FirebaseNotificationService();
