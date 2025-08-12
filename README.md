# 🌤️ CuacaX - Aplikasi Cuaca Indonesia

Aplikasi cuaca pintar dengan monitoring anomali suhu, kualitas udara, dan tips kesehatan berbasis React Native.

## ✨ Fitur Utama

- 🌡️ **Data Cuaca Real-time** - OpenWeather API dengan bahasa Indonesia
- 📊 **Deteksi Anomali Suhu** - Gelombang panas/dingin otomatis
- 🌬️ **Monitor Kualitas Udara** - AQI dan tingkat polusi
- ☀️ **Indeks UV** - Peringatan paparan sinar UV
- 💡 **Tips Kesehatan** - Saran aktivitas berdasarkan cuaca
- 🚨 **Alert Pintar** - Notifikasi hanya kondisi berbahaya
- 🗺️ **Peta Interaktif** - Google Maps untuk eksplorasi cuaca
- ❤️ **Lokasi Favorit** - Simpan dan pantau tempat kesukaan

## 🛠️ Teknologi

- **React Native** + Expo SDK 53
- **TypeScript** untuk type safety
- **Firebase** (Database, Auth, Notifications)
- **OpenWeather API** untuk data cuaca
- **Google Maps** untuk peta interaktif

## 📁 Struktur Code

```
CuacaX/
├── app/(tabs)/              # Halaman utama
│   ├── index.tsx           # Beranda - tampilan cuaca utama
│   ├── explore.tsx         # Peta - eksplorasi lokasi
│   ├── favorites.tsx       # Favorit - lokasi tersimpan
│   └── settings.tsx        # Pengaturan - notifikasi & preferensi
│
├── components/              # Komponen UI
│   ├── WeatherCard.tsx     # Kartu cuaca utama
│   ├── AlertsCard.tsx      # Peringatan cuaca
│   ├── AirQualityCard.tsx  # Kualitas udara & UV
│   ├── HealthTipsCard.tsx  # Tips kesehatan
│   ├── WeatherMap.tsx      # Peta Google Maps
│   └── ui/                 # Komponen dasar UI
│
├── services/               # Logika bisnis
│   ├── weatherService.ts   # API cuaca & forecast
│   ├── alertService.ts     # Sistem peringatan
│   ├── notificationService.ts # Push notifications
│   ├── databaseService.ts  # Penyimpanan data
│   └── authService.ts      # Autentikasi user
│
├── types/weather.ts        # TypeScript interfaces
├── contexts/               # React Context (lokasi)
└── lib/firebase.ts         # Konfigurasi Firebase
```

## 🚀 Instalasi

```bash
# Clone repository
git clone https://github.com/DifaaNug/CuacaX.git
cd CuacaX

# Install dependencies
npm install

# Jalankan aplikasi
npx expo start
```

### Setup Environment Variables
Buat file `.env`:
```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
# ... (Firebase config lainnya)
```

## 📱 Cara Kerja

### Alur Data Utama
1. **Lokasi** → GPS atau pilihan user
2. **WeatherService** → Ambil data cuaca real-time
3. **AlertService** → Analisis kondisi berbahaya
4. **UI Components** → Tampilkan informasi
5. **NotificationService** → Kirim alert jika perlu

### Sistem Alert Pintar
- **Anomali Suhu**: Deteksi gelombang panas (>35°C) atau dingin (<10°C)
- **Kualitas Udara**: Alert jika AQI ≥ 4 (tidak sehat)
- **UV Index**: Peringatan paparan UV tinggi
- **Hanya Hari Ini**: Alert tidak menumpuk, fokus kondisi aktual

### Fitur Khusus Indonesia
- Semua teks dalam bahasa Indonesia
- Format tanggal lokal (Senin, Selasa, dst.)
- Tips kesehatan sesuai iklim tropis
- Fallback ke Jakarta jika GPS gagal

## 🧪 Testing

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios

# Web (preview)
npx expo start --web
```

## 📦 Build Production

```bash
# Android APK
eas build --platform android

# iOS App Store
eas build --platform ios
```

---

**CuacaX** - Cuaca pintar untuk hidup lebih sehat 🌤️💚
