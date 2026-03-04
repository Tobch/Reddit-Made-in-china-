const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const auth = require('../middleware/auth');

// 1. CREATE A NEW COMMUNITY (Protected)
// This is the route the script needs to build your 20 communities
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community name already taken' });
    }

    const newCommunity = new Community({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id] // Creator joins automatically
    });

    await newCommunity.save();
    res.status(201).json(newCommunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET ALL COMMUNITIES (Public)
router.get('/', async (req, res) => {
  try {
    const communities = await Community.find().populate('creator', 'username');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. JOIN OR LEAVE A COMMUNITY (Protected)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === req.user.id.toString()
    );

    if (isMember) {
      // Leave community
      community.members = community.members.filter(
        (memberId) => memberId.toString() !== req.user.id.toString()
      );
    } else {
      // Join community
      community.members.push(req.user.id);
    }

    await community.save();
    
    res.json({ 
      message: isMember ? 'Left community' : 'Joined community', 
      community: {
        _id: community._id,
        name: community.name,
        members: community.members
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET A SINGLE COMMUNITY (Public)
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json(community);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;