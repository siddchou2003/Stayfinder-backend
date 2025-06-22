import Listing from '../models/listing.model.js';
import multer from 'multer';

/**
 * Fetch all listings from the database.
 */
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

/**
 * Fetch a single listing by its ID.
 */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

/**
 * Create a new listing.
 * - Associates the listing with the currently authenticated host user
 * - Saves uploaded image URLs
 */
export const createListing = async (req, res) => {
  try {
    // Build image URLs based on uploaded files
    const imageUrls = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const newListing = new Listing({
      ...req.body,
      host: req.user._id,
      imageUrls,
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create listing' });
  }
};

/**
 * Update an existing listing.
 * - Only the host user or admin can perform the update
 * - Updates only the fields provided in the request
 */
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ensure only host or admin can update
    if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this listing' });
    }

    // Update fields if provided, otherwise keep existing
    listing.title = req.body.title || listing.title;
    listing.location = req.body.location || listing.location;
    listing.pricePerNight = req.body.pricePerNight || listing.pricePerNight;
    listing.maxReservations = req.body.maxReservations || listing.maxReservations;

    // Replace images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      listing.imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    await listing.save();

    res.json({ message: 'Listing updated successfully.', listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

/**
 * Multer storage configuration for file uploads.
 * - Stores images in the 'uploads/' directory
 * - Prepends filename with timestamp to avoid collisions
 */
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
export const upload = multer({ storage });

/**
 * Delete a listing.
 * - Only the host or an admin can delete a listing
 */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Only host or admin is authorized to delete
    if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this listing' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};