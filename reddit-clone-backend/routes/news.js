const express = require('express');
const router = express.Router();

// GET TRENDING NEWS
router.get('/trending', async (req, res) => {
  // Return mock news with high-quality images
  // (NewsAPI key not available, using fallback)
  res.json({
    success: true,
    articles: [
      {
        title: 'Technology Innovation Summit 2026',
        description: 'Latest advancements in AI and web development reshaping the industry',
        source: 'Tech Daily',
        url: 'https://www.techcrunch.com',
        urlToImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Global Markets Rally on Strong Earnings',
        description: 'Stock markets surge following positive economic data and corporate performance',
        source: 'Business Weekly',
        url: 'https://www.bloomberg.com',
        urlToImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Green Energy Breakthrough Announced',
        description: 'New solar panel technology achieves record efficiency levels',
        source: 'Clean Energy News',
        url: 'https://www.renewable-energy-hub.com',
        urlToImage: 'https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=400&h=225&fit=crop',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Space Exploration Milestones Reached',
        description: 'International collaboration advances lunar mission goals significantly',
        source: 'Space & Science',
        url: 'https://www.nasa.gov',
        urlToImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=225&fit=crop',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Healthcare Tech Transforms Patient Care',
        description: 'AI-powered diagnostics improve medical outcomes and patient satisfaction',
        source: 'Health Innovation',
        url: 'https://www.healthcareitnews.com',
        urlToImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=225&fit=crop',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Cybersecurity Report Reveals New Threats',
        description: 'Industry leaders discuss emerging digital threats and defense strategies',
        source: 'Cyber Security Today',
        url: 'https://www.darkreading.com',
        urlToImage: 'https://images.unsplash.com/photo-1550751827-4bd582f200d0?w=400&h=225&fit=crop',
        publishedAt: new Date().toISOString()
      }
    ]
  });
});

module.exports = router;
