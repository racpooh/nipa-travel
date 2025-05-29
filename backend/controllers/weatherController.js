const { predictWeather, getThailandCityCoordinates } = require('../utils/weather');
const { pool } = require('../config/db');

// Get weather forecast for destination
const getWeatherForecast = async (req, res) => {
  try {
    const { destination, departure_date, latitude, longitude } = req.query;

    // Validate required parameters
    if (!departure_date) {
      return res.status(400).json({
        message: 'departure_date is required',
        success: false
      });
    }

    let lat, lng, locationName;

    // Method 1: Use provided coordinates
    if (latitude && longitude) {
      lat = parseFloat(latitude);
      lng = parseFloat(longitude);
      locationName = destination || `${lat}, ${lng}`;
    }
    // Method 2: Look up city coordinates
    else if (destination) {
      const cityCoords = getThailandCityCoordinates(destination);
      if (!cityCoords) {
        return res.status(404).json({
          message: `City '${destination}' not found in Thailand database`,
          success: false,
          suggestion: 'Try: Bangkok, Chiang Mai, Phuket, Pattaya, Krabi, Koh Samui'
        });
      }
      lat = cityCoords.lat;
      lng = cityCoords.lng;
      locationName = cityCoords.name;
    }
    else {
      return res.status(400).json({
        message: 'Either destination city name OR latitude/longitude coordinates are required',
        success: false
      });
    }

    // Get AI weather prediction
    const weatherForecast = predictWeather(lat, lng, departure_date);

    res.json({
      message: 'Weather forecast generated successfully',
      success: true,
      data: {
        location: {
          name: locationName,
          coordinates: {
            latitude: lat,
            longitude: lng
          }
        },
        departure_date: departure_date,
        forecast: weatherForecast,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Weather forecast error:', error);
    res.status(500).json({
      message: 'Failed to get weather forecast',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update booking with weather confirmation
const confirmBookingWithWeather = async (req, res) => {
  try {
    const { booking_id, weather_confirmed, weather_forecast } = req.body;

    // Validate input
    if (!booking_id) {
      return res.status(400).json({
        message: 'booking_id is required',
        success: false
      });
    }

    if (weather_confirmed === undefined) {
      return res.status(400).json({
        message: 'weather_confirmed (true/false) is required',
        success: false
      });
    }

    // Check if booking exists and user has permission
    let checkQuery = 'SELECT user_id, destination_latitude, destination_longitude, departure_date FROM bookings WHERE id = ?';
    let checkParams = [booking_id];

    if (req.user.role !== 'admin') {
      checkQuery += ' AND user_id = ?';
      checkParams.push(req.user.id);
    }

    const [existingBooking] = await pool.execute(checkQuery, checkParams);

    if (existingBooking.length === 0) {
      return res.status(404).json({
        message: 'Booking not found or access denied',
        success: false
      });
    }

    const booking = existingBooking[0];

    // If weather_forecast not provided, generate it
    let finalWeatherForecast = weather_forecast;
    if (!finalWeatherForecast && booking.destination_latitude && booking.destination_longitude) {
      const aiPrediction = predictWeather(
        booking.destination_latitude, 
        booking.destination_longitude, 
        booking.departure_date
      );
      finalWeatherForecast = aiPrediction.prediction;
    }

    // Update booking with weather information
    const [result] = await pool.execute(`
      UPDATE bookings 
      SET weather_forecast = ?, weather_confirmed = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [finalWeatherForecast || 'Normal', weather_confirmed, booking_id]);

    // Get updated booking
    const [updatedBooking] = await pool.execute(`
      SELECT b.*, u.username
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [booking_id]);

    res.json({
      message: weather_confirmed ? 
        'Booking confirmed with weather forecast' : 
        'Booking cancelled due to weather concerns',
      success: true,
      data: {
        booking: updatedBooking[0]
      }
    });

  } catch (error) {
    console.error('Confirm booking with weather error:', error);
    res.status(500).json({
      message: 'Failed to confirm booking with weather',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get Thailand city coordinates
const getCityCoordinates = async (req, res) => {
  try {
    const { city } = req.params;

    const coordinates = getThailandCityCoordinates(city);
    
    if (!coordinates) {
      return res.status(404).json({
        message: `City '${city}' not found`,
        success: false,
        available_cities: [
          'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 
          'Koh Samui', 'Hua Hin', 'Chiang Rai'
        ]
      });
    }

    res.json({
      message: 'City coordinates found',
      success: true,
      data: {
        city: coordinates.name,
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        }
      }
    });

  } catch (error) {
    console.error('Get city coordinates error:', error);
    res.status(500).json({
      message: 'Failed to get city coordinates',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getWeatherForecast,
  confirmBookingWithWeather,
  getCityCoordinates
};