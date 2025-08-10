# 🌤️ CuacaX - Weather App
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **State Management**: React Hooks
- **Backend**: Firebase (Database, Auth)
- **APIs**: OpenWeather, Google Maps
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage + Firebase


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
