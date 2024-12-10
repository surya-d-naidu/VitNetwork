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
const http = require('http');
const socketIo = require('socket.io');
const User = require('../models/User');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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

// Views routes
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

// Posts and comments routes
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
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const comments = await Comment.find({ post: post._id }).populate('author', 'name');
    res.render('post', { post, comments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching post');
  }
});

app.get('/edit-post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
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
        updatedAt: Date.now(),
      },
      { new: true }
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

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle chat messages
  socket.on('chatMessage', async (message, recipientId) => {
    const senderId = socket.user._id;  // Assuming socket.user._id holds the current user ID

    // Check if either user has blocked the other
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (sender.blocked.includes(recipientId)) {
      return socket.emit('error', 'You have blocked this user and cannot send messages.');
    }

    if (recipient.blocked.includes(senderId)) {
      return socket.emit('error', 'This user has blocked you and cannot receive your messages.');
    }

    // Proceed with sending the message if not blocked
    io.to(recipientId).emit('chatMessage', message, senderId);
  });

  // Handle video call offer
  socket.on('videoCallOffer', async (offer, recipientId) => {
    const senderId = socket.user._id;  // Sender's user ID from the socket

    // Check if the sender and recipient are friends
    const sender = await User.findById(senderId);
    if (!sender.friendList.includes(recipientId)) {
      return socket.emit('error', 'You can only call people who are in your friend list');
    }

    // Check if either user has blocked the other
    const recipient = await User.findById(recipientId);
    if (sender.blocked.includes(recipientId)) {
      return socket.emit('error', 'You have blocked this user and cannot initiate a call.');
    }

    if (recipient.blocked.includes(senderId)) {
      return socket.emit('error', 'This user has blocked you and cannot receive your call.');
    }

    // Proceed with sending the video call offer if they are friends and not blocked
    io.to(recipientId).emit('videoCallOffer', offer, senderId);
  });

  // Handle video call answer
  socket.on('videoCallAnswer', (answer, recipientId) => {
    io.to(recipientId).emit('videoCallAnswer', answer);
  });

  // Handle ICE candidate
  socket.on('iceCandidate', (candidate, recipientId) => {
    io.to(recipientId).emit('iceCandidate', candidate);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
