import { AirQualityData, ForecastData, TemperatureAnomaly, WeatherData } from '../types/weather';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';


const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '7fa604aa0abb83b5f0eab68a7fad889b';

export class WeatherService {
  
  static async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      console.log('Fetching weather from:', url.replace(API_KEY, '[API_KEY]'));
      
      const response = await fetch(url);
      
      console.log('Weather API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Weather API error response:', errorText);
        throw new Error(`Failed to fetch weather data: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Weather data received successfully:', data.name, data.main.temp);
      
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
        },
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
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
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data for UV estimation');
      }
      
      const data = await response.json();
      
      // Estimate UV index based on weather conditions and time
      const now = new Date();
      const sunrise = new Date(data.sys.sunrise * 1000);
      const sunset = new Date(data.sys.sunset * 1000);
      const isDayTime = now >= sunrise && now <= sunset;
      
      let uvEstimate = 0;
      if (isDayTime) {
        const cloudiness = data.clouds.all;
        const weatherMain = data.weather[0].main.toLowerCase();
        
        // Base UV for tropical location (Indonesia)
        let baseUV = 8;
        
        // Adjust for cloud cover
        if (cloudiness < 20) baseUV = 10; // Clear sky
        else if (cloudiness < 50) baseUV = 8; // Partly cloudy
        else if (cloudiness < 80) baseUV = 6; // Mostly cloudy
        else baseUV = 3; // Overcast
        
        // Adjust for weather conditions
        if (weatherMain.includes('rain') || weatherMain.includes('storm')) {
          baseUV = Math.max(1, baseUV - 3);
        }
        
        // Adjust for time of day (peak at noon)
        const hour = now.getHours();
        const timeMultiplier = hour >= 10 && hour <= 14 ? 1.0 : 
                              hour >= 9 && hour <= 15 ? 0.8 : 0.6;
        
        uvEstimate = Math.round(baseUV * timeMultiplier);
      }
      
      return uvEstimate;
    } catch (error) {
      console.error('Error fetching UV index:', error);
      // Fallback to moderate UV during day time
      const hour = new Date().getHours();
      const fallbackUV = hour >= 6 && hour <= 18 ? 6 : 0;
      return fallbackUV;
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

  static async getHistoricalData(lat: number, lon: number, days: number = 7, currentTemp?: number): Promise<TemperatureAnomaly[]> {
    // For now, we'll simulate historical data since OpenWeather's historical API requires a paid plan
    // You can implement this with your preferred historical weather API
    const anomalies: TemperatureAnomaly[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Calculate normal temperature based on season for Indonesia (tropical climate)
      const normalTemp = 28 + Math.sin((date.getMonth() + 1) * Math.PI / 6) * 3; // 25-31°C range
      
      // For recent days, use temperature closer to current temperature for realistic anomalies
      let actualTemp: number;
      if (i === 0 && currentTemp) {
        // Today's temperature should be the actual current temperature
        actualTemp = currentTemp;
      } else {
        // Historical temps should be more realistic - closer to normal with some variation
        const dayVariation = (Math.random() - 0.5) * 6; // Reduced variation
        actualTemp = normalTemp + dayVariation;
        
        // If current temp is significantly different from normal, reflect that in recent history
        if (currentTemp) {
          const currentAnomaly = currentTemp - normalTemp;
          const trendFactor = Math.max(0, 1 - i / days); // Recent days follow current trend more
          actualTemp += currentAnomaly * trendFactor * 0.5;
        }
      }
      
      const anomaly = actualTemp - normalTemp;
      
      let type: TemperatureAnomaly['type'] = 'normal';
      let severity: TemperatureAnomaly['severity'] = 'low';
      
      // Adjusted thresholds for Indonesian tropical climate
      // Normal: 25-31°C, Heat Wave: >35°C, Cold Wave: <22°C
      if (anomaly > 6) {
        type = 'heat_wave';
        severity = anomaly > 12 ? 'extreme' : anomaly > 9 ? 'high' : 'medium';
      } else if (anomaly < -6) {
        type = 'cold_wave';
        severity = anomaly < -12 ? 'extreme' : anomaly < -9 ? 'high' : 'medium';
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
