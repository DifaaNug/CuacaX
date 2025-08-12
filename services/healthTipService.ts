import { AirQualityData, HealthTip, WeatherData } from '../types/weather';

export class HealthTipService {
  private static healthTips: HealthTip[] = [
    // Tips terkait cuaca panas
    {
      id: 'heat_1',
      title: 'Tetap Terhidrasi',
      description: 'Minum banyak air sepanjang hari, meskipun tidak merasa haus. Hindari alkohol dan kafein karena dapat menyebabkan dehidrasi.',
      category: 'heat',
      conditions: ['temperature > 30', 'heat_wave'],
      icon: '💧'
    },
    {
      id: 'heat_2',
      title: 'Berpakaian yang Tepat',
      description: 'Kenakan pakaian berwarna terang, longgar, dan terbuat dari kain yang dapat menyerap keringat seperti katun. Gunakan topi bertepi lebar dan kacamata hitam.',
      category: 'heat',
      conditions: ['temperature > 28', 'heat_wave'],
      icon: '👕'
    },
    {
      id: 'heat_3',
      title: 'Cari Tempat Ber-AC',
      description: 'Berada di ruangan ber-AC selama bagian terpanas hari. Jika tidak memiliki AC, kunjungi tempat umum seperti mal atau perpustakaan.',
      category: 'heat',
      conditions: ['temperature > 35', 'heat_wave'],
      icon: '❄️'
    },
    {
      id: 'heat_4',
      title: 'Batasi Aktivitas Outdoor',
      description: 'Hindari aktivitas berat di luar ruangan saat panas puncak (10 pagi - 4 sore). Jika harus keluar, istirahat sering di tempat teduh.',
      category: 'heat',
      conditions: ['temperature > 32', 'heat_wave'],
      icon: '🏃‍♂️'
    },
    
    // Tips terkait cuaca dingin
    {
      id: 'cold_1',
      title: 'Berpakaian Berlapis',
      description: 'Kenakan pakaian berlapis untuk menjebak udara hangat. Gunakan pakaian dalam yang menyerap kelembaban dan lapisan tengah yang menghangatkan.',
      category: 'cold',
      conditions: ['temperature < 5', 'cold_wave'],
      icon: '🧥'
    },
    {
      id: 'cold_2',
      title: 'Lindungi Bagian Ujung Tubuh',
      description: 'Kenakan sarung tangan hangat, topi, dan kaus kaki tebal untuk mencegah radang dingin. Jaga tangan dan kaki tetap kering.',
      category: 'cold',
      conditions: ['temperature < 0', 'cold_wave'],
      icon: '🧤'
    },
    {
      id: 'cold_3',
      title: 'Tetap Hangat dan Kering',
      description: 'Jaga rumah agar cukup hangat. Hindari basah saat cuaca dingin dan segera ganti pakaian basah.',
      category: 'cold',
      conditions: ['temperature < 10', 'cold_wave'],
      icon: '🏠'
    },
    {
      id: 'cold_4',
      title: 'Waspadai Tanda Hipotermia',
      description: 'Waspadai gejala seperti menggigil tidak terkendali, kebingungan, dan mengantuk. Segera cari bantuan medis jika terjadi.',
      category: 'cold',
      conditions: ['temperature < -5', 'cold_wave'],
      icon: '🚨'
    },
    
    // Tips kualitas udara
    {
      id: 'air_1',
      title: 'Tetap di Dalam Ruangan',
      description: 'Tutup jendela dan pintu saat kualitas udara buruk. Gunakan pembersih udara jika tersedia.',
      category: 'air_quality',
      conditions: ['aqi > 100'],
      icon: '🏠'
    },
    {
      id: 'air_2',
      title: 'Gunakan Masker',
      description: 'Gunakan masker N95 atau KN95 saat keluar rumah pada hari kualitas udara buruk.',
      category: 'air_quality',
      conditions: ['aqi > 150'],
      icon: '😷'
    },
    {
      id: 'air_3',
      title: 'Batasi Olahraga Luar Ruangan',
      description: 'Hindari aktivitas berat di luar ruangan saat kualitas udara buruk. Olahraga di dalam ruangan saja.',
      category: 'air_quality',
      conditions: ['aqi > 100'],
      icon: '💪'
    },
    {
      id: 'air_4',
      title: 'Gunakan Pembersih Udara',
      description: 'Jalankan pembersih udara di rumah, terutama di kamar tidur. Jaga filter HEPA tetap bersih dan ganti secara teratur.',
      category: 'air_quality',
      conditions: ['aqi > 50'],
      icon: '🌪️'
    },
    
    // Tips perlindungan UV
    {
      id: 'uv_1',
      title: 'Gunakan Tabir Surya',
      description: 'Gunakan tabir surya spektrum luas dengan SPF 30 atau lebih tinggi. Oleskan ulang setiap 2 jam dan setelah berenang atau berkeringat.',
      category: 'uv',
      conditions: ['uv_index > 6'],
      icon: '🧴'
    },
    {
      id: 'uv_2',
      title: 'Cari Tempat Teduh',
      description: 'Berada di tempat teduh antara pukul 10 pagi dan 4 sore saat sinar UV paling kuat. Gunakan payung, pohon, atau tempat berlindung.',
      category: 'uv',
      conditions: ['uv_index > 8'],
      icon: '🌳'
    },
    {
      id: 'uv_3',
      title: 'Gunakan Pakaian Pelindung',
      description: 'Tutup tubuh dengan kemeja lengan panjang, celana panjang, dan topi bertepi lebar. Pilih kain yang rapat.',
      category: 'uv',
      conditions: ['uv_index > 7'],
      icon: '👒'
    },
    {
      id: 'uv_4',
      title: 'Lindungi Mata Anda',
      description: 'Gunakan kacamata hitam yang memblokir 99-100% sinar UV-A dan UV-B. Cari label yang menyebutkan perlindungan UV.',
      category: 'uv',
      conditions: ['uv_index > 5'],
      icon: '🕶️'
    },
    
    // Tips kesehatan umum
    {
      id: 'general_1',
      title: 'Periksa Orang Rentan',
      description: 'Secara teratur periksa anggota keluarga lansia, tetangga, dan orang dengan kondisi kesehatan kronis selama cuaca ekstrem.',
      category: 'general',
      conditions: ['temperature > 35', 'temperature < 0', 'aqi > 150'],
      icon: '👥'
    },
    {
      id: 'general_2',
      title: 'Kenali Tanda Darurat',
      description: 'Pelajari cara mengenali tanda kelelahan panas, hipotermia, dan gangguan pernapasan. Hubungi layanan darurat jika diperlukan.',
      category: 'general',
      conditions: ['temperature > 35', 'temperature < -5', 'aqi > 200'],
      icon: '🚑'
    },
    {
      id: 'general_3',
      title: 'Tetap Terinformasi',
      description: 'Pantau prakiraan cuaca dan laporan kualitas udara. Daftar untuk peringatan darurat dari otoritas lokal.',
      category: 'general',
      conditions: ['always'],
      icon: '📱'
    },
    {
      id: 'general_4',
      title: 'Jaga Nutrisi yang Baik',
      description: 'Makan makanan ringan dan bergizi saat cuaca panas. Sertakan buah dan sayuran dengan kandungan air tinggi.',
      category: 'general',
      conditions: ['temperature > 25'],
      icon: '🥗'
    }
  ];

  static getRelevantTips(
    weather: WeatherData, 
    airQuality?: AirQualityData, 
    hasHeatWave?: boolean, 
    hasColdWave?: boolean
  ): HealthTip[] {
    const relevantTips: HealthTip[] = [];
    
    for (const tip of this.healthTips) {
      if (this.isTipRelevant(tip, weather, airQuality, hasHeatWave, hasColdWave)) {
        relevantTips.push(tip);
      }
    }
    
    // Sort by priority (most critical first)
    return relevantTips.sort((a, b) => {
      const priorityOrder = ['general', 'heat', 'cold', 'air_quality', 'uv'];
      const aPriority = priorityOrder.indexOf(a.category);
      const bPriority = priorityOrder.indexOf(b.category);
      return aPriority - bPriority;
    }).slice(0, 6); // Return top 6 most relevant tips
  }

  private static isTipRelevant(
    tip: HealthTip, 
    weather: WeatherData, 
    airQuality?: AirQualityData,
    hasHeatWave?: boolean,
    hasColdWave?: boolean
  ): boolean {
    for (const condition of tip.conditions) {
      if (condition === 'always') return true;
      if (condition === 'heat_wave' && hasHeatWave) return true;
      if (condition === 'cold_wave' && hasColdWave) return true;
      
      // Temperature conditions
      if (condition.includes('temperature >')) {
        const threshold = parseInt(condition.split('> ')[1]);
        if (weather.temperature > threshold) return true;
      }
      if (condition.includes('temperature <')) {
        const threshold = parseInt(condition.split('< ')[1]);
        if (weather.temperature < threshold) return true;
      }
      
      // UV index conditions
      if (condition.includes('uv_index >')) {
        const threshold = parseInt(condition.split('> ')[1]);
        if (weather.uvIndex > threshold) return true;
      }
      
      // Air quality conditions
      if (condition.includes('aqi >') && airQuality) {
        const threshold = parseInt(condition.split('> ')[1]);
        if (airQuality.aqi > threshold) return true;
      }
    }
    
    return false;
  }

  static getTipsByCategory(category: HealthTip['category']): HealthTip[] {
    return this.healthTips.filter(tip => tip.category === category);
  }

  static getTipById(id: string): HealthTip | undefined {
    return this.healthTips.find(tip => tip.id === id);
  }

  static getEmergencyTips(weather: WeatherData, airQuality?: AirQualityData): HealthTip[] {
    const emergencyTips: HealthTip[] = [];
    
    // Extreme heat emergency tips
    if (weather.temperature > 40) {
      emergencyTips.push({
        id: 'emergency_heat',
        title: 'EXTREME HEAT EMERGENCY',
        description: 'Temperature is dangerously high. Stay indoors with air conditioning. Call emergency services if experiencing heat stroke symptoms: high body temperature, altered mental state, hot/dry skin.',
        category: 'heat',
        conditions: ['temperature > 40'],
        icon: '🚨'
      });
    }
    
    // Extreme cold emergency tips
    if (weather.temperature < -20) {
      emergencyTips.push({
        id: 'emergency_cold',
        title: 'EXTREME COLD EMERGENCY',
        description: 'Dangerously cold conditions. Avoid outdoor exposure. Watch for hypothermia and frostbite. Seek immediate medical attention for uncontrollable shivering or numbness.',
        category: 'cold',
        conditions: ['temperature < -20'],
        icon: '🚨'
      });
    }
    
    // Hazardous air quality emergency tips
    if (airQuality && airQuality.aqi > 300) {
      emergencyTips.push({
        id: 'emergency_air',
        title: 'HAZARDOUS AIR QUALITY',
        description: 'Air quality is hazardous to health. Everyone should avoid outdoor activities. Stay indoors with windows closed and use air purifiers.',
        category: 'air_quality',
        conditions: ['aqi > 300'],
        icon: '🚨'
      });
    }
    
    return emergencyTips;
  }
}
