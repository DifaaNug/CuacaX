import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AirQualityData, Alert, TemperatureAnomaly } from '../types/weather';

// Only configure notifications for non-web platforms
if (Platform.OS !== 'web') {
  // Configure notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export class AlertService {
  private static readonly ALERTS_STORAGE_KEY = 'weather_alerts';
  private static readonly PREFERENCES_STORAGE_KEY = 'notification_preferences';

  static async requestPermissions(): Promise<boolean> {
    // Skip on web platform
    if (Platform.OS === 'web') {
      return false;
    }

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
    
    // Only check TODAY's anomaly (most recent) for current conditions
    const todayAnomaly = anomalies[anomalies.length - 1]; // Last item is today
    
    if (!todayAnomaly || todayAnomaly.type === 'normal') {
      return alerts; // No alert needed for normal conditions
    }

    // Check if we already have an alert for today to prevent duplicates
    const today = new Date().toDateString();
    const existingAlerts = await this.getActiveAlerts();
    
    if (todayAnomaly.type === 'heat_wave') {
      const existingHeatAlert = existingAlerts.find(
        alert => alert.type === 'heat_wave' && 
        alert.location === location &&
        new Date(alert.timestamp).toDateString() === today
      );
      
      if (!existingHeatAlert) {
        const alert = this.createHeatWaveAlert(todayAnomaly, location);
        alerts.push(alert);
        
        // Only send push notification if user has enabled heat wave alerts
        if (preferences.heatWave) {
          await this.sendNotification(alert);
        }
      } else {
        // Add existing alert to display in UI
        alerts.push(existingHeatAlert);
      }
    } else if (todayAnomaly.type === 'cold_wave') {
      const existingColdAlert = existingAlerts.find(
        alert => alert.type === 'cold_wave' && 
        alert.location === location &&
        new Date(alert.timestamp).toDateString() === today
      );
      
      if (!existingColdAlert) {
        const alert = this.createColdWaveAlert(todayAnomaly, location);
        alerts.push(alert);
        
        // Only send push notification if user has enabled cold wave alerts
        if (preferences.coldWave) {
          await this.sendNotification(alert);
        }
      } else {
        // Add existing alert to display in UI
        alerts.push(existingColdAlert);
      }
    }
    
    if (alerts.length > 0) {
      await this.saveAlerts(alerts);
    }
    return alerts;
  }

  static async checkAirQuality(airQuality: AirQualityData, location: string): Promise<Alert | null> {
    const preferences = await this.getNotificationPreferences();
    
    // Always create alert for UI display if air quality is poor
    if (airQuality.aqi <= 2) {
      return null; // No alert needed for good air quality
    }

    // Check if we already have an air quality alert for today to prevent duplicates
    const today = new Date().toDateString();
    const existingAlerts = await this.getActiveAlerts();
    const existingAirAlert = existingAlerts.find(
      alert => alert.type === 'poor_air_quality' && 
      alert.location === location &&
      new Date(alert.timestamp).toDateString() === today
    );

    if (existingAirAlert) {
      return existingAirAlert; // Return existing alert for UI display
    }
    
    const getQualityText = (aqi: number) => {
      if (aqi >= 5) return 'sangat tidak sehat';
      if (aqi >= 4) return 'tidak sehat';
      if (aqi >= 3) return 'tidak sehat untuk kelompok sensitif';
      return 'sedang';
    };
    
    const alertId = `air_quality_${Date.now()}_${location.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const qualityText = getQualityText(airQuality.aqi);
    const alert: Alert = {
      id: alertId,
      type: 'poor_air_quality',
      title: `Peringatan Kualitas Udara - ${location}`,
      message: `Kualitas udara saat ini ${qualityText} (AQI: ${airQuality.aqi}). Disarankan untuk membatasi aktivitas di luar ruangan.`,
      severity: airQuality.aqi >= 4 ? 'high' : 'medium',
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: [
        'Batasi aktivitas di luar ruangan',
        'Gunakan masker saat keluar rumah',
        'Tutup jendela dan gunakan air purifier',
        'Perbanyak minum air putih'
      ]
    };
    
    // Only send push notification if user has enabled air quality alerts
    if (preferences.airQuality) {
      await this.sendNotification(alert);
    }
    
    await this.saveAlert(alert);
    return alert;
  }

  static async checkUVIndex(uvIndex: number, location: string): Promise<Alert | null> {
    const preferences = await this.getNotificationPreferences();
    
    // Always create alert for UI display if UV index is high
    if (uvIndex < 8) {
      return null; // No alert needed for safe UV levels
    }

    // Check if we already have a UV alert for today to prevent duplicates
    const today = new Date().toDateString();
    const existingAlerts = await this.getActiveAlerts();
    const existingUVAlert = existingAlerts.find(
      alert => alert.type === 'high_uv' && 
      alert.location === location &&
      new Date(alert.timestamp).toDateString() === today
    );

    if (existingUVAlert) {
      return existingUVAlert; // Return existing alert instead of creating new one
    }
    
    const getUVLevel = (uv: number) => {
      if (uv >= 11) return 'ekstrem';
      if (uv >= 8) return 'sangat tinggi';
      if (uv >= 6) return 'tinggi';
      return 'sedang';
    };
    
    const alertId = `uv_index_${Date.now()}_${location.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const uvLevel = getUVLevel(uvIndex);
    const alert: Alert = {
      id: alertId,
      type: 'high_uv',
      title: `Peringatan Indeks UV - ${location}`,
      message: `Indeks UV saat ini ${uvLevel} (${uvIndex}). Hindari paparan sinar matahari langsung dan gunakan tabir surya.`,
      severity: uvIndex >= 11 ? 'extreme' : 'high',
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: [
        'Gunakan tabir surya SPF 30+',
        'Kenakan pakaian pelindung',
        'Cari tempat teduh saat jam puncak (10.00 - 16.00)',
        'Gunakan kacamata hitam dan topi lebar'
      ]
    };
    
    // Only send push notification if user has enabled UV index alerts
    if (preferences.uvIndex) {
      await this.sendNotification(alert);
    }
    
    await this.saveAlert(alert);
    return alert;
  }

  private static createHeatWaveAlert(anomaly: TemperatureAnomaly, location: string): Alert {
    const severityMessages = {
      medium: 'Suhu cukup tinggi untuk Indonesia. Tetap waspada dan jaga hidrasi.',
      high: 'Gelombang panas terdeteksi! Tetap terhidrasi dan hindari paparan sinar matahari berkepanjangan.',
      extreme: 'Gelombang panas ekstrem! Tetap di dalam ruangan dan cari AC.'
    };
    
    const recommendations = {
      medium: [
        'Minum banyak air putih',
        'Kenakan pakaian berwarna terang dan longgar',
        'Batasi aktivitas di luar ruangan saat jam puncak'
      ],
      high: [
        'Tetap terhidrasi dengan air dan elektrolit',
        'Tetap di dalam ruangan saat jam panas puncak',
        'Kenakan pakaian pelindung dan tabir surya',
        'Perhatikan kondisi lansia dan orang rentan'
      ],
      extreme: [
        'Tetap di dalam ruangan ber-AC',
        'Minum air secara teratur, meski tidak haus',
        'Hindari alkohol dan kafein',
        'Jangan tinggalkan siapa pun di kendaraan yang diparkir',
        'Segera cari bantuan medis jika ada gejala kelelahan panas'
      ]
    };
    
    return {
      id: `heat_wave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'heat_wave',
      title: `Peringatan Gelombang Panas - ${location}`,
      message: `Suhu ${anomaly.temperature}°C (${anomaly.anomaly > 0 ? '+' : ''}${anomaly.anomaly.toFixed(1)}°C di atas normal). ${severityMessages[anomaly.severity as keyof typeof severityMessages]}`,
      severity: anomaly.severity,
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: recommendations[anomaly.severity as keyof typeof recommendations]
    };
  }

  private static createColdWaveAlert(anomaly: TemperatureAnomaly, location: string): Alert {
    const severityMessages = {
      medium: 'Berpakaian hangat dan waspada terhadap cuaca dingin.',
      high: 'Kondisi gelombang dingin terdeteksi. Ambil tindakan pencegahan ekstra terhadap dingin.',
      extreme: 'Gelombang dingin ekstrem! Hindari paparan luar ruangan yang berkepanjangan.'
    };
    
    const recommendations = {
      medium: [
        'Berpakaian berlapis',
        'Kenakan pakaian hangat dan aksesoris',
        'Batasi waktu di luar ruangan'
      ],
      high: [
        'Berpakaian berlapis-lapis',
        'Tutupi kulit yang terbuka',
        'Jaga rumah agar cukup hangat',
        'Perhatikan kondisi lansia dan orang rentan'
      ],
      extreme: [
        'Hindari paparan luar ruangan yang tidak perlu',
        'Berpakaian berlapis hangat',
        'Lindungi ujung-ujung tubuh dari radang dingin',
        'Pastikan pemanasan rumah yang memadai',
        'Segera cari bantuan medis jika ada gejala hipotermia'
      ]
    };
    
    return {
      id: `cold_wave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'cold_wave',
      title: `Peringatan Gelombang Dingin - ${location}`,
      message: `Suhu ${anomaly.temperature}°C (${anomaly.anomaly.toFixed(1)}°C di bawah normal). ${severityMessages[anomaly.severity as keyof typeof severityMessages]}`,
      severity: anomaly.severity,
      timestamp: new Date(),
      location,
      isActive: true,
      recommendations: recommendations[anomaly.severity as keyof typeof recommendations]
    };
  }

  private static async sendNotification(alert: Alert): Promise<void> {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('Notification would be sent:', alert.title);
      return;
    }

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
      
      // Check if this alert already exists (prevent duplicates)
      const exists = existingAlerts.some(existing => 
        existing.id === alert.id || 
        (existing.type === alert.type && 
         existing.location === alert.location &&
         new Date(existing.timestamp).toDateString() === new Date(alert.timestamp).toDateString())
      );
      
      if (!exists) {
        const updatedAlerts = [alert, ...existingAlerts.slice(0, 49)]; // Keep only last 50 alerts
        await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
      }
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  }

  private static async saveAlerts(alerts: Alert[]): Promise<void> {
    try {
      const existingAlerts = await this.getStoredAlerts();
      const today = new Date().toDateString();
      
      // Remove old alerts of the same types for today to prevent accumulation
      const filteredExisting = existingAlerts.filter(existing => {
        const existingDate = new Date(existing.timestamp).toDateString();
        if (existingDate !== today) return true; // Keep alerts from other days
        
        // Remove if we have a new alert of the same type for same location today
        return !alerts.some(newAlert => 
          newAlert.type === existing.type && 
          newAlert.location === existing.location
        );
      });
      
      // Add new alerts
      const allAlerts = [...alerts, ...filteredExisting].slice(0, 50); // Keep only last 50 alerts
      await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(allAlerts));
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
    
    // Filter for active alerts from last 24 hours only
    const activeAlerts = alerts.filter(alert => 
      alert.isActive && alert.timestamp > twentyFourHoursAgo
    );
    
    // Clean up old alerts while we're at it
    if (alerts.length !== activeAlerts.length) {
      await this.cleanupOldAlerts();
    }
    
    return activeAlerts;
  }

  private static async cleanupOldAlerts(): Promise<void> {
    try {
      const alerts = await this.getStoredAlerts();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Keep only alerts from last 24 hours
      const recentAlerts = alerts.filter(alert => 
        alert.timestamp > twentyFourHoursAgo
      );
      
      await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(recentAlerts));
      console.log(`Cleaned up alerts: ${alerts.length} -> ${recentAlerts.length}`);
    } catch (error) {
      console.error('Error cleaning up old alerts:', error);
    }
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

  static async clearAllAlerts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ALERTS_STORAGE_KEY);
      console.log('All alerts cleared');
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  }

  // Function to clear alerts with English messages and regenerate with Indonesian
  static async clearEnglishAlerts(): Promise<void> {
    try {
      const alerts = await this.getStoredAlerts();
      const englishKeywords = ['Take precautions', 'above normal', 'Heat Wave Alert', 'Temperature', '°C ('];
      
      const filteredAlerts = alerts.filter(alert => {
        const hasEnglishContent = englishKeywords.some(keyword => 
          alert.title.includes(keyword) || alert.message.includes(keyword)
        );
        return !hasEnglishContent;
      });
      
      await AsyncStorage.setItem(this.ALERTS_STORAGE_KEY, JSON.stringify(filteredAlerts));
      console.log(`Cleared English alerts: ${alerts.length} -> ${filteredAlerts.length}`);
    } catch (error) {
      console.error('Error clearing English alerts:', error);
    }
  }

  private static async getNotificationPreferences() {
    try {
      // First try to get from the new preferences structure used by Settings
      const prefsJson = await AsyncStorage.getItem('userPreferences');
      if (prefsJson) {
        const userPrefs = JSON.parse(prefsJson);
        console.log('🔍 User preferences found:', userPrefs);
        
        if (userPrefs.alertsEnabled === false) {
          console.log('⚠️ Notifications disabled by user preferences');
          return {
            heatWave: false,
            coldWave: false,
            airQuality: false,
            uvIndex: false,
            severeWeather: false
          };
        }
        
        // Return the notification settings
        if (userPrefs.notificationSettings) {
          console.log('📱 Using notification settings:', userPrefs.notificationSettings);
          return userPrefs.notificationSettings;
        }
      }
      
      // Fallback to old preferences structure
      const oldPrefsJson = await AsyncStorage.getItem(this.PREFERENCES_STORAGE_KEY);
      if (oldPrefsJson) {
        return JSON.parse(oldPrefsJson);
      }
      
      // Default preferences if nothing is found
      return {
        heatWave: true,
        coldWave: true,
        airQuality: true,
        uvIndex: true,
        severeWeather: true
      };
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
