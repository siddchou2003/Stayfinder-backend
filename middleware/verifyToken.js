import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Middleware: Verifies JWT token and optionally checks for a specific user role.
 * 
 * @param {string|null} requiredRole - Optional role to enforce (e.g. "admin", "seller").
 * @returns {function} Express middleware function
 */
const verifyToken = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // Check if Authorization header exists and follows Bearer format
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or malformed' });
      }

      const token = authHeader.split(' ')[1];

      // Verify token using secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user in DB and exclude password from result
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if route requires a specific role and if user has it
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      }

      // Attach user to request object for access in next middleware/route
      req.user = user;
      next();
    } catch (err) {
      console.error('JWT error:', err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};

/**
 * Middleware: Enforces role-based access.
 * Use this *after* verifyToken has added req.user.
 * 
 * Example: app.get('/admin', verifyToken(), requireRole('admin'), handler);
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

export default verifyToken;