import { AirQualityData, ForecastData, TemperatureAnomaly, WeatherData } from '../types/weather';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

// TODO: Replace with your OpenWeatherMap API key
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'your-openweathermap-api-key';

export class WeatherService {
  
  static async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Will be fetched separately
        dewPoint: Math.round(data.main.temp - ((100 - data.main.humidity) / 5)),
        feelsLike: Math.round(data.main.feels_like),
        icon: data.weather[0].icon,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  static async getForecast(lat: number, lon: number): Promise<ForecastData[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const data = await response.json();
      
      // Group by date and get daily forecasts
      const dailyForecasts: { [key: string]: any[] } = {};
      
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
      });
      
      return Object.entries(dailyForecasts).map(([date, items]) => {
        const temps = items.map(item => item.main.temp);
        const precipitation = items.reduce((sum, item) => {
          return sum + (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0);
        }, 0);
        
        return {
          date,
          temperature: {
            min: Math.round(Math.min(...temps)),
            max: Math.round(Math.max(...temps))
          },
          description: items[0].weather[0].description,
          icon: items[0].weather[0].icon,
          precipitation: Math.round(precipitation)
        };
      }).slice(0, 7); // Return 7 days
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  static async getUVIndex(lat: number, lon: number): Promise<number> {
    try {
      const response = await fetch(
        `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch UV index');
      }
      
      const data = await response.json();
      return Math.round(data.value);
    } catch (error) {
      console.error('Error fetching UV index:', error);
      return 0;
    }
  }

  static async getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    try {
      const response = await fetch(
        `${AIR_POLLUTION_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      
      const data = await response.json();
      const pollution = data.list[0];
      
      const aqi = pollution.main.aqi;
      const components = pollution.components;
      
      const getQualityText = (aqi: number): AirQualityData['quality'] => {
        switch (aqi) {
          case 1: return 'Good';
          case 2: return 'Fair';
          case 3: return 'Moderate';
          case 4: return 'Poor';
          case 5: return 'Very Poor';
          default: return 'Good';
        }
      };
      
      const getRecommendations = (aqi: number): string[] => {
        if (aqi <= 2) return ['Air quality is good. Perfect for outdoor activities!'];
        if (aqi === 3) return ['Air quality is moderate. Sensitive people should limit outdoor exercise.'];
        if (aqi === 4) return ['Air quality is poor. Limit outdoor activities.', 'Consider wearing a mask outdoors.'];
        return ['Air quality is very poor. Avoid outdoor activities.', 'Stay indoors and use air purifiers.', 'Wear N95 masks if you must go outside.'];
      };
      
      return {
        aqi,
        pm25: components.pm2_5,
        pm10: components.pm10,
        o3: components.o3,
        no2: components.no2,
        so2: components.so2,
        co: components.co,
        quality: getQualityText(aqi),
        recommendations: getRecommendations(aqi)
      };
    } catch (error) {
      console.error('Error fetching air quality:', error);
      throw error;
    }
  }

  static async searchLocation(query: string): Promise<{name: string, country: string, lat: number, lon: number}[]> {
    try {
      const response = await fetch(
        `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search location');
      }
      
      const data = await response.json();
      return data.map((item: any) => ({
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  }

  static async getHistoricalData(lat: number, lon: number, days: number = 7): Promise<TemperatureAnomaly[]> {
    // For now, we'll simulate historical data since OpenWeather's historical API requires a paid plan
    // You can implement this with your preferred historical weather API
    const anomalies: TemperatureAnomaly[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate temperature data
      const normalTemp = 25 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 10;
      const actualTemp = normalTemp + (Math.random() - 0.5) * 20;
      const anomaly = actualTemp - normalTemp;
      
      let type: TemperatureAnomaly['type'] = 'normal';
      let severity: TemperatureAnomaly['severity'] = 'low';
      
      if (anomaly > 5) {
        type = 'heat_wave';
        severity = anomaly > 10 ? 'extreme' : anomaly > 8 ? 'high' : 'medium';
      } else if (anomaly < -5) {
        type = 'cold_wave';
        severity = anomaly < -10 ? 'extreme' : anomaly < -8 ? 'high' : 'medium';
      }
      
      anomalies.push({
        date: date.toISOString().split('T')[0],
        temperature: Math.round(actualTemp),
        normalTemp: Math.round(normalTemp),
        anomaly: Math.round(anomaly * 10) / 10,
        type,
        severity
      });
    }
    
    return anomalies;
  }
}
