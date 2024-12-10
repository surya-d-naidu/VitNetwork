const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, likePost, updatePost, deletePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// New posts
// POST /posts
// Requires authentication
router.post('/', authMiddleware, createPost);

// Get all posts
// GET /posts
// Public access
router.get('/', getAllPosts);

// Like post
// POST /posts/:postId/like
// Requires authentication
router.post('/:postId/like', authMiddleware, likePost);

// Update post
// PUT /posts/:postId
// Requires authentication
router.put('/:postId', authMiddleware, updatePost);

// Delete post
// DELETE /posts/:postId
// Requires authentication
router.delete('/:postId', authMiddleware, deletePost);

module.exports = router;