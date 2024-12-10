const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;  // Attach user info to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
