const express = require('express');
const { createNotification, getNotifications, markAsRead } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route to fetch notifications for a user
router.get('/', authMiddleware, getNotifications);

// Route to mark a notification as read
router.post('/markAsRead', authMiddleware, markAsRead);

module.exports = router;