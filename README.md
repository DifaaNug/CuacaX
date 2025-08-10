# 🌤️ CuacaX - Weather App

Aplikasi cuaca React Native dengan fitur monitoring anomali suhu, kualitas udara, dan notifikasi kesehatan.

## ✨ Features

- 🌡️ **Real-time Weather Data** - Cuaca terkini dengan OpenWeather API
- 📊 **Temperature Anomaly Detection** - Deteksi gelombang panas/dingin
- 🌬️ **Air Quality Monitoring** - AQI dan polutan udara
- ☀️ **UV Index Tracking** - Monitoring indeks UV
- 💡 **Health Tips** - Saran kesehatan berdasarkan cuaca
- 🚨 **Smart Alerts** - Notifikasi cuaca sesuai kondisi aktual
- 🗺️ **Interactive Map** - Peta cuaca dengan Google Maps
- 📱 **Cross-platform** - Android & iOS dengan Expo

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **State Management**: React Hooks
- **Backend**: Firebase (Database, Auth)
- **APIs**: OpenWeather, Google Maps
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage + Firebase

## 📁 Project Structure

```
CuacaX/
├── app/                    # Main app screens
│   ├── (tabs)/
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Map screen  
│   │   ├── favorites.tsx  # Favorites
│   │   └── settings.tsx   # Settings
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── AirQualityCard.tsx
│   ├── AlertsCard.tsx
│   ├── HealthTipsCard.tsx
│   ├── WeatherCard.tsx
│   ├── WeatherMap.tsx
│   └── ... (16 components)
├── services/             # Business logic
│   ├── weatherService.ts  # Weather API
│   ├── alertService.ts    # Alert management
│   ├── notificationService.ts # Notifications
│   ├── databaseService.ts # Data persistence
│   ├── authService.ts     # Authentication
│   └── healthTipService.ts # Health tips
├── types/               # TypeScript types
│   └── weather.ts
├── hooks/              # Custom hooks
├── constants/          # App constants
├── contexts/           # React contexts
├── lib/               # Firebase config
└── assets/           # Images & fonts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio / Xcode (for local builds)

### Installation
```bash
# Clone repository
git clone https://github.com/DifaaNug/CuacaX.git
cd CuacaX

# Install dependencies
npm install

# Start development server
npx expo start
```

### Environment Setup
Create `.env` file:
```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_api_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📱 Features Overview

### Smart Weather Alerts
- **Temperature Anomaly**: Detects heat/cold waves
- **Air Quality**: Alerts for poor air conditions
- **UV Index**: High UV exposure warnings
- **Today-Only Logic**: Only alerts for current conditions

### Health-Focused Tips
- Contextual health advice based on weather
- Emergency tips for extreme conditions
- Activity recommendations
- Categorized suggestions

### Interactive Map
- Google Maps integration with fallback
- Manual coordinate input
- Real-time weather overlay
- Location-based weather data

## 🔧 Architecture

### Services Layer
- **WeatherService**: Handles all weather API calls
- **AlertService**: Manages alert logic and deduplication
- **NotificationService**: Expo-based notifications
- **DatabaseService**: Firebase + AsyncStorage hybrid
- **AuthService**: Firebase authentication

### Component Design
- Themed components with consistent styling
- Responsive design for multiple screen sizes
- Error handling and loading states
- Accessibility support

### Data Flow
1. **Location** → Coordinates
2. **WeatherService** → Real weather data
3. **AlertService** → Analyze for anomalies
4. **NotificationService** → Send relevant alerts
5. **DatabaseService** → Persist user data

## 🧪 Testing

```bash
# Run on Android
npx expo run:android

# Run on iOS  
npx expo run:ios

# Web development
npx expo start --web
```

## 📦 Build

```bash
# Create development build
eas build --platform android --profile development

# Create production build
eas build --platform android --profile production
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

---

**CuacaX** - Smart weather monitoring for healthier living 🌤️💚
