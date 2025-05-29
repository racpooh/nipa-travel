const express = require('express');
const router = express.Router();
const {
  getWeatherForecast,
  confirmBookingWithWeather,
  getCityCoordinates
} = require('../controllers/weatherController');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/weather/forecast
// @desc    Get AI weather forecast for destination
// @access  Private
router.get('/forecast', authenticateToken, getWeatherForecast);

// @route   POST /api/weather/confirm-booking
// @desc    Confirm or cancel booking based on weather
// @access  Private
router.post('/confirm-booking', authenticateToken, confirmBookingWithWeather);

// @route   GET /api/weather/city/:city
// @desc    Get coordinates for Thailand city
// @access  Private
router.get('/city/:city', authenticateToken, getCityCoordinates);

module.exports = router;