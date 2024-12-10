const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  const { content, recipientId } = req.body;
  const senderId = req.user._id;

  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: recipientId,
      content,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Unable to send message' });
  }
};

// Get message history between two users
const getMessageHistory = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch messages' });
  }
};

module.exports = { sendMessage, getMessageHistory };