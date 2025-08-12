import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HapticService } from '../services/hapticService';


interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const handleRetry = () => {
    HapticService.medium();
    onRetry?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Oops! Ada Masalah</Text>
        <Text style={styles.message}>
          {message || 'Gagal memuat data cuaca. Periksa koneksi internet Anda.'}
        </Text>
        
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryIcon}>🔄</Text>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.suggestions}>
          <Text style={styles.suggestionTitle}>Saran:</Text>
          <Text style={styles.suggestionText}>• Periksa koneksi internet</Text>
          <Text style={styles.suggestionText}>• Coba beberapa saat lagi</Text>
          <Text style={styles.suggestionText}>• Pastikan GPS aktif untuk lokasi akurat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  retryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suggestions: {
    alignSelf: 'stretch',
    backgroundColor: '#F3F7FF',
    borderRadius: 12,
    padding: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
});
