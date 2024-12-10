const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}\.in$/.test(v);
      },
      message: props => `${props.value} is not a valid email! It should follow the format <name>.<registration_number>@vitapstudent.ac.in.`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  bio: {
    type: String,
    default: '',
  },
  profilePic: {
    type: String,
    default: 'https://w7.pngwing.com/pngs/123/735/png-transparent-human-icon-illustration-computer-icons-physician-login-medicine-user-avatar-miscellaneous-logo-silhouette-thumbnail.png'
  },
  pronouns: {
    type: String,
    enum: ['he/him', 'she/her', 'other'],
    default: 'other',
  },
  blocked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  friendList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  interestedInTopics: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(topic => typeof topic === 'string' && topic.trim().length > 0);
      },
      message: props => 'Each interested topic must be a non-empty string.',
    },
  },
  relationshipStatus: {
    type: String,
    enum: ['single', 'committed'],
    default: 'single',
  },
  private: {
    type: Boolean,
    default: false,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true
  },
  verificationString: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
