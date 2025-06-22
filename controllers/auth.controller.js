import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Register a new user.
 * - Validates required fields and role
 * - Ensures email is unique
 * - Hashes password before saving
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if all required fields are present
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Only allow predefined roles
    if (!["user", "seller"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Save new user with hashed password
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Login user and issue a JWT.
 * - Verifies credentials
 * - Returns token and basic user info on success
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look up user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare input password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Create JWT token valid for 1 day
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Return token and user info
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role.toLowerCase() } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};