const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags, anonymousPost } = req.body;
        const author = req.user._id;

        const newPost = new Post({
            title,
            content,
            tags,
            author,
            anonymousPost,
            likes: 0,
            likedBy: []
        });

        await newPost.save();

        return res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'name email');
        return res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likedBy.includes(userId)) {
            return res.status(400).json({ message: 'You already liked this post' });
        }

        post.likedBy.push(userId);
        post.likes += 1;

        await post.save();

        return res.status(200).json({ message: 'Post liked successfully', post });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, tags, anonymousPost } = req.body;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only edit your own posts' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.anonymousPost = anonymousPost !== undefined ? anonymousPost : post.anonymousPost;
        post.updatedAt = Date.now();

        await post.save();

        return res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await post.remove();

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};