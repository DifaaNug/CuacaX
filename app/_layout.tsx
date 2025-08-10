import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthService } from '@/services/authService';
import { DatabaseService } from '@/services/databaseService';
import { LocationProvider } from '@/contexts/LocationContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Initialize Firebase Authentication
    const initializeApp = async () => {
      try {
        // Wait for authentication to complete before proceeding
        await AuthService.initializeAuth();
        
        // Small delay to ensure auth state is set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Log app start after authentication is ready
        await DatabaseService.logAppUsage('app_start', {
          timestamp: new Date().toISOString(),
          colorScheme,
        });
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    if (loaded) {
      initializeApp();
    }
  }, [loaded, colorScheme]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <LocationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LocationProvider>
  );
}
