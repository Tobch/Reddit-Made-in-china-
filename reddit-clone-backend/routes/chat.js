const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// GET CHAT HISTORY BETWEEN TWO USERS (Protected)
router.get('/:otherUserId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.otherUserId },
        { sender: req.params.otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }); // Oldest to newest for a chat window

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;