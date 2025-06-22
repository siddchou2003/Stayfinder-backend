import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';

/**
 * GET /admin/bookings
 * - Fetch all bookings
 * - Populates user name/email and listing title
 */
export const getAllBookingsForAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('listing', 'title');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

/**
 * GET /admin/listings
 * - Fetch all listings
 */
export const getAllListingsForAdmin = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};

/**
 * GET /admin/users-with-bookings
 * - Return a unique list of users who have at least one booking
 */
export const getAllUsersWithBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email');

    // Extract users from bookings and remove duplicates
    const users = bookings
      .filter(b => b.user)
      .map(b => b.user);

    // Ensure uniqueness using Map keyed by user ID
    const uniqueUsers = Array.from(new Map(users.map(u => [u._id.toString(), u])).values());
    res.json(uniqueUsers);
  } catch (err) {
    console.error('Error fetching users with bookings:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * DELETE /admin/listings/:id
 * - Admin deletes a listing by its ID
 */
export const deleteListingByAdmin = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ message: 'Failed to delete listing' });
  }
};

/**
 * DELETE /admin/bookings/:id
 * - Admin deletes a booking by its ID
 */
export const deleteBookingByAdmin = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};