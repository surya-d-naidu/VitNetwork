const User = require('../models/User');

// Block a user
const blockUser = async (req, res) => {
  const { userIdToBlock } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (user.blocked.includes(userIdToBlock)) {
      return res.status(400).json({ error: 'User is already blocked.' });
    }
    user.blocked.push(userIdToBlock);
    await user.save();
    res.status(200).json({ message: 'User blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error blocking user.' });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  const { userIdToUnblock } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const index = user.blocked.indexOf(userIdToUnblock);
    if (index === -1) {
      return res.status(400).json({ error: 'User is not blocked.' });
    }
    user.blocked.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error unblocking user.' });
  }
};

module.exports = {
  blockUser,
  unblockUser,
};