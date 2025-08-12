import { Platform, ViewStyle } from 'react-native';

/**
 * Cross-platform shadow utility
 * Converts React Native shadow props to web-compatible boxShadow
 */
export const createShadow = (
  color: string = '#000',
  offset: { width: number; height: number } = { width: 0, height: 2 },
  opacity: number = 0.1,
  radius: number = 4,
  elevation?: number
): ViewStyle => {
  if (Platform.OS === 'web') {
    // Convert to web-compatible boxShadow
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    } as ViewStyle;
  }

  // Native shadow properties
  const shadowStyle: ViewStyle = {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
  };

  // Add elevation for Android
  if (Platform.OS === 'android' && elevation !== undefined) {
    shadowStyle.elevation = elevation;
  }

  return shadowStyle;
};

/**
 * Cross-platform pointer events utility
 */
export const createPointerEvents = (value: 'auto' | 'none' | 'box-none' | 'box-only'): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      pointerEvents: value,
    } as ViewStyle;
  }

  return {
    pointerEvents: value,
  };
};

/**
 * Common shadow presets
 */
export const shadowPresets = {
  small: createShadow('#000', { width: 0, height: 1 }, 0.05, 2, 1),
  medium: createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 2),
  large: createShadow('#000', { width: 0, height: 4 }, 0.15, 8, 4),
  card: createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 3),
  button: createShadow('#000', { width: 0, height: 1 }, 0.2, 2, 1),
  fab: createShadow('#000', { width: 0, height: 4 }, 0.25, 8, 6),
};
