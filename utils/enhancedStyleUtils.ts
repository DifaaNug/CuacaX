// Enhanced Style Utilities untuk CuacaX
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Sistem spacing konsisten (8px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography scale
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    huge: 32,
    massive: 48,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Color palette
export const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#4A90E2',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
};

// Shadow presets yang sudah ada
export const shadowPresets = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
};

// Border radius system
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Animation presets
export const animations = {
  spring: {
    type: 'spring',
    damping: 15,
    stiffness: 150,
  },
  timing: {
    duration: 300,
    useNativeDriver: true,
  },
  fade: {
    duration: 600,
    useNativeDriver: true,
  },
};

// Responsive helpers
export const responsive = {
  scale: (size: number) => Math.min(size, screenWidth * 0.05),
  width: (percentage: number) => screenWidth * (percentage / 100),
  height: (percentage: number) => screenHeight * (percentage / 100),
  isSmallScreen: screenWidth < 380,
  isMediumScreen: screenWidth >= 380 && screenWidth < 420,
  isLargeScreen: screenWidth >= 420,
};

// Common layout patterns
export const layouts = {
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    ...shadowPresets.medium,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

// Button styles
export const buttons = {
  primary: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadowPresets.light,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
};

// Input styles
export const inputs = {
  base: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
  },
  focused: {
    borderColor: colors.primary[500],
    ...shadowPresets.light,
  },
  error: {
    borderColor: colors.error[500],
  },
};

export default {
  spacing,
  typography,
  colors,
  shadowPresets,
  borderRadius,
  animations,
  responsive,
  layouts,
  buttons,
  inputs,
};
