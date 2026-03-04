const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Community = require('../models/Community');
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// 1. CREATE A POST (Protected & Member-Only with file uploads)
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { title, content, communityId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // MEMBERSHIP CHECK
    const isMember = community.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ 
        message: 'You must join this community before you can post.' 
      });
    }

    // Process uploaded files
    const media = (req.files || []).map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `/uploads/${file.filename}`
    }));

    const newPost = new Post({
      title,
      content: content || '',
      community: communityId,
      author: req.user.id,
      media
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET FEED / ALL POSTS (Public)
router.get('/', async (req, res) => {
  try {
    // Populate author and community details so the frontend has names, not just IDs
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .populate('community', 'name')
      .sort({ createdAt: -1 }); // Newest first
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET POSTS FOR A SPECIFIC COMMUNITY (Public)
router.get('/community/:communityId', async (req, res) => {
  try {
    const posts = await Post.find({ community: req.params.communityId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET POSTS BY USERNAME (Public)
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const posts = await Post.find({ author: user._id })
      .populate('author', 'username avatar')
      .populate('community', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET A SINGLE POST BY ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'community',
        populate: {
          path: 'members',
          select: '_id'
        }
      });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. UPVOTE / DOWNVOTE A POST (Protected & Atomic)
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { value } = req.body; // 1, -1, or 0
    const userId = req.user.id;
    const postId = req.params.id;

    let update = {};

    if (value === 1) {
      // UPVOTE: Add to upvotes, remove from downvotes
      update = {
        $addToSet: { upvotes: userId },
        $pull: { downvotes: userId }
      };
    } else if (value === -1) {
      // DOWNVOTE: Add to downvotes, remove from upvotes
      update = {
        $addToSet: { downvotes: userId },
        $pull: { upvotes: userId }
      };
    } else {
      // UNVOTE (value === 0): Remove from both
      update = {
        $pull: { upvotes: userId, downvotes: userId }
      };
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      update,
      { new: true } // Return the updated document
    )
      .populate('author', 'username avatar')
      .populate('community', 'name');

    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

    // Send back upvotes and downvotes arrays explicitly
    res.json({
      ...updatedPost.toObject(),
      upvotes: updatedPost.upvotes,
      downvotes: updatedPost.downvotes
    });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. SUMMARIZE A POST USING AI (Protected or Public, let's make it Protected to prevent spam)
router.get('/:id/summarize', auth, async (req, res) => {
  try {
    // 1. Fetch the post from the database
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 2. Initialize the AI model with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Create the prompt for the AI
    const prompt = `Please provide a short, concise summary of the following Reddit post. 
    Title: ${post.title}
    Content: ${post.content}`;

    // 4. Send the prompt to the AI and wait for the response
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // 5. Send the summary back to the user
    res.json({ 
      originalId: post._id,
      summary: summary 
    });

  } catch (error) {
    console.error("AI Summarization Error:", error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});


// 7. EDIT A POST (Protected & Author-Only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Security Check: Ensure the logged-in user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // Update the fields
    post.title = title || post.title;
    post.content = content || post.content;
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. DELETE A POST (Protected & Author-Only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Security Check: Ensure the logged-in user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the post
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
