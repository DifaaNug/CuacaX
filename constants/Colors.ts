/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0066CC';
const tintColorDark = '#4A90E2';

export const Colors = {
  light: {
    text: '#1A365D',
    background: '#F8FAFC',
    tint: tintColorLight,
    icon: '#0066CC',
    tabIconDefault: '#9BB5D6',
    tabIconSelected: tintColorLight,
    primary: '#0066CC',
    secondary: '#4A90E2',
    accent: '#E6F3FF',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',
    cardBackground: '#FFFFFF',
    gradientStart: '#4299E1',
    gradientEnd: '#3182CE',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  dark: {
    text: '#E2E8F0',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#4A90E2',
    tabIconDefault: '#4A5568',
    tabIconSelected: tintColorDark,
    primary: '#4A90E2',
    secondary: '#63B3ED',
    accent: '#1E293B',
    surface: '#1E293B',
    border: '#334155',
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
    info: '#63B3ED',
    cardBackground: '#1E293B',
    gradientStart: '#1E293B',
    gradientEnd: '#4A90E2',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};
