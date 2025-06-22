import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';

/**
 * Create a new booking for a listing.
 * - Checks if the listing has available reservation slots
 * - Associates booking with the logged-in user
 */
export const createBooking = async (req, res) => {
  try {
    const { listing: listingId } = req.body;

    // Count how many active confirmed bookings already exist for this listing
    const activeCount = await Booking.countDocuments({
      listing: listingId,
      status: { $in: ['confirmed'] },
      endDate: { $gte: new Date() },
    });

    const listing = await Listing.findById(listingId);

    // Prevent booking if reservation limit is reached
    if (activeCount >= listing.maxReservations) {
      return res.status(400).json({ error: 'Reservation limit reached for this listing.' });
    }

    // Create and save new booking associated with the user
    const newBooking = new Booking({ ...req.body, user: req.user.id });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create booking' });
  }
};

/**
 * Get all bookings made by the currently logged-in user.
 * Populates listing details for each booking.
 */
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('listing');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};

/**
 * Get total number of bookings for a specific listing.
 */
export const getBookingCount = async (req, res) => {
  try {
    const { listingId } = req.params;
    const count = await Booking.countDocuments({ listing: listingId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count bookings' });
  }
};

/**
 * Get number of active (future or ongoing) confirmed bookings for a listing.
 */
export const getActiveBookingCount = async (req, res) => {
  try {
    const { listingId } = req.params;
    const today = new Date();

    // Only count confirmed bookings that have not yet ended
    const count = await Booking.countDocuments({
      listing: listingId,
      status: { $in: ['confirmed'] },
      endDate: { $gte: today },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count active bookings' });
  }
};

/**
 * Cancel a booking before the check-in time.
 * - Ensures user is authorized
 * - Prevents cancellation after check-in
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    // Check if booking exists and belongs to the logged-in user
    if (!booking || booking.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or booking not found' });
    }

    const now = new Date();
    const checkIn = new Date(booking.startDate);

    // Convert check-in time (HH:mm string) to a Date object
    const [hour, minute] = booking.checkInTime.split(':');
    checkIn.setHours(hour, minute);

    // Prevent cancellation if current time is past check-in time
    if (now >= checkIn) {
      return res.status(400).json({ error: 'Cannot cancel after check-in time.' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};