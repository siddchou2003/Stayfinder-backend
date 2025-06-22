import express from 'express';
import verifyToken, { requireRole } from '../middleware/verifyToken.js';
import Listing from '../models/listing.model.js';
import Booking from '../models/booking.model.js';
import { deleteBookingByAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

/**
 * GET /admin/listings
 * - Fetch all listings (admin-only)
 */
router.get('/listings', verifyToken(), requireRole('admin'), async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
});

/**
 * GET /admin/bookings
 * - Fetch all bookings with user and listing populated (admin-only)
 */
router.get('/bookings', verifyToken(), requireRole('admin'), async (req, res) => {
  const bookings = await Booking.find().populate('user listing');
  res.json(bookings);
});

/**
 * PUT /admin/listings/:id
 * - Admin can update any listing by ID
 * - Uses validators and returns updated document
 */
router.put('/listings/:id', verifyToken(), requireRole('admin'), async (req, res) => {
  try {
    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Listing not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
});

/**
 * DELETE /admin/bookings/:id
 * - Admin deletes a booking by ID
 * - Delegated to admin controller
 */
router.delete('/bookings/:id', verifyToken('admin'), deleteBookingByAdmin);

export default router;