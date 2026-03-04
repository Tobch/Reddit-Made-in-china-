const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// 1. ADD A COMMENT TO A POST (Protected)
router.post('/post/:postId', auth, async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    const postId = req.params.postId;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = new Comment({
      text,
      author: req.user.id,
      post: postId,
      parentComment: parentCommentId || null // If it's a reply to a comment, this will be populated
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET ALL COMMENTS FOR A POST (Public)
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 }); 
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;