const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// --- NEW IMPORTS FOR CHAT ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// --- WRAP EXPRESS APP IN HTTP SERVER ---
const server = http.createServer(app);

// --- INITIALIZE SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Existing Routes
const authRoutes = require('./routes/auth'); 
const communityRoutes = require('./routes/community'); 
const userRoutes = require('./routes/user');           
const postRoutes = require('./routes/post');       
const commentRoutes = require('./routes/comment');
const newsRoutes = require('./routes/news');

app.use('/api/auth', authRoutes); 
app.use('/api/communities', communityRoutes);          
app.use('/api/users', userRoutes);                     
app.use('/api/posts', postRoutes);                 
app.use('/api/comments', commentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', require('./routes/user'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/search', require('./routes/search'));
app.use('/api/chat', require('./routes/chat'));          

app.get('/', (req, res) => {
  res.send('Reddit Clone API is running!');
});

// --- REAL-TIME CHAT LOGIC ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


// SOCKET.IO LOGIC
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // 1. Global Registration for Notifications
  socket.on('register_user', (userId) => {
    socket.join(userId); // The user joins a private room named after their ID
    console.log(`User ${userId} registered for global notifications`);
  });

  // 2. Chat Room Registration
  socket.on('join_chat', (room) => {
    socket.join(room);
  });

  // 3. Sending Messages
  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const User = require('./models/User'); // Need this to get the sender's username
      
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        text: data.text
      });
      await newMessage.save();

      // Fetch the sender's username so the notification knows who sent it
      const sender = await User.findById(data.senderId);

      // Broadcast to the active chat room (for the Chat.jsx page)
      io.to(data.room).emit('receive_message', newMessage);

      // Broadcast a GLOBAL notification to the receiver's personal room
      io.to(data.receiverId).emit('new_message_notification', {
        senderId: sender._id,
        senderUsername: sender.username,
        text: data.text
      });

    } catch (err) {
      console.error("Socket message error:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(' Successfully connected to MongoDB');
    
    // --- IMPORTANT: CHANGE app.listen TO server.listen ---
  server.listen(PORT, () => console.log(`Server running with WebSockets on port ${PORT}`));
  })
  .catch((error) => {
    console.error(' Error connecting to MongoDB:', error.message);
    process.exit(1); 
  });