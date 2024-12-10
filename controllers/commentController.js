const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

exports.createComment = async (req, res) => {
  try {
    const { text, postId, parentComment } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      text,
      post: postId,
      author: userId,
      parentComment: parentComment || null,  
    });

    await newComment.save();

    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId, text } = req.body;
    const { userId } = req.user;  

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await comment.remove();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.likedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already liked this comment' });
    }

    comment.likedBy.push(userId);
    comment.likes += 1;

    await comment.save();

    res.status(200).json({ message: 'Comment liked successfully', comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.likedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have not liked this comment' });
    }

    comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
    comment.likes -= 1;

    await comment.save();

    res.status(200).json({ message: 'Comment unliked successfully', comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name username') 
      .populate('parentComment', 'text') 
      .sort({ createdAt: -1 }); 

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('author', 'name username')
      .populate('parentComment', 'text');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({ comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};
