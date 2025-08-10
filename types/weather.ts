export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  feelsLike: number;
  icon: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface ForecastData {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
  precipitation: number;
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  quality: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor';
  recommendations: string[];
}

export interface TemperatureAnomaly {
  date: string;
  temperature: number;
  normalTemp: number;
  anomaly: number;
  type: 'heat_wave' | 'cold_wave' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'extreme';
}

export interface HealthTip {
  id: string;
  title: string;
  description: string;
  category: 'heat' | 'cold' | 'air_quality' | 'uv' | 'general';
  conditions: string[];
  icon: string;
  type?: 'heat_wave' | 'cold_wave' | 'air_quality' | 'uv_high' | 'general';
  action?: string;
}

export interface Alert {
  id: string;
  type: 'heat_wave' | 'cold_wave' | 'poor_air_quality' | 'high_uv' | 'severe_weather';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: Date;
  location: string;
  isActive: boolean;
  recommendations: string[];
}

export interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windUnit: 'kmh' | 'mph' | 'ms';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  alertsEnabled: boolean;
  notificationSettings: {
    heatWave: boolean;
    coldWave: boolean;
    airQuality: boolean;
    uvIndex: boolean;
    severeWeather: boolean;
  };
  favoriteLocations: string[];
}
