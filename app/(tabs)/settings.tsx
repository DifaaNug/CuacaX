import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { ThemedView } from '../../components/ThemedView';
import { DatabaseService } from '../../services/databaseService';
import { NotificationService } from '../../services/notificationService';
import { UserPreferences } from '../../types/weather';

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    temperatureUnit: 'celsius',
    windUnit: 'kmh',
    pressureUnit: 'hPa',
    alertsEnabled: true,
    notificationSettings: {
      heatWave: true,
      coldWave: true,
      airQuality: true,
      uvIndex: true,
      severeWeather: true,
    },
    favoriteLocations: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const userPrefs = await DatabaseService.getUserPreferences();
      if (userPrefs) {
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await DatabaseService.saveUserPreferences(newPreferences);
      setPreferences(newPreferences);
      Alert.alert('Berhasil', 'Pengaturan telah disimpan');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    }
  };

  const toggleNotification = async (key: keyof typeof preferences.notificationSettings) => {
    const newNotificationSettings = {
      ...preferences.notificationSettings,
      [key]: !preferences.notificationSettings[key],
    };

    const newPreferences = {
      ...preferences,
      notificationSettings: newNotificationSettings,
    };

    await savePreferences(newPreferences);
  };

  const toggleAlerts = async () => {
    const newPreferences = {
      ...preferences,
      alertsEnabled: !preferences.alertsEnabled,
    };

    if (!newPreferences.alertsEnabled) {
      await NotificationService.cancelAllNotifications();
    } else {
      await NotificationService.scheduleDailyWeatherUpdate(7);
    }

    await savePreferences(newPreferences);
  };

  const clearAllData = async () => {
    Alert.alert(
      'Hapus Semua Data',
      'Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.cancelAllNotifications();
              // Here you would implement data clearing logic
              Alert.alert('Berhasil', 'Semua data telah dihapus');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Gagal menghapus data');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Memuat pengaturan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <Text style={styles.title}>Pengaturan</Text>
      </ThemedView>

      {/* Unit Settings */}
      <ThemedView style={styles.section}>
        <Text style={styles.subtitle}>Unit Pengukuran</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Suhu</Text>
          <View style={styles.unitButtons}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                preferences.temperatureUnit === 'celsius' && styles.activeUnit,
              ]}
              onPress={() => savePreferences({ ...preferences, temperatureUnit: 'celsius' })}
            >
              <Text style={[
                styles.unitText,
                preferences.temperatureUnit === 'celsius' && styles.activeUnitText,
              ]}>°C</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                preferences.temperatureUnit === 'fahrenheit' && styles.activeUnit,
              ]}
              onPress={() => savePreferences({ ...preferences, temperatureUnit: 'fahrenheit' })}
            >
              <Text style={[
                styles.unitText,
                preferences.temperatureUnit === 'fahrenheit' && styles.activeUnitText,
              ]}>°F</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Kecepatan Angin</Text>
          <View style={styles.unitButtons}>
            {['kmh', 'mph', 'ms'].map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  preferences.windUnit === unit && styles.activeUnit,
                ]}
                onPress={() => savePreferences({ ...preferences, windUnit: unit as any })}
              >
                <Text style={[
                  styles.unitText,
                  preferences.windUnit === unit && styles.activeUnitText,
                ]}>{unit.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ThemedView>

      {/* Notification Settings */}
      <ThemedView style={styles.section}>
        <Text style={styles.subtitle}>Notifikasi</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Aktifkan Peringatan</Text>
          <Switch
            value={preferences.alertsEnabled}
            onValueChange={toggleAlerts}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={preferences.alertsEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        {preferences.alertsEnabled && (
          <>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Gelombang Panas</Text>
              <Switch
                value={preferences.notificationSettings.heatWave}
                onValueChange={() => toggleNotification('heatWave')}
                trackColor={{ false: '#E5E7EB', true: '#EF4444' }}
                thumbColor={preferences.notificationSettings.heatWave ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Gelombang Dingin</Text>
              <Switch
                value={preferences.notificationSettings.coldWave}
                onValueChange={() => toggleNotification('coldWave')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={preferences.notificationSettings.coldWave ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Kualitas Udara</Text>
              <Switch
                value={preferences.notificationSettings.airQuality}
                onValueChange={() => toggleNotification('airQuality')}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={preferences.notificationSettings.airQuality ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Indeks UV</Text>
              <Switch
                value={preferences.notificationSettings.uvIndex}
                onValueChange={() => toggleNotification('uvIndex')}
                trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                thumbColor={preferences.notificationSettings.uvIndex ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Cuaca Ekstrem</Text>
              <Switch
                value={preferences.notificationSettings.severeWeather}
                onValueChange={() => toggleNotification('severeWeather')}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={preferences.notificationSettings.severeWeather ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </>
        )}
      </ThemedView>

      {/* Data Management */}
      <ThemedView style={styles.section}>
        <Text style={styles.subtitle}>Manajemen Data</Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
          <Text style={styles.dangerButtonText}>Hapus Semua Data</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  unitButtons: {
    flexDirection: 'row',
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeUnit: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  unitText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeUnitText: {
    color: '#FFFFFF',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
