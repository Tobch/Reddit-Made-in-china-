const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');

// Ensure the 'uploads' directory exists so Multer doesn't crash
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Configure how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// 1. GET CURRENT USER PROFILE (Protected)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. VIEW ANOTHER USER's PROFILE (Public)
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. UPDATE CURRENT USER PROFILE (Protected & Handles Image)
router.put('/profile', [auth, upload.single('avatar')], async (req, res) => {
  try {
    // Grab the text fields
    const updateData = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;

    // If Multer successfully processed an image, add the path to our update object
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;