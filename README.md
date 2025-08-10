# CuacaX - Enhanced Weather Health Monitor 🌤️✨

CuacaX adalah aplikasi cuaca berbasis React Native yang berfokus pada kesehatan dan keselamatan dengan fitur deteksi dan peringatan anomali suhu ekstrem. **Baru diperbaharui dengan desain modern, animasi smooth, dan pengalaman pengguna yang ditingkatkan.**

## 🎨 **NEW! Design Improvements** 

### ✨ **Modern Visual Overhaul**
- **Dynamic Gradients**: Background gradients yang berubah sesuai kondisi cuaca
- **Animated Elements**: Komponen dengan animasi smooth dan interactive
- **Glass Morphism**: Card design dengan efek glass modern
- **Enhanced Typography**: Hierarki teks yang lebih jelas dan readable
- **Improved Color System**: Skema warna yang lebih harmonis dan accessible

### 🌟 **Enhanced Components**
- **WeatherCard**: Design baru dengan gradient dinamis dan decorative elements
- **AirQualityCard**: Circular progress indicators dan visual status yang lebih jelas
- **TemperatureChart**: Visualisasi data yang diperbaiki dengan gradient accents
- **HealthTipsCard**: Card layout baru dengan categorized tips dan better icons
- **AnimatedBackground**: Background animasi dengan floating clouds dan stars

## 🌟 Fitur Utama

### 🔥❄️ Deteksi & Alert Gelombang Panas/Dingin
- **Deteksi Otomatis**: Sistem secara otomatis mendeteksi anomali suhu ekstrem
- **Peringatan Real-time**: Notifikasi push untuk kondisi cuaca berbahaya
- **Tingkat Keparahan**: Klasifikasi alert berdasarkan tingkat bahaya (Rendah, Sedang, Tinggi, Ekstrem)
- **Rekomendasi Kesehatan**: Tips dan saran untuk menjaga kesehatan saat cuaca ekstrem
- **🆕 Enhanced Visual Alerts**: Alert cards dengan gradient backgrounds dan dynamic colors

### 📊 Grafik Anomali Suhu
- **Visualisasi Data**: Grafik interaktif menampilkan tren suhu 7 hari terakhir
- **Perbandingan Normal**: Membandingkan suhu aktual dengan suhu normal
- **Analisis Anomali**: Identifikasi pola cuaca tidak normal
- **Chart Responsif**: Grafik yang dapat di-scroll horizontal untuk detail
- **🆕 Enhanced Chart Design**: Header dengan gradient dan improved legend

### 💡 Tips Kesehatan
- **Tips Kontekstual**: Saran kesehatan berdasarkan kondisi cuaca saat ini
- **Kategori Lengkap**: Tips untuk cuaca panas, dingin, kualitas udara, dan UV
- **Peringatan Darurat**: Tips khusus untuk kondisi cuaca ekstrem
- **Interface Interaktif**: Cards yang dapat di-scroll dengan informasi detail
- **🆕 Modern Card Design**: Gradient backgrounds, icon containers, dan category badges

### 🌬️ Indeks Kualitas Udara (AQI) & Indeks UV
- **Monitoring Real-time**: Pemantauan kualitas udara dan UV index
- **Klasifikasi WHO**: Standar internasional untuk interpretasi AQI
- **Detail Polutan**: Informasi PM2.5, PM10, O3, NO2, SO2, CO
- **Rekomendasi Aktivitas**: Saran aktivitas berdasarkan kondisi udara
- **🆕 Circular Progress Indicators**: Visual progress rings dan UV rainbow bar

### 🗺️ Peta Cuaca Interaktif
- **Google Maps Integration**: Peta interaktif dengan marker cuaca
- **Multi-lokasi**: Cek cuaca di berbagai lokasi dengan tap
- **Mode Satelit**: Toggle antara peta standar dan satelit
- **Kontrol User-friendly**: Tombol untuk kembali ke lokasi user

### 📱 Fitur Tambahan
- **Firebase Integration**: Penyimpanan data dan sinkronisasi cloud
- **Offline Support**: Caching data untuk akses offline
- **Pull-to-Refresh**: Update data dengan gesture
- **Dark/Light Mode**: Tema yang mengikuti preferensi sistem
- **Responsive Design**: UI yang optimal di berbagai ukuran layar
- **🆕 Smooth Animations**: React Native Reanimated untuk animasi yang buttery smooth


## 📁 Struktur Project

```
CuacaX/
├── app/                          # App router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home screen (main weather)
│   │   └── explore.tsx          # Explore screen (map & forecast)
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx          # 404 page
├── components/                   # Reusable components
│   ├── WeatherCard.tsx          # Main weather display
│   ├── TemperatureAnomalyChart.tsx  # Chart component
│   ├── AirQualityCard.tsx       # AQI & UV display
│   ├── HealthTipsCard.tsx       # Health tips display
│   ├── AlertsCard.tsx           # Weather alerts
│   ├── WeatherMap.tsx           # Interactive map
│   └── ui/                      # UI components
├── services/                     # API services
│   ├── weatherService.ts        # OpenWeatherMap API
│   ├── alertService.ts          # Alert & notification system
│   └── healthTipService.ts      # Health tips logic
├── types/                        # TypeScript types
│   └── weather.ts               # Weather data types
├── lib/                         # Libraries & config
│   └── firebase.ts              # Firebase configuration
├── constants/                    # App constants
│   └── Colors.ts                # Color scheme
├── hooks/                       # Custom React hooks
└── assets/                      # Static assets
```

## 🔧 Konfigurasi API

### OpenWeatherMap API
1. Daftar di [OpenWeatherMap](https://openweathermap.org/api)
2. Pilih plan yang sesuai (Free tier tersedia)
3. Dapatkan API key
4. Update di `services/weatherService.ts`:
   ```typescript
   const API_KEY = 'your-openweathermap-api-key';
   ```

### Firebase Setup
1. Buat project Firebase
2. Enable services:
   - Authentication
   - Firestore Database
   - Cloud Storage
   - Cloud Messaging (untuk notifications)
3. Update konfigurasi di `lib/firebase.ts`

### Google Maps (Opsional)
1. Enable Google Maps JavaScript API
2. Dapatkan API key
3. Tambahkan ke environment variables

## 🔔 Sistem Notifikasi

### Jenis Notifikasi
- **Heat Wave Alert**: Peringatan gelombang panas
- **Cold Wave Alert**: Peringatan gelombang dingin  
- **Air Quality Alert**: Peringatan kualitas udara buruk
- **UV Index Alert**: Peringatan indeks UV tinggi
- **Severe Weather Alert**: Peringatan cuaca ekstrem

### Konfigurasi Notifikasi
```typescript
// Update preferensi notifikasi
await AlertService.updateNotificationPreferences({
  heatWave: true,
  coldWave: true,
  airQuality: true,
  uvIndex: true,
  severeWeather: true
});
```

## ✨ Design Enhancement Details

### 🎨 Component Redesigns

#### **WeatherCard.tsx**
- Dynamic gradient backgrounds berdasarkan kondisi cuaca
- Decorative floating elements untuk visual appeal
- Enhanced weather icons dengan shadow effects
- Location badge dengan glass morphism
- Detail cards dengan improved spacing dan typography

#### **AirQualityCard.tsx** 
- Circular progress indicators untuk AQI dan UV Index
- Color-coded status badges dengan dynamic backgrounds
- Pollutant grid dengan improved layout
- UV rainbow progress bar dengan gradient colors
- Enhanced recommendation cards dengan icons

#### **TemperatureAnomalyChart.tsx**
- Gradient header dengan weather icon
- Enhanced chart container dengan white background
- Improved legend dengan gradient indicators
- Anomaly cards dengan severity-based colors
- Better empty state handling

#### **HealthTipsCard.tsx**
- Category-based gradient backgrounds
- Icon containers dengan rounded backgrounds
- Horizontal scrolling tips dengan smooth animations
- Emergency tips section dengan red accent
- Enhanced typography hierarchy

#### **AnimatedBackground.tsx** (NEW)
- Floating cloud animations
- Weather-based gradient backgrounds
- Decorative stars untuk night theme
- Smooth transition animations
- Non-intrusive background elements

### 🎯 Performance Optimizations
- Native driver animations untuk 60fps performance
- Optimized re-renders dengan React.memo
- Efficient gradient calculations
- Smooth scroll performance
- Memory-efficient animation cleanup

## 🧪 Testing

### Unit Testing
```bash
npm test
```

### E2E Testing
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

### Performance Testing
```bash
# Test animation performance
npm run test:performance

# Memory leak detection
npm run test:memory
```

## 📱 Build & Deploy

### Development Build
```bash
# Start development server dengan cache cleared
npm start -- --clear

# Android development
npm run android

# iOS development  
npm run ios
```

### Production Build
```bash
# Build untuk production
npx expo build:android
npx expo build:ios

# Atau dengan EAS Build
eas build --platform all
```


## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tim Pengembang

- **Developer**: Difa Nugraha

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) untuk weather API
- [Expo](https://expo.dev/) untuk development platform
- [Firebase](https://firebase.google.com/) untuk backend services
- [React Native](https://reactnative.dev/) untuk mobile framework
- [Chart Kit](https://github.com/indiespirit/react-native-chart-kit) untuk chart components
