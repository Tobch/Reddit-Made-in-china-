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

// --- CORS CONFIGURATION ---
// Combined into one clear block
app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// --- INITIALIZE SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// --- ROUTES ---
const authRoutes = require('./routes/auth'); 
const communityRoutes = require('./routes/community'); 
const userRoutes = require('./routes/user');           
const postRoutes = require('./routes/post');       
const commentRoutes = require('./routes/comment');
const newsRoutes = require('./routes/news');
const searchRoutes = require('./routes/search');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes); 
app.use('/api/communities', communityRoutes);          
app.use('/api/users', userRoutes);                      
app.use('/api/posts', postRoutes);                  
app.use('/api/comments', commentRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);          

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Reddit Clone API is running!');
});

// --- REAL-TIME CHAT LOGIC ---
const PORT = process.env.PORT || 5000;

// SOCKET.IO LOGIC
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  socket.on('register_user', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} registered for global notifications`);
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
  });

  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const User = require('./models/User'); 
      
      const newMessage = new Message({
        sender: data.senderId,
        receiver: data.receiverId,
        text: data.text
      });
      await newMessage.save();

      const sender = await User.findById(data.senderId);

      io.to(data.room).emit('receive_message', newMessage);

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

// --- ENHANCED MONGOOSE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 10000,        // Initial connection timeout
  socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    // IMPORTANT: Listen using the 'server' (http), not 'app' (express)
    server.listen(PORT, () => {
      console.log(`🚀 Server running with WebSockets on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); 
  });