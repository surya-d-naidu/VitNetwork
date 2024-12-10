const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('../routes/authRoutes');
const postRoutes = require('../routes/postRoutes');
const commentRoutes = require('../routes/commentRoutes');
const errorMiddleware = require('../middleware/errorMiddleware');
const path = require('path');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const userRoutes = require('../routes/userRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/user', userRoutes);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.render('index');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/write-post', (req, res) => {
  res.render('writePost');
});
app.get('/posts', async (req, res) => {
  try {
      const posts = await Post.find().populate('author');
      res.render('posts', { posts });
  } catch (err) {
      res.status(500).send('Error fetching posts');
  }
});
app.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name');  

    if (!post) {
      return res.status(404).send('Post not found');
    }

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'name');  

    res.render('post', { post, comments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching post');
  }
});

app.get('/edit-post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name');  // Populate author information if needed

    if (!post) {
      return res.status(404).send('Post not found');
    }

    res.render('editPost', { post });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching post');
  }
});

app.post('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, tags, anonymousPost } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        tags,
        anonymousPost,
        updatedAt: Date.now(),  // Optionally update the timestamp
      },
      { new: true }  // Return the updated post
    );

    if (!updatedPost) {
      return res.status(404).send('Post not found');
    }

    res.redirect(`/post/${updatedPost._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating post');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
