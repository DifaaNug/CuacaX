import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export function WeatherSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const SkeletonBox = ({ width, height, style }: { width: number; height: number; style?: any }) => (
    <Animated.View
      style={[
        styles.skeletonBox,
        { width, height, opacity: shimmerOpacity },
        style,
      ]}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonBox width={120} height={24} />
        <SkeletonBox width={160} height={16} style={{ marginTop: 8 }} />
      </View>

      {/* Main Weather Skeleton */}
      <View style={styles.mainSkeleton}>
        <SkeletonBox width={80} height={80} style={{ borderRadius: 40 }} />
        <SkeletonBox width={120} height={48} style={{ marginTop: 16 }} />
        <SkeletonBox width={100} height={16} style={{ marginTop: 8 }} />
        <SkeletonBox width={140} height={14} style={{ marginTop: 4 }} />
      </View>

      {/* Details Skeleton */}
      <View style={styles.detailsSkeleton}>
        <View style={styles.detailRow}>
          <SkeletonBox width={(screenWidth - 80) / 2} height={75} style={{ borderRadius: 16 }} />
          <SkeletonBox width={(screenWidth - 80) / 2} height={75} style={{ borderRadius: 16 }} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonBox width={(screenWidth - 80) / 2} height={75} style={{ borderRadius: 16 }} />
          <SkeletonBox width={(screenWidth - 80) / 2} height={75} style={{ borderRadius: 16 }} />
        </View>
      </View>

      {/* Additional Cards Skeleton */}
      <View style={styles.cardsSkeleton}>
        <SkeletonBox width={screenWidth - 24} height={200} style={{ borderRadius: 20, marginBottom: 16 }} />
        <SkeletonBox width={screenWidth - 24} height={180} style={{ borderRadius: 20, marginBottom: 16 }} />
        <SkeletonBox width={screenWidth - 24} height={160} style={{ borderRadius: 20 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
  },
  skeletonBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  headerSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  mainSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardsSkeleton: {
    marginTop: 8,
  },
});
