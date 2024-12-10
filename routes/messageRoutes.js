const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();

router.post('/send', messageController.sendMessage);
router.get('/history/:userId', messageController.getMessageHistory);

module.exports = router;