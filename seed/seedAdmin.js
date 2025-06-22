import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

/**
 * Script to create a default admin user.
 * - Prevents duplication by checking if the email already exists.
 * - Saves the admin with a hardcoded email and placeholder password.
 */
async function createAdmin() {
  const existing = await User.findOne({ email: 'admin@example.com' });
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const admin = new User({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'hashedPassword', // The password will be hashed in MongoDB
    role: 'admin'
  });

  await admin.save();
  console.log("✅ Admin created");
  process.exit();
}

createAdmin();