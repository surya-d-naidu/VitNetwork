const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

exports.accept = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const acceptingUser = await getUserFromToken(token);
    const { requestingUserId } = req.params;

    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser) return res.status(400).json({ message: 'Account does not exist' });

    acceptingUser.friendList.push(requestingUserId);
    requestingUser.friendList.push(acceptingUser._id);

    const index = acceptingUser.friendRequests.indexOf(requestingUserId);
    if (index !== -1) {
      acceptingUser.friendRequests.splice(index, 1);
    }

    await acceptingUser.save();
    await requestingUser.save();

    return res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const acceptingUser = await getUserFromToken(token); 
    const { requestingUserId } = req.params;

    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser) return res.status(400).json({ message: 'Account does not exist' });

    const index = acceptingUser.friendRequests.indexOf(requestingUserId);
    if (index !== -1) {
      acceptingUser.friendRequests.splice(index, 1);
    }

    await acceptingUser.save();

    return res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const requestingUser = await getUserFromToken(token);
    const { removeUserId } = req.body;

    const removeUser = await User.findById(removeUserId);
    if (!removeUser) return res.status(400).json({ message: 'Account does not exist' });

    const index1 = requestingUser.friendList.indexOf(removeUserId);
    const index2 = removeUser.friendList.indexOf(requestingUser._id);

    if (index1 !== -1) {
      requestingUser.friendList.splice(index1, 1);
    }
    if (index2 !== -1) {
      removeUser.friendList.splice(index2, 1);
    }

    await requestingUser.save();
    await removeUser.save();

    return res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const requestingUser = await getUserFromToken(token);
    const { receivingUserId } = req.body;

    const receivingUser = await User.findById(receivingUserId);
    if (!receivingUser) return res.status(400).json({ message: 'Account does not exist' });

    receivingUser.friendRequests.push(requestingUser._id);

    await receivingUser.save();

    return res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};