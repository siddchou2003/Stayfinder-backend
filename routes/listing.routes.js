import express from 'express';
import { createListing, getListings, getListingById, updateListing, upload, deleteListing } from '../controllers/listing.controller.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * GET /listings
 * - Public: Fetch all listings
 */
router.get('/', getListings);

/**
 * GET /listings/:id
 * - Public: Fetch a specific listing by ID
 */
router.get('/:id', getListingById);

/**
 * PATCH /listings/:id
 * - Authenticated: Partially update listing (host or admin)
 */
router.patch('/:id', verifyToken, updateListing);

/**
 * POST /listings
 * - Authenticated: Create a new listing
 * - Accepts up to 5 image files (multi-upload)
 */
router.post('/', verifyToken, upload.array('images', 5), createListing);

/**
 * PUT /listings/:id
 * - Authenticated: Replace an existing listing (host or admin)
 * - Also supports up to 5 image files
 */
router.put('/:id', verifyToken, upload.array('images', 5), updateListing);

/**
 * DELETE /listings/:id
 * - Authenticated: Delete listing (host or admin)
 */
router.delete('/:id', verifyToken, deleteListing);

export default router;