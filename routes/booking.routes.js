import express from 'express';
import Booking from '../models/booking.model.js';
import { createBooking, getUserBookings, getActiveBookingCount, getBookingCount } 
from '../controllers/booking.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * GET /bookings
 * - Fetch all bookings (optionally filtered by listingId)
 * - Mainly for debugging or admin purposes (not protected here)
 */
router.get('/', async (req, res) => {
  try {
    const { listingId } = req.query;
    const query = listingId ? { listing: listingId } : {};
    const bookings = await Booking.find(query);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /bookings/active/count/:listingId
 * - Count active (confirmed and ongoing) bookings for a specific listing
 * - Useful for front-end to block overbooking
 */
router.get('/active/count/:listingId', getActiveBookingCount);

/**
 * GET /bookings/count/:listingId
 * - Count total bookings (any status) for a listing
 */
router.get('/count/:listingId', getBookingCount);

/**
 * POST /bookings
 * - Create a new booking (authenticated user only)
 */
router.post('/', verifyToken, createBooking);

/**
 * GET /bookings/me
 * - Get all bookings made by the logged-in user
 */
router.get('/me', verifyToken, getUserBookings);

/**
 * PATCH /bookings/:id/confirm
 * - Mark booking as paid and update status to 'confirmed'
 * - Used after successful payment
 */
router.patch('/:id/confirm', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Booking.findByIdAndUpdate(
      id,
      { isPaid: true, status: 'confirmed' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

/**
 * PATCH /bookings/:id/cancel
 * - Allow a user to cancel their own booking (if before check-in time)
 */
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Only the user who made the booking can cancel it
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;