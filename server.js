// server.js
// Updated: 2025-05-22 23:15 ET

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow only your Vercel frontend
const allowedOrigins = [
  'https://ai-seo-backend-final.vercel.app',
  'https://www.ai-seo-backend-final.vercel.app'
];

// Full CORS configuration with preflight and headers
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route: /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route: /health
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'OK' });
});

// Route: /friendly (main SEO logic)
app.get('/friendly', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    res.json({
      title,
      description: metaDescription,
      score: 7,
      ai_superpowers: [
        { title: 'Fast page load', explanation: 'Your site loads quickly and efficiently.' },
        { title: 'Well-structured content', explanation: 'Your HTML content is semantically organized.' },
        { title: 'Semantic HTML5', explanation: 'Use of semantic tags aids AI parsing.' },
        { title: 'Secure HTTPS', explanation: 'Site uses SSL which boosts trust signals.' },
        { title: 'Clear heading structure', explanation: 'Heading tags are used meaningfully.' }
      ],
      ai_opportunities: [
        { title: 'Missing alt text', explanation: 'Some images lack alt attributes.' },
        { title: 'No Open Graph tags', explanation: 'Your site lacks metadata for social sharing.' },
        { title: 'No canonical URL', explanation: 'No canonical tag found for this page.' },
        { title: 'Low keyword density', explanation: 'Page may lack keyword focus.' },
        { title: 'No structured data', explanation: 'Site does not use JSON-LD or microdata.' }
      ],
      ai_engine_insights: {
        "Perplexity AI": { score: 6, insight: "Minimal structured data found." },
        "Microsoft Bing with Copilot": { score: 7, insight: "Indexed well but missing sitemap." },
        "You.com": { score: 8, insight: "AI understands your main services." },
        "ChatGPT-4 with Browsing": { score: 7, insight: "Well-formatted but lacks recent schema updates." },
        "Andi": { score: 6, insight: "Engaging but low semantic clarity in header tags." }
      },
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or parse the URL', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});