const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  deleteAllBookings
} = require('../controllers/bookingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authenticateToken, createBooking);

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', authenticateToken, getUserBookings);

// @route   GET /api/bookings/all
// @desc    Get all bookings (Admin only)
// @access  Private (Admin)
router.get('/all', authenticateToken, requireAdmin, getAllBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private (Own booking or Admin)
router.get('/:id', authenticateToken, getBookingById);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private (Own booking or Admin)
router.put('/:id', authenticateToken, updateBooking);


// @route   DELETE /api/bookings/all
// @desc    Delete all bookings (Admin only)
// @access  Private (Admin)
router.delete('/all', authenticateToken, requireAdmin, deleteAllBookings);

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private (Own booking or Admin)
router.delete('/:id', authenticateToken, deleteBooking);

module.exports = router;