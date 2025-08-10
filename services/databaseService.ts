import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Alert, HealthTip, UserPreferences, WeatherData } from '../types/weather';
import { AuthService } from './authService';

export class DatabaseService {
  // Helper to get current user ID
  private static getCurrentUserId(): string {
    const userId = AuthService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }
  // ===== USER PREFERENCES =====
  static async saveUserPreferences(preferences: UserPreferences) {
    try {
      const userId = this.getCurrentUserId();
      
      // Save to AsyncStorage as backup
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      // Save to Firebase
      await setDoc(doc(db, 'userPreferences', userId), {
        ...preferences,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const userId = this.getCurrentUserId();
      
      // Try to get from Firebase first
      try {
        const snapshot = await getDocs(query(collection(db, 'userPreferences'), where('__name__', '==', userId)));
        
        if (!snapshot.empty) {
          const prefs = snapshot.docs[0].data() as UserPreferences;
          // Update AsyncStorage with latest from Firebase
          await AsyncStorage.setItem('userPreferences', JSON.stringify(prefs));
          return prefs;
        }
      } catch {
        console.log('Firebase read error, falling back to AsyncStorage');
      }
      
      // Fallback to AsyncStorage if Firebase fails
      const localPrefs = await AsyncStorage.getItem('userPreferences');
      if (localPrefs) {
        return JSON.parse(localPrefs) as UserPreferences;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // ===== FAVORITE LOCATIONS =====
  static async saveFavoriteLocation(locationData: {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    state?: string;
  }) {
    try {
      const userId = this.getCurrentUserId();
      
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'favoriteLocations'), {
        userId,
        ...locationData,
        createdAt: serverTimestamp(),
      });
      
      // Update AsyncStorage backup
      await this.updateFavoriteLocationsCache();
      
      return docRef;
    } catch (error) {
      console.error('Error saving favorite location:', error);
      throw error;
    }
  }

  static async getFavoriteLocations() {
    try {
      const userId = this.getCurrentUserId();
      
      // Try to get from Firebase first
      try {
        const q = query(
          collection(db, 'favoriteLocations'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        
        // Sort client-side to avoid index requirement
        const locations = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        // Sort by createdAt client-side (newest first)
        const sortedLocations = locations.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        
        // Update AsyncStorage cache with latest data
        await AsyncStorage.setItem('favoriteLocations', JSON.stringify(sortedLocations));
        
        return sortedLocations;
      } catch {
        console.log('Firebase read error for favorites, falling back to AsyncStorage');
        
        // Fallback to AsyncStorage if Firebase fails
        const cachedLocations = await AsyncStorage.getItem('favoriteLocations');
        if (cachedLocations) {
          return JSON.parse(cachedLocations);
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error getting favorite locations:', error);
      return [];
    }
  }

  // Helper method to update AsyncStorage cache for favorites
  private static async updateFavoriteLocationsCache() {
    try {
      const userId = this.getCurrentUserId();
      
      // Get directly from Firebase to avoid recursion
      const q = query(
        collection(db, 'favoriteLocations'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      const locations = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      const sortedLocations = locations.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      await AsyncStorage.setItem('favoriteLocations', JSON.stringify(sortedLocations));
    } catch (error) {
      console.log('Error updating favorites cache:', error);
    }
  }

  static async removeFavoriteLocation(locationId: string) {
    try {
      await deleteDoc(doc(db, 'favoriteLocations', locationId));
      
      // Update AsyncStorage cache after deletion
      await this.updateFavoriteLocationsCache();
    } catch (error) {
      console.error('Error removing favorite location:', error);
      throw error;
    }
  }

  // ===== WEATHER HISTORY =====
  static async saveWeatherHistory(weatherData: WeatherData) {
    try {
      const userId = this.getCurrentUserId();
      await addDoc(collection(db, 'weatherHistory'), {
        userId,
        location: weatherData.location,
        temperature: weatherData.temperature,
        description: weatherData.description,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        pressure: weatherData.pressure,
        uvIndex: weatherData.uvIndex,
        coordinates: weatherData.coordinates,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving weather history:', error);
      throw error;
    }
  }

  static async getWeatherHistory(limitCount: number = 50) {
    try {
      const userId = this.getCurrentUserId();
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, 'weatherHistory'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      // Sort client-side and limit
      const history = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sort by timestamp client-side (newest first) and limit
      return history
        .sort((a: any, b: any) => {
          const aTime = a.timestamp?.toDate?.() || new Date(0);
          const bTime = b.timestamp?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting weather history:', error);
      return [];
    }
  }

  // ===== ALERT PREFERENCES =====
  static async saveAlertPreferences(alertPrefs: {
    temperatureThreshold: { min: number; max: number };
    humidityThreshold: { min: number; max: number };
    windSpeedThreshold: number;
    uvIndexThreshold: number;
    airQualityThreshold: number;
    enabledAlerts: string[];
  }) {
    try {
      const userId = this.getCurrentUserId();
      await setDoc(doc(db, 'alertPreferences', userId), {
        ...alertPrefs,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving alert preferences:', error);
      throw error;
    }
  }

  // ===== CUSTOM HEALTH TIPS =====
  static async saveCustomHealthTip(tip: Omit<HealthTip, 'id'>) {
    try {
      const userId = this.getCurrentUserId();
      await addDoc(collection(db, 'customHealthTips'), {
        userId,
        ...tip,
        isCustom: true,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving custom health tip:', error);
      throw error;
    }
  }

  static async getCustomHealthTips() {
    try {
      const userId = this.getCurrentUserId();
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, 'customHealthTips'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      // Sort client-side to avoid index requirement
      const tips = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sort by createdAt client-side (newest first)
      return tips.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    } catch (error) {
      console.error('Error getting custom health tips:', error);
      return [];
    }
  }

  // ===== NOTIFICATION TOKENS =====
  static async saveNotificationToken(token: string, deviceInfo: {
    platform: string;
    deviceId: string;
    appVersion: string;
  }) {
    try {
      const userId = this.getCurrentUserId();
      await setDoc(doc(db, 'notificationTokens', userId), {
        token,
        ...deviceInfo,
        lastUpdated: serverTimestamp(),
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving notification token:', error);
      throw error;
    }
  }

  // ===== WEATHER ALERTS HISTORY =====
  static async saveWeatherAlert(alert: Omit<Alert, 'id'>) {
    try {
      const userId = this.getCurrentUserId();
      await addDoc(collection(db, 'weatherAlerts'), {
        userId,
        ...alert,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving weather alert:', error);
      throw error;
    }
  }

  static async getWeatherAlerts(isActiveOnly: boolean = true) {
    try {
      const userId = this.getCurrentUserId();
      // Base query without orderBy to avoid index requirement
      let q = query(
        collection(db, 'weatherAlerts'),
        where('userId', '==', userId)
      );

      if (isActiveOnly) {
        q = query(
          collection(db, 'weatherAlerts'),
          where('userId', '==', userId),
          where('isActive', '==', true)
        );
      }

      const snapshot = await getDocs(q);
      
      // Sort client-side to avoid index requirement
      const alerts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sort by createdAt client-side (newest first)
      return alerts.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    } catch (error) {
      console.error('Error getting weather alerts:', error);
      return [];
    }
  }

  static async updateAlertStatus(alertId: string, isActive: boolean) {
    try {
      await updateDoc(doc(db, 'weatherAlerts', alertId), {
        isActive,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  }

  // ===== REAL-TIME LISTENERS =====
  static subscribeToWeatherAlerts(callback: (alerts: any[]) => void) {
    const userId = this.getCurrentUserId();
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'weatherAlerts'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    return onSnapshot(q, (snapshot) => {
      // Sort client-side to avoid index requirement
      const alerts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Sort by createdAt client-side (newest first)
      const sortedAlerts = alerts.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      callback(sortedAlerts);
    });
  }

  // ===== APP USAGE ANALYTICS =====
  static async logAppUsage(action: string, details?: any) {
    try {
      const userId = this.getCurrentUserId();
      await addDoc(collection(db, 'appUsage'), {
        userId,
        action,
        details,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging app usage:', error);
    }
  }
}
