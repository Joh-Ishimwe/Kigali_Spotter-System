
// authMiddleware.js
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Allow admin access
    } else {
        res.status(403).json({ message: 'Admin access required.' });
    }
};

export const requireUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next(); // Allow user access
    } else {
        res.status(403).json({ message: 'User access required.' });
    }
};


const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from request headers
        const token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Fetch user from database using user ID from decoded token
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            throw new Error('User not found');
        }

        // Attach user object to request for further processing
        req.user = user;

        // Call next middleware
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

export default authMiddleware;
