const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  tags: {
    type: [String]
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  likes: {
    type: Number,
    required: true,
    likedBy: [mongoose.Schema.Types.ObjectId]
  },
  anonymousPost: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
