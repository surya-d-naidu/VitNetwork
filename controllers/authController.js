const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationString = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      verificationString,
    });

    await newUser.save();

    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationString}`;
    const mailContent = `Please verify your email by clicking on the link: ${verificationUrl}`;

    await sendEmail(email, 'Verify Your Email', mailContent);

    res.status(201).json({ message: 'User registered successfully, please check your email for the verification link' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationString: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.verified = true;
    user.verificationString = undefined;

    await user.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email);
    console.log(password);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, previousPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(previousPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};
