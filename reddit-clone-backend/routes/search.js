const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Community = require('../models/Community');

// GET /api/search?q=keyword
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    // If the search bar is empty, return empty arrays
    if (!q) {
      return res.json({ users: [], communities: [] });
    }

    // Create a case-insensitive regular expression for partial matching
    const searchRegex = new RegExp(q, 'i');

    // Search both collections at the same time and limit the results to 5 each
    const users = await User.find({ username: searchRegex })
      .select('username avatar')
      .limit(5);
      
    const communities = await Community.find({ name: searchRegex })
      .select('name')
      .limit(5);

    res.json({ users, communities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;