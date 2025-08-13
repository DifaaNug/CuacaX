import 'dotenv/config';

export default {
  expo: {
    name: "CuacaX - Weather Health Monitor",
    slug: "CuacaX",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo-cuacaX.png",
    scheme: "cuacax",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    projectId: "9e4a2212-858f-4057-a10b-0a330936520c",
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
        foregroundImage: "./assets/images/logo-cuacaX.png",
        backgroundColor: "#1a202c"
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
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo-cuacaX.png",
          imageWidth: 250,
          resizeMode: "contain",
          backgroundColor: "#1a202c"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Aplikasi ini memerlukan akses lokasi untuk memberikan informasi cuaca dan peringatan kesehatan yang akurat."
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "9e4a2212-858f-4057-a10b-0a330936520c"
      }
    }
  }
};
