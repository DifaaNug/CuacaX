import { AirQualityData, HealthTip, WeatherData } from '../types/weather';

export class HealthTipService {
  private static healthTips: HealthTip[] = [
    // Heat-related tips
    {
      id: 'heat_1',
      title: 'Stay Hydrated',
      description: 'Drink plenty of water throughout the day, even if you don\'t feel thirsty. Avoid alcohol and caffeine as they can lead to dehydration.',
      category: 'heat',
      conditions: ['temperature > 30', 'heat_wave'],
      icon: '💧'
    },
    {
      id: 'heat_2',
      title: 'Dress Appropriately',
      description: 'Wear light-colored, loose-fitting clothing made of breathable fabrics like cotton. Use a wide-brimmed hat and sunglasses.',
      category: 'heat',
      conditions: ['temperature > 28', 'heat_wave'],
      icon: '👕'
    },
    {
      id: 'heat_3',
      title: 'Seek Air Conditioning',
      description: 'Stay in air-conditioned spaces during the hottest parts of the day. If you don\'t have AC, visit public places like malls or libraries.',
      category: 'heat',
      conditions: ['temperature > 35', 'heat_wave'],
      icon: '❄️'
    },
    {
      id: 'heat_4',
      title: 'Limit Outdoor Activities',
      description: 'Avoid strenuous outdoor activities during peak heat hours (10 AM - 4 PM). If you must be outside, take frequent breaks in shade.',
      category: 'heat',
      conditions: ['temperature > 32', 'heat_wave'],
      icon: '🏃‍♂️'
    },
    
    // Cold-related tips
    {
      id: 'cold_1',
      title: 'Layer Your Clothing',
      description: 'Dress in multiple layers to trap warm air. Wear moisture-wicking base layers and insulating middle layers.',
      category: 'cold',
      conditions: ['temperature < 5', 'cold_wave'],
      icon: '🧥'
    },
    {
      id: 'cold_2',
      title: 'Protect Extremities',
      description: 'Wear warm gloves, hat, and thick socks to prevent frostbite. Keep hands and feet dry.',
      category: 'cold',
      conditions: ['temperature < 0', 'cold_wave'],
      icon: '🧤'
    },
    {
      id: 'cold_3',
      title: 'Stay Warm and Dry',
      description: 'Keep your home adequately heated. Avoid getting wet in cold weather and change out of wet clothes immediately.',
      category: 'cold',
      conditions: ['temperature < 10', 'cold_wave'],
      icon: '🏠'
    },
    {
      id: 'cold_4',
      title: 'Watch for Hypothermia Signs',
      description: 'Be aware of symptoms like uncontrollable shivering, confusion, and drowsiness. Seek immediate medical attention if these occur.',
      category: 'cold',
      conditions: ['temperature < -5', 'cold_wave'],
      icon: '🚨'
    },
    
    // Air quality tips
    {
      id: 'air_1',
      title: 'Stay Indoors',
      description: 'Keep windows and doors closed when air quality is poor. Use air purifiers if available.',
      category: 'air_quality',
      conditions: ['aqi > 100'],
      icon: '🏠'
    },
    {
      id: 'air_2',
      title: 'Wear a Mask',
      description: 'Use N95 or KN95 masks when going outside during poor air quality days.',
      category: 'air_quality',
      conditions: ['aqi > 150'],
      icon: '😷'
    },
    {
      id: 'air_3',
      title: 'Limit Outdoor Exercise',
      description: 'Avoid strenuous outdoor activities when air quality is poor. Exercise indoors instead.',
      category: 'air_quality',
      conditions: ['aqi > 100'],
      icon: '💪'
    },
    {
      id: 'air_4',
      title: 'Use Air Purifiers',
      description: 'Run air purifiers in your home, especially in bedrooms. Keep HEPA filters clean and replace regularly.',
      category: 'air_quality',
      conditions: ['aqi > 50'],
      icon: '🌪️'
    },
    
    // UV protection tips
    {
      id: 'uv_1',
      title: 'Apply Sunscreen',
      description: 'Use broad-spectrum sunscreen with SPF 30 or higher. Reapply every 2 hours and after swimming or sweating.',
      category: 'uv',
      conditions: ['uv_index > 6'],
      icon: '🧴'
    },
    {
      id: 'uv_2',
      title: 'Seek Shade',
      description: 'Stay in shade between 10 AM and 4 PM when UV rays are strongest. Use umbrellas, trees, or shelters.',
      category: 'uv',
      conditions: ['uv_index > 8'],
      icon: '🌳'
    },
    {
      id: 'uv_3',
      title: 'Wear Protective Clothing',
      description: 'Cover up with long-sleeved shirts, long pants, and wide-brimmed hats. Choose tightly woven fabrics.',
      category: 'uv',
      conditions: ['uv_index > 7'],
      icon: '👒'
    },
    {
      id: 'uv_4',
      title: 'Protect Your Eyes',
      description: 'Wear sunglasses that block 99-100% of UV-A and UV-B rays. Look for labels that specify UV protection.',
      category: 'uv',
      conditions: ['uv_index > 5'],
      icon: '🕶️'
    },
    
    // General health tips
    {
      id: 'general_1',
      title: 'Check on Vulnerable People',
      description: 'Regularly check on elderly family members, neighbors, and people with chronic health conditions during extreme weather.',
      category: 'general',
      conditions: ['temperature > 35', 'temperature < 0', 'aqi > 150'],
      icon: '👥'
    },
    {
      id: 'general_2',
      title: 'Know Emergency Signs',
      description: 'Learn to recognize signs of heat exhaustion, hypothermia, and respiratory distress. Call emergency services if needed.',
      category: 'general',
      conditions: ['temperature > 35', 'temperature < -5', 'aqi > 200'],
      icon: '🚑'
    },
    {
      id: 'general_3',
      title: 'Stay Informed',
      description: 'Monitor weather forecasts and air quality reports. Sign up for emergency alerts from local authorities.',
      category: 'general',
      conditions: ['always'],
      icon: '📱'
    },
    {
      id: 'general_4',
      title: 'Maintain Good Nutrition',
      description: 'Eat light, nutritious meals during hot weather. Include fruits and vegetables with high water content.',
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
