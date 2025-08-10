import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthService } from '@/services/authService';
import { DatabaseService } from '@/services/databaseService';
import { NotificationService } from '@/services/notificationService';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

interface User {
  uid: string;
  isAnonymous: boolean;
}

export function FirebaseExample() {
  const [user, setUser] = useState<User | null>(null);
  const [weatherHistory, setWeatherHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // Get current user
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);

    // Load user data if authenticated
    if (currentUser) {
      loadUserData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      // Load weather history
      const history = await DatabaseService.getWeatherHistory(5);
      setWeatherHistory(history);

      // Load favorite locations
      const favs = await DatabaseService.getFavoriteLocations();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveExampleData = async () => {
    try {
      // Save example weather data
      await DatabaseService.saveWeatherHistory({
        location: 'Jakarta, Indonesia',
        temperature: 28,
        description: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        pressure: 1013,
        uvIndex: 7,
        visibility: 10,
        dewPoint: 22,
        feelsLike: 30,
        icon: 'partly-cloudy',
        coordinates: { lat: -6.2088, lon: 106.8456 }
      });

      // Save example favorite location (keep as static example)
      await DatabaseService.saveFavoriteLocation({
        name: 'Jakarta (Demo)',
        latitude: -6.2088,
        longitude: 106.8456,
        country: 'Indonesia',
        state: 'DKI Jakarta'
      });

      // Save user preferences
      await DatabaseService.saveUserPreferences({
        temperatureUnit: 'celsius',
        windUnit: 'kmh',
        pressureUnit: 'hPa',
        alertsEnabled: true,
        notificationSettings: {
          heatWave: true,
          coldWave: true,
          airQuality: true,
          uvIndex: true,
          severeWeather: true
        },
        favoriteLocations: ['Jakarta']
      });

      // Log app usage
      await DatabaseService.logAppUsage('save_example_data', {
        action: 'demo_data_saved',
        timestamp: new Date().toISOString()
      });

      Alert.alert('Success', 'Example data saved to Firebase!');
      loadUserData(); // Reload data to show updates
    } catch (error) {
      console.error('Error saving data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to save data: ' + errorMessage);
    }
  };

  const sendTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to send notification: ' + errorMessage);
    }
  };

  const clearData = async () => {
    try {
      // This is just for demo - in real app you'd implement proper delete methods
      Alert.alert('Info', 'Clear data functionality would be implemented here');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  return (
    <ThemedView style={{ padding: 20 }}>
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
        Firebase Integration Demo
      </ThemedText>

      {/* User Info */}
      <View style={{ marginBottom: 20 }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Current User:</ThemedText>
        {user ? (
          <View>
            <ThemedText>ID: {user.uid.substring(0, 8)}...</ThemedText>
            <ThemedText>Type: {user.isAnonymous ? 'Anonymous' : 'Signed In'}</ThemedText>
          </View>
        ) : (
          <ThemedText>Not authenticated</ThemedText>
        )}
      </View>

      {/* Data Summary */}
      <View style={{ marginBottom: 20 }}>
        <ThemedText style={{ fontWeight: 'bold' }}>Stored Data:</ThemedText>
        <ThemedText>Weather History: {weatherHistory.length} entries</ThemedText>
        <ThemedText>Favorite Locations: {favorites.length} locations</ThemedText>
      </View>

      {/* Action Buttons */}
      <View style={{ gap: 10 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={saveExampleData}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Save Example Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#34C759',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={sendTestNotification}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Send Test Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#FF3B30',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={clearData}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Clear Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#8E8E93',
            padding: 15,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={loadUserData}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Refresh Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Weather History */}
      {weatherHistory.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <ThemedText style={{ fontWeight: 'bold', marginBottom: 10 }}>
            Recent Weather History:
          </ThemedText>
          {weatherHistory.slice(0, 3).map((item, index) => (
            <View key={index} style={{ marginBottom: 5 }}>
              <ThemedText style={{ fontSize: 12 }}>
                {item.location} - {item.temperature}°C ({item.description})
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}
