const express = require('express');
const router = express.Router();
const { createComment, getCommentsForPost, likeComment, deleteComment, updateComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

// Add comment
// POST /comments/:postId
// Requires authentication
router.post('/:postId', authMiddleware, createComment);

// Get all comments for a post
// GET /comments/:postId
// Public (no authentication required)
router.get('/:postId', getCommentsForPost);

// Like a comment
// POST /comments/:commentId/like
// Requires authentication
router.post('/:commentId/like', authMiddleware, likeComment);

// Delete a comment
// DELETE /comments/:commentId
// Requires authentication
router.delete('/:commentId', authMiddleware, deleteComment);

// Update a comment
// PUT /comments/:commentId
// Requires authentication
router.put('/:commentId', authMiddleware, updateComment);

module.exports = router;
