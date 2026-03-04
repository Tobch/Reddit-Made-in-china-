const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importing our User model

const router = express.Router();

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate the JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Send the token and user info back to the frontend
    res.json({
      token,
      user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 3. SEED MULTIPLE USERS (Protected)
router.post('/seed', async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ message: "Invalid data: 'users' must be an array." });
    }

    const createdUsers = [];

    for (let userData of users) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (existingUser) continue;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        avatar: userData.avatar || ''
      });

      await newUser.save();
      createdUsers.push({ username: newUser.username, email: newUser.email });
    }

    res.status(201).json({
      message: `Successfully seeded ${createdUsers.length} users`,
      users: createdUsers
    });
  } catch (error) {
    console.error("Seed Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;