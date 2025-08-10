import 'dotenv/config';

export default {
  expo: {
    name: "CuacaX - Weather Health Monitor",
    slug: "CuacaX",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "cuacax",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    projectId: "fbf8f2ac-d234-4567-8901-cuacaxproject",
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Aplikasi ini memerlukan akses lokasi untuk memberikan informasi cuaca yang akurat di lokasi Anda.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Aplikasi ini memerlukan akses lokasi untuk memberikan peringatan cuaca dan tips kesehatan yang relevan."
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0066CC"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION", 
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ],
      package: "com.cuacax.weatherhealth",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0066CC"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Aplikasi ini memerlukan akses lokasi untuk memberikan informasi cuaca dan peringatan kesehatan yang akurat."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#0066CC",
          sounds: ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
