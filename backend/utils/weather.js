// AI Weather Prediction Logic
const predictWeather = (latitude, longitude, departureDate) => {
  try {
    console.log(`Predicting weather for coords: ${latitude}, ${longitude} on ${departureDate}`);

    // Convert coordinates and date to prediction factors
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const date = new Date(departureDate);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Thailand Climate Zones (simplified AI logic)
    let baseWeatherScore = 0;

    // Latitude-based climate (Thailand is 5°N to 20°N)
    if (lat >= 15) {
      // Northern Thailand (Chiang Mai area) - more seasonal variation
      baseWeatherScore += 0.3;
    } else if (lat >= 10) {
      // Central Thailand (Bangkok area) - moderate
      baseWeatherScore += 0.2;
    } else {
      // Southern Thailand (Phuket area) - more tropical/rainy
      baseWeatherScore += 0.4;
    }

    // Longitude-based (West coast vs East coast)
    if (lng <= 99) {
      // Western Thailand (Andaman Sea side) - more rain
      baseWeatherScore += 0.2;
    } else {
      // Eastern Thailand (Gulf of Thailand side) - less rain
      baseWeatherScore += 0.1;
    }

    // Seasonal factors (Thailand's seasons)
    if (month >= 6 && month <= 10) {
      // Rainy season (June-October)
      baseWeatherScore += 0.4;
    } else if (month >= 11 && month <= 2) {
      // Cool/Dry season (November-February)
      baseWeatherScore -= 0.2;
    } else {
      // Hot season (March-May)
      baseWeatherScore += 0.1;
    }

    // Add some randomness for AI unpredictability
    const randomFactor = (Math.random() - 0.5) * 0.3; // -0.15 to +0.15
    const finalScore = baseWeatherScore + randomFactor;

    // Convert score to weather prediction
    let prediction;
    let confidence;

    if (finalScore >= 0.6) {
      prediction = 'Rainy';
      confidence = Math.min(85 + Math.random() * 10, 95);
    } else if (finalScore >= 0.4) {
      prediction = 'Cloudy';
      confidence = Math.min(75 + Math.random() * 15, 90);
    } else if (finalScore >= 0.2) {
      prediction = 'Normal';
      confidence = Math.min(70 + Math.random() * 20, 90);
    } else {
      prediction = 'Sunny';
      confidence = Math.min(80 + Math.random() * 15, 95);
    }

    const result = {
      prediction: prediction,
      confidence: Math.round(confidence),
      factors: {
        location: `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
        season: getSeason(month),
        climate_zone: getClimateZone(lat),
        base_score: baseWeatherScore.toFixed(2),
        final_score: finalScore.toFixed(2)
      },
      recommendation: getRecommendation(prediction),
      requires_confirmation: prediction === 'Rainy'
    };

    console.log('AI Weather Prediction:', result);
    return result;

  } catch (error) {
    console.error('Weather prediction error:', error);
    return {
      prediction: 'Normal',
      confidence: 50,
      error: 'Unable to predict weather',
      requires_confirmation: false
    };
  }
};

// Helper functions
const getSeason = (month) => {
  if (month >= 6 && month <= 10) return 'Rainy Season';
  if (month >= 11 && month <= 2) return 'Cool Season';
  return 'Hot Season';
};

const getClimateZone = (lat) => {
  if (lat >= 15) return 'Northern Thailand';
  if (lat >= 10) return 'Central Thailand';
  return 'Southern Thailand';
};

const getRecommendation = (prediction) => {
  const recommendations = {
    'Sunny': 'Perfect weather for travel! Don\'t forget sunscreen and sunglasses.',
    'Normal': 'Good weather expected. Pack light layers for comfort.',
    'Cloudy': 'Pleasant weather with some clouds. Great for sightseeing!',
    'Rainy': 'Expect rain during your trip. Pack umbrella, raincoat, and waterproof bags. Consider indoor activities.'
  };
  return recommendations[prediction] || 'Have a great trip!';
};

// Get city coordinates (Thailand major cities)
const getThailandCityCoordinates = (cityName) => {
  const cities = {
    // Major cities
    'bangkok': { lat: 13.7563, lng: 100.5018, name: 'Bangkok' },
    'chiang mai': { lat: 18.7883, lng: 98.9853, name: 'Chiang Mai' },
    'phuket': { lat: 7.8804, lng: 98.3923, name: 'Phuket' },
    'pattaya': { lat: 12.9236, lng: 100.8825, name: 'Pattaya' },
    'krabi': { lat: 8.0863, lng: 98.9063, name: 'Krabi' },
    'koh samui': { lat: 9.5018, lng: 99.9648, name: 'Koh Samui' },
    'hua hin': { lat: 12.5706, lng: 99.9587, name: 'Hua Hin' },
    'chiang rai': { lat: 19.9105, lng: 99.8406, name: 'Chiang Rai' },
    
    // Airport codes
    'bkk': { lat: 13.6900, lng: 100.7501, name: 'Bangkok (BKK)' },
    'dmk': { lat: 13.9126, lng: 100.6067, name: 'Bangkok (DMK)' },
    'hkt': { lat: 8.1132, lng: 98.3162, name: 'Phuket (HKT)' },
    'cnx': { lat: 18.7669, lng: 98.962, name: 'Chiang Mai (CNX)' },
    'usm': { lat: 9.4980, lng: 99.9386, name: 'Koh Samui (USM)' },
    'krb': { lat: 8.0992, lng: 98.9862, name: 'Krabi (KRB)' }
  };

  const searchKey = cityName.toLowerCase().trim();
  return cities[searchKey] || null;
};

module.exports = {
  predictWeather,
  getThailandCityCoordinates
};