import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedView } from '../../components/ThemedView';
import { useLocation } from '../../contexts/LocationContext';
import { DatabaseService } from '../../services/databaseService';

interface FavoriteLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  createdAt: any;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedLocation } = useLocation();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoriteLocations = await DatabaseService.getFavoriteLocations();
      setFavorites(favoriteLocations as FavoriteLocation[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (locationId: string, locationName: string) => {
    Alert.alert(
      'Hapus Lokasi Favorit',
      `Apakah Anda yakin ingin menghapus "${locationName}" dari daftar favorit?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.removeFavoriteLocation(locationId);
              setFavorites(prev => prev.filter(fav => fav.id !== locationId));
              Alert.alert('Berhasil', 'Lokasi telah dihapus dari favorit');
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Gagal menghapus lokasi favorit');
            }
          },
        },
      ]
    );
  };

  const addCurrentLocationToFavorites = async () => {
    try {
      setLoading(true);
      
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi Diperlukan', 'Aplikasi memerlukan akses lokasi untuk menambahkan lokasi saat ini ke favorit.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get location name using reverse geocoding
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];
      const locationName = address?.city || address?.subregion || address?.region || 'Lokasi Saat Ini';
      const state = address?.region || address?.subregion || 'Unknown';
      const country = address?.country || 'Unknown';

      await DatabaseService.saveFavoriteLocation({
        name: locationName,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        country: country,
        state: state,
      });
      
      await loadFavorites();
      Alert.alert('Berhasil', `${locationName} telah ditambahkan ke favorit`);
    } catch (error) {
      console.error('Error adding current location:', error);
      Alert.alert('Error', 'Gagal menambahkan lokasi ke favorit. Pastikan GPS aktif dan izin lokasi diberikan.');
    } finally {
      setLoading(false);
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteLocation }) => (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoriteDetails}>
          {item.state && `${item.state}, `}{item.country}
        </Text>
        <Text style={styles.favoriteCoords}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      </View>
      
      <View style={styles.favoriteActions}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            // Set selected location and navigate to home tab
            setSelectedLocation({
              latitude: item.latitude,
              longitude: item.longitude,
              name: item.name,
              isCurrentLocation: false,
            });
            
            // Navigate to home tab
            router.push('/(tabs)');
            
            Alert.alert('Lokasi Dipilih', `Menampilkan cuaca untuk ${item.name}`);
          }}
        >
          <Text style={styles.selectButtonText}>Pilih</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeFavorite(item.id, item.name)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Memuat lokasi favorit...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <Text style={styles.title}>Lokasi Favorit</Text>
        <TouchableOpacity style={styles.addButton} onPress={addCurrentLocationToFavorites}>
          <Text style={styles.addButtonText}>+ Tambah Lokasi Saat Ini</Text>
        </TouchableOpacity>
      </ThemedView>

      {favorites.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>Belum Ada Lokasi Favorit</Text>
          <Text style={styles.emptyDescription}>
            Tambahkan lokasi favorit Anda untuk akses cepat ke informasi cuaca
          </Text>
        </ThemedView>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  header: {
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
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  favoriteDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  favoriteCoords: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  favoriteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
