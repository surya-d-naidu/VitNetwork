const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const { blockUser, unblockUser } = require('../controllers/userController');

// Profile page route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Get user details by ID, excluding password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.render('profile', { user }); // Pass the user data to the EJS template
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Block a user
router.post('/block', authMiddleware, blockUser);

// Unblock a user
router.post('/unblock', authMiddleware, unblockUser);

module.exports = router;