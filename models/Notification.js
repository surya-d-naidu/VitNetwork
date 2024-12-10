const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Who triggered the notification
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Who will receive the notification
  content: String,  // The content or message of the notification
  type: { type: String, enum: ['message', 'call', 'comment', 'mention'], required: true },  // Type of notification
  read: { type: Boolean, default: false },  // If the notification has been read
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);