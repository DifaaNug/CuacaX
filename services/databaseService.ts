import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, HealthTip, UserPreferences, WeatherData } from '../types/weather';
import { AuthService } from './authService';

export class DatabaseService {
  // Helper to get current user ID
  private static getCurrentUserId(): string {
    const userId = AuthService.getCurrentUserId();
    if (!userId) {
      // Return mock user id if no auth
      return 'mock-user';
    }
    return userId;
  }

  // Helper to check if Firebase is available
  private static isFirebaseAvailable(): boolean {
    return db !== null && db !== undefined;
  }

  // ===== USER PREFERENCES =====
  static async saveUserPreferences(preferences: UserPreferences) {
    try {
      // Always save to AsyncStorage as primary storage for now
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      console.log('User preferences saved to AsyncStorage');
      
      // Try Firebase if available
      if (this.isFirebaseAvailable()) {
        try {
          const userId = this.getCurrentUserId();
          await setDoc(doc(db!, 'userPreferences', userId), {
            ...preferences,
            updatedAt: serverTimestamp(),
          });
          console.log('User preferences synced to Firebase');
        } catch (firebaseError) {
          console.log('Firebase save failed, AsyncStorage backup used:', firebaseError);
        }
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      // Get from AsyncStorage first
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
      // Save to AsyncStorage first
      const existing = await this.getFavoriteLocations();
      const newLocation = {
        id: Date.now().toString(),
        ...locationData,
        createdAt: new Date(),
      };
      const updated = [...existing, newLocation];
      
      await AsyncStorage.setItem('favoriteLocations', JSON.stringify(updated));
      console.log('Favorite location saved to AsyncStorage');
      
      // Try to sync to Firebase
      if (this.isFirebaseAvailable()) {
        try {
          const userId = this.getCurrentUserId();
          await setDoc(doc(db!, 'favoriteLocations', `${userId}_${newLocation.id}`), {
            userId: userId,
            ...newLocation,
            updatedAt: serverTimestamp(),
          });
          console.log('Favorite location synced to Firebase');
        } catch (firebaseError) {
          console.log('Firebase save failed, AsyncStorage backup used:', firebaseError);
        }
      }
      
      return { id: newLocation.id };
    } catch (error) {
      console.error('Error saving favorite location:', error);
      throw error;
    }
  }

  static async getFavoriteLocations() {
    try {
      const localData = await AsyncStorage.getItem('favoriteLocations');
      if (localData) {
        return JSON.parse(localData);
      }
      return [];
    } catch (error) {
      console.error('Error getting favorite locations:', error);
      return [];
    }
  }

  static async deleteFavoriteLocation(locationId: string) {
    try {
      const existing = await this.getFavoriteLocations();
      const updated = existing.filter((loc: any) => loc.id !== locationId);
      
      await AsyncStorage.setItem('favoriteLocations', JSON.stringify(updated));
      console.log('Favorite location deleted from AsyncStorage');
      
      // Try to delete from Firebase
      if (this.isFirebaseAvailable()) {
        try {
          const userId = this.getCurrentUserId();
          const { deleteDoc } = await import('firebase/firestore');
          await deleteDoc(doc(db!, 'favoriteLocations', `${userId}_${locationId}`));
          console.log('Favorite location deleted from Firebase');
        } catch (firebaseError) {
          console.log('Firebase delete failed, but AsyncStorage updated:', firebaseError);
        }
      }
    } catch (error) {
      console.error('Error deleting favorite location:', error);
      throw error;
    }
  }

  // ===== SIMPLE LOGGING =====
  static async logAppUsage(action: string, data: any) {
    try {
      console.log('App usage logged:', action, data);
      // For now just log to console, Firebase can be added later
    } catch (error) {
      console.error('Error logging app usage:', error);
    }
  }

  // Sync existing favorite locations from AsyncStorage to Firebase
  static async syncFavoriteLocationsToFirebase() {
    try {
      if (!this.isFirebaseAvailable()) {
        console.log('Firebase not available, skipping sync');
        return;
      }

      const localFavorites = await this.getFavoriteLocations();
      if (localFavorites.length === 0) {
        console.log('No local favorites to sync');
        return;
      }

      const userId = this.getCurrentUserId();
      console.log('Syncing', localFavorites.length, 'favorite locations to Firebase...');

      for (const location of localFavorites) {
        try {
          await setDoc(doc(db!, 'favoriteLocations', `${userId}_${location.id}`), {
            userId: userId,
            ...location,
            syncedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log('Synced favorite location:', location.name);
        } catch (error) {
          console.warn('Failed to sync location:', location.name, error);
        }
      }
      
      console.log('✅ Favorite locations sync completed');
    } catch (error) {
      console.error('Error syncing favorite locations to Firebase:', error);
    }
  }

  static async logWeatherData(weatherData: WeatherData) {
    try {
      console.log('Weather data logged:', weatherData.location);
      // For now just log to console
    } catch (error) {
      console.error('Error logging weather data:', error);
    }
  }

  // ===== MOCK FUNCTIONS FOR COMPATIBILITY =====
  static async saveAlertPreferences(preferences: any) {
    console.log('Alert preferences saved (mock)');
  }

  static async getAlertPreferences() {
    return null;
  }

  static async saveHealthTip(tip: HealthTip) {
    console.log('Health tip saved (mock)');
  }

  static async getHealthTips(): Promise<HealthTip[]> {
    return [];
  }

  static async saveAlert(alert: Alert) {
    console.log('Alert saved (mock)');
  }

  static async getAlerts(): Promise<Alert[]> {
    return [];
  }

  static async subscribeToAlerts(callback: any) {
    console.log('Subscribed to alerts (mock)');
    return () => console.log('Unsubscribed from alerts');
  }
}
