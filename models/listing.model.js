import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  pricePerNight: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  imageUrls: [String],
  maxReservations: {
    type: Number,
    required: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;