import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HealthTip } from '../types/weather';


const { width: screenWidth } = Dimensions.get('window');

interface HealthTipsCardProps {
  tips: HealthTip[];
}

export function HealthTipsCard({ tips }: HealthTipsCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'heat': return '#EF4444';
      case 'cold': return '#3B82F6';
      case 'air_quality': return '#10B981';
      case 'uv': return '#F59E0B';
      case 'general': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'heat': return 'CUACA PANAS';
      case 'cold': return 'CUACA DINGIN';
      case 'air_quality': return 'KUALITAS UDARA';
      case 'uv': return 'INDEKS UV';
      case 'general': return 'UMUM';
      default: return 'UMUM';
    }
  };

  const emergencyTips = tips.filter(tip => tip.category === 'general');
  const regularTips = tips.filter(tip => tip.category !== 'general');

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header dengan aksen biru */}
      <LinearGradient
        colors={['#4A90E2', '#2563EB']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerIcon}>💡</Text>
          <Text style={styles.title}>Tips Kesehatan</Text>
        </View>
      </LinearGradient>

      {emergencyTips.length > 0 && (
        <View style={styles.emergencySection}>
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyIcon}>⚠️</Text>
            <Text style={styles.emergencyTitle}>Peringatan Darurat</Text>
          </View>
          {emergencyTips.map((tip) => (
            <View key={tip.id} style={styles.emergencyTip}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <View style={styles.tipContent}>
                <Text style={styles.emergencyTipTitle}>{tip.title}</Text>
                <Text style={styles.emergencyTipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tipsScroll}
        contentContainerStyle={styles.tipsContainer}
      >
        {regularTips.map((tip) => (
          <View key={tip.id} style={[styles.tipCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.tipHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(tip.category) }]}>
                <Text style={styles.categoryText}>{getCategoryName(tip.category)}</Text>
              </View>
            </View>
            
            <View style={styles.tipIconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: getCategoryColor(tip.category) }]}>
                <Text style={styles.tipCardIcon}>{tip.icon}</Text>
              </View>
            </View>

            <View style={styles.tipInfo}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Geser untuk melihat tips lainnya. Tips disesuaikan dengan kondisi cuaca saat ini.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingHorizontal: screenWidth * 0.05,
    paddingTop: screenWidth * 0.05,
    paddingBottom: screenWidth * 0.04,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: Math.min(24, screenWidth * 0.06),
    marginRight: 12,
  },
  title: {
    fontSize: Math.min(20, screenWidth * 0.05),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencySection: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    marginHorizontal: screenWidth * 0.05,
    marginBottom: 20,
    padding: screenWidth * 0.04,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyIcon: {
    fontSize: Math.min(20, screenWidth * 0.05), // Responsive icon size
    marginRight: 8,
  },
  emergencyTitle: {
    fontSize: Math.min(16, screenWidth * 0.04), // Responsive font size
    fontWeight: '600',
    color: '#DC2626',
  },
  emergencyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: Math.min(20, screenWidth * 0.05), // Responsive icon size
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  emergencyTipTitle: {
    fontSize: Math.min(14, screenWidth * 0.035), // Responsive font size
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyTipDescription: {
    fontSize: Math.min(13, screenWidth * 0.032), // Responsive font size
    color: '#7F1D1D',
    lineHeight: 18,
  },
  tipsScroll: {
    marginBottom: 20,
    marginHorizontal: screenWidth * 0.05,
  },
  tipsContainer: {
    paddingRight: 16,
  },
  tipCard: {
    width: 260,
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tipIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCardIcon: {
    fontSize: 28,
  },
  tipInfo: {
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginHorizontal: screenWidth * 0.05,
    marginBottom: screenWidth * 0.05,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
    fontWeight: '500',
  },
});
