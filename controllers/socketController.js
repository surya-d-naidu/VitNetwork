const Message = require('../models/Message');
const User = require('../models/User');

const handleChatMessage = async (socket, message, recipient) => {
  const senderId = socket.user._id;
  const recipientUser = await User.findOne({ username: recipient });

  if (recipientUser) {
    const newMessage = new Message({
      sender: senderId,
      receiver: recipientUser._id,
      content: message,
    });

    await newMessage.save();

    socket.emit('chatMessage', message, recipient); // Send back to the sender
    socket.to(recipientUser.socketId).emit('chatMessage', message, senderId); // Send to recipient
  } else {
    socket.emit('error', 'Recipient not found');
  }
};

module.exports = {
  handleChatMessage,
};
