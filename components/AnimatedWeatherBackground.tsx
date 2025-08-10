import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

interface AnimatedWeatherBackgroundProps {
  weatherCondition: string;
  isDay: boolean;
}

const { width, height } = Dimensions.get('window');

export const AnimatedWeatherBackground: React.FC<AnimatedWeatherBackgroundProps> = ({
  weatherCondition,
  isDay,
}) => {
  const getBackgroundGradient = () => {
    const condition = weatherCondition.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return ['#4A90E2', '#2E5984', '#1E3A5F'];
    } else if (condition.includes('cloud')) {
      return ['#87CEEB', '#6495ED', '#4682B4'];
    } else if (condition.includes('clear')) {
      return isDay 
        ? ['#87CEEB', '#4A90E2', '#1E90FF']
        : ['#2C3E50', '#34495E', '#1E2832'];
    } else if (condition.includes('snow')) {
      return ['#E6F3FF', '#B8D4F0', '#8BB8E8'];
    } else if (condition.includes('thunderstorm')) {
      return ['#2C3E50', '#34495E', '#1E2832'];
    }
    
    // Default gradient
    return isDay 
      ? ['#87CEEB', '#4A90E2', '#1E90FF']
      : ['#2C3E50', '#34495E', '#1E2832'];
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundGradient()[1] }]}>
      {/* Simple animated elements since we don't have Lottie files yet */}
      <View style={styles.animatedElements}>
        {/* You can add custom animated elements here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.7,
    zIndex: -1,
  },
  animatedElements: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
