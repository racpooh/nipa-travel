const { pool } = require('../config/db');

// Create new booking - CORRECTED VERSION
const createBooking = async (req, res) => {
  try {
    const {
      departure_location,
      destination_location,
      departure_latitude,
      departure_longitude,
      destination_latitude,
      destination_longitude,
      flight_number,
      departure_date,
      departure_time,
      arrival_date,
      arrival_time,
      seat_number,
      gate_number,
      ticket_price
    } = req.body;

    // Validation
    if (!departure_location || !destination_location || !flight_number || !departure_date || !departure_time) {
      return res.status(400).json({
        message: 'Required fields: departure_location, destination_location, flight_number, departure_date, departure_time',
        success: false
      });
    }

    if (!destination_latitude || !destination_longitude) {
      return res.status(400).json({
        message: 'Destination coordinates (latitude, longitude) are required for weather forecasting',
        success: false
      });
    }

    // Insert booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        user_id, departure_location, destination_location,
        departure_latitude, departure_longitude, destination_latitude, destination_longitude,
        flight_number, departure_date, departure_time, arrival_date, arrival_time,
        seat_number, gate_number, ticket_price, booking_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, departure_location, destination_location,
      departure_latitude, departure_longitude, destination_latitude, destination_longitude,
      flight_number, departure_date, departure_time, arrival_date, arrival_time,
      seat_number, gate_number, ticket_price, 'pending'
    ]);

    // 🌤️ ADD WEATHER PREDICTION (BEFORE getting booking data)
    let weatherPrediction = null;
    if (destination_latitude && destination_longitude && departure_date) {
      try {
        const { predictWeather } = require('../utils/weather');
        weatherPrediction = predictWeather(
          destination_latitude, 
          destination_longitude, 
          departure_date
        );
        
        // Update the booking with weather forecast
        await pool.execute(
          'UPDATE bookings SET weather_forecast = ? WHERE id = ?',
          [weatherPrediction.prediction, result.insertId]
        );
        
        console.log(`Weather prediction for booking ${result.insertId}:`, weatherPrediction.prediction);
      } catch (weatherError) {
        console.error('Weather prediction error:', weatherError);
        // Don't fail the booking if weather prediction fails
      }
    }

    // Get the created booking (WITH weather data)
    const [booking] = await pool.execute(`
      SELECT b.*, u.username 
      FROM bookings b 
      JOIN users u ON b.user_id = u.id 
      WHERE b.id = ?
    `, [result.insertId]);

    // SEND RESPONSE WITH WEATHER DATA
    res.status(201).json({
      message: 'Booking created successfully',
      success: true,
      data: {
        booking: booking[0],
        weather_prediction: weatherPrediction, // Include full weather details
        requires_weather_confirmation: weatherPrediction?.requires_confirmation || false
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Failed to create booking',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get user's bookings (with pagination)
const getUserBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE user_id = ?',
      [req.user.id]
    );
    const total_bookings = countRows[0].count;

    // Get paginated bookings
    const [bookings] = await pool.execute(
      `SELECT b.*, u.username FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    res.json({
      message: bookings.length > 0 ? 'User bookings retrieved successfully' : 'No bookings found',
      success: true,
      data: {
        bookings,
        total_bookings,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      message: 'Failed to get bookings',
      success: false,
      error: error.message
    });
  }
};

// Get all bookings (Admin only, with pagination)
const getAllBookings = async (req, res) => {
  try {
    const page = String(req.query.page || "1");
    const limit = String(req.query.limit || "10");
    const offset = String((page - 1) * limit);
    const status = req.query.status; // Optional filter by status

    console.log(`Get all bookings request - Page: ${page}, Limit: ${limit}, Offset: ${offset}, Status: ${status}`);
    // --- Part 1: Get Total Count (Corrected for clarity) ---
    // This part of your code was likely correct, but we'll make it clearer.
    let countQuery = 'SELECT COUNT(*) as count FROM bookings';
    const totalPendingQuery = 'SELECT COUNT(*) as count FROM bookings WHERE booking_status = "pending"';
    const totalCancelledQuery = 'SELECT COUNT(*) as count FROM bookings WHERE booking_status = "cancelled"';
    const totalConfirmedQuery = 'SELECT COUNT(*) as count FROM bookings WHERE booking_status = "confirmed"';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE booking_status = ?';
      countParams.push(status);
    }
    const [countRows] = await pool.execute(countQuery, countParams);
    const total_bookings = countRows[0].count;

    // Get total counts for pending and cancelled bookings
    const [totalPendingRows] = await pool.execute(totalPendingQuery);
    const [totalCancelledRows] = await pool.execute(totalCancelledQuery);
    const total_pending = totalPendingRows[0].count;
    const total_cancelled = totalCancelledRows[0].count;
    const [totalConfirmedRows] = await pool.execute(totalConfirmedQuery);
    const total_confirmed = totalConfirmedRows[0].count;

    // --- Part 2: Get Paginated Bookings (Refactored Logic) ---
    // Start with the base query that is always the same.
    let query = `
      SELECT 
        b.id, b.departure_location, b.destination_location, b.departure_latitude, 
        b.departure_longitude, b.destination_latitude, b.destination_longitude, 
        b.flight_number, b.departure_date, b.departure_time, b.arrival_date, 
        b.arrival_time, b.seat_number, b.gate_number, b.ticket_price, 
        b.weather_forecast, b.weather_confirmed, b.booking_status, b.created_at, 
        b.updated_at, u.username, u.email 
      FROM bookings b 
      JOIN users u ON b.user_id = u.id
    `;
    const queryParams = [];

    // Conditionally add the WHERE clause to both the query and parameters.
    if (status) {
      query += ' WHERE b.booking_status = ?';
      queryParams.push(status);
    }

    // Add the final parts of the query that are always present.
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';

    queryParams.push(limit, offset);

    // Now, the query and params are guaranteed to match.
    const [bookings] = await pool.execute(query, queryParams);

    res.json({
      message: bookings.length > 0 ? 'All bookings retrieved successfully' : 'No bookings found',
      success: true,
      data: {
        bookings,
        total_bookings,
        total_pending,
        total_cancelled,
        total_confirmed,
        page,
        limit,
        filter: status ? { status } : null
      }
    });

    console.log(total_bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      message: 'Failed to get all bookings',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      debug: {
        admin_user: req.user?.username,
        error_code: error.code
      }
    });
  }
};

// Get single booking
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    let query = `
      SELECT b.*, u.username, u.email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `;
    let queryParams = [bookingId];

    // If not admin, only allow access to own bookings
    if (req.user.role !== 'admin') {
      query += ' AND b.user_id = ?';
      queryParams.push(req.user.id);
    }

    const [bookings] = await pool.execute(query, queryParams);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: 'Booking not found or access denied',
        success: false
      });
    }

    res.json({
      message: 'Booking retrieved successfully',
      success: true,
      data: {
        booking: bookings[0]
      }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      message: 'Failed to get booking',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const {
      departure_location,
      destination_location,
      departure_latitude,
      departure_longitude,
      destination_latitude,
      destination_longitude,
      flight_number,
      departure_date,
      departure_time,
      arrival_date,
      arrival_time,
      seat_number,
      gate_number,
      ticket_price,
      booking_status,
      weather_forecast
    } = req.body;

    // Check if booking exists and user has permission
    let checkQuery = 'SELECT user_id FROM bookings WHERE id = ?';
    let checkParams = [bookingId];

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

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (departure_location) {
      updateFields.push('departure_location = ?');
      updateValues.push(departure_location);
    }
    if (destination_location) {
      updateFields.push('destination_location = ?');
      updateValues.push(destination_location);
    }
    if (departure_latitude) {
      updateFields.push('departure_latitude = ?');
      updateValues.push(departure_latitude);
    }
    if (departure_longitude) {
      updateFields.push('departure_longitude = ?');
      updateValues.push(departure_longitude);
    }
    if (destination_latitude) {
      updateFields.push('destination_latitude = ?');
      updateValues.push(destination_latitude);
    }
    if (destination_longitude) {
      updateFields.push('destination_longitude = ?');
      updateValues.push(destination_longitude);
    }
    if (flight_number) {
      updateFields.push('flight_number = ?');
      updateValues.push(flight_number);
    }
    if (departure_date) {
      updateFields.push('departure_date = ?');
      updateValues.push(departure_date);
    }
    if (departure_time) {
      updateFields.push('departure_time = ?');
      updateValues.push(departure_time);
    }
    if (arrival_date) {
      updateFields.push('arrival_date = ?');
      updateValues.push(arrival_date);
    }
    if (arrival_time) {
      updateFields.push('arrival_time = ?');
      updateValues.push(arrival_time);
    }
    if (seat_number) {
      updateFields.push('seat_number = ?');
      updateValues.push(seat_number);
    }
    if (gate_number) {
      updateFields.push('gate_number = ?');
      updateValues.push(gate_number);
    }
    if (ticket_price) {
      updateFields.push('ticket_price = ?');
      updateValues.push(ticket_price);
    }
    if (booking_status && req.user.role === 'admin') {
      updateFields.push('booking_status = ?');
      updateValues.push(booking_status);
    }
    if (weather_forecast) {
      updateFields.push('weather_forecast = ?');
      updateValues.push(weather_forecast);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update',
        success: false
      });
    }

    // Add updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(bookingId);

    const updateQuery = `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await pool.execute(updateQuery, updateValues);

    // Get updated booking
    const [updatedBooking] = await pool.execute(`
      SELECT b.*, u.username
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?
    `, [bookingId]);

    res.json({
      message: 'Booking updated successfully',
      success: true,
      data: {
        booking: updatedBooking[0]
      }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      message: 'Failed to update booking',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Check if booking exists and user has permission
    let checkQuery = 'SELECT user_id, flight_number FROM bookings WHERE id = ?';
    let checkParams = [bookingId];

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

    // Delete booking
    await pool.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);

    res.json({
      message: 'Booking deleted successfully',
      success: true,
      data: {
        deleted_booking_id: bookingId,
        flight_number: existingBooking[0].flight_number
      }
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      message: 'Failed to delete booking',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

const deleteAllBookings = async (req, res) => {
  try {
    console.log('Delete all bookings request by user:', req.user.username);

    // Delete all bookings
    await pool.execute('DELETE FROM bookings');

    res.json({
      message: 'All bookings deleted successfully',
      success: true
    });

  } catch (error) {
    console.error('Delete all bookings error:', error);
    res.status(500).json({
      message: 'Failed to delete all bookings',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  deleteAllBookings
};