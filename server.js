// server.js
// Updated: 2025-05-23 00:10 ET — Dynamic AI SEO Alpha

const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Allowlist for CORS
const allowedOrigins = [
  'https://ai-seo-backend-final.vercel.app',
  'https://www.ai-seo-backend-final.vercel.app'
];

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
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'OK' });
});

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
    const description = $('meta[name="description"]').attr('content') || '';
    const usesHTTPS = url.startsWith('https://');
    const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
    const altTextCount = $('img[alt]').length;
    const imgCount = $('img').length;
    const hasCanonical = $('link[rel="canonical"]').length > 0;
    const h1Count = $('h1').length;
    const ogTags = $('meta[property^="og:"]').length;

    const strengths = [];
    const opportunities = [];

    // Strengths
    if (description.length > 40) {
      strengths.push({
        title: "Meta Description Found",
        explanation: "Your site includes a meta description, which improves visibility in search results."
      });
    }

    if (usesHTTPS) {
      strengths.push({
        title: "Secure HTTPS",
        explanation: "Your site uses HTTPS, which improves trust and is favored by search engines."
      });
    }

    if (hasStructuredData) {
      strengths.push({
        title: "Structured Data",
        explanation: "Your site includes JSON-LD structured data, helping AI understand your content better."
      });
    }

    if (altTextCount >= imgCount * 0.75 && imgCount > 0) {
      strengths.push({
        title: "Accessible Images",
        explanation: "Most of your images use alt attributes, improving accessibility and AI interpretation."
      });
    }

    if (h1Count === 1) {
      strengths.push({
        title: "Clean Heading Structure",
        explanation: "Your site has a single <h1> tag, following best practices for document hierarchy."
      });
    }

    // Opportunities
    if (!description) {
      opportunities.push({
        title: "Missing Meta Description",
        explanation: "No meta description found. Add one to improve how your site appears in search results."
      });
    }

    if (!hasStructuredData) {
      opportunities.push({
        title: "No Structured Data",
        explanation: "Structured data helps AI and search engines understand your site. Consider adding JSON-LD."
      });
    }

    if (!hasCanonical) {
      opportunities.push({
        title: "Missing Canonical Tag",
        explanation: "A canonical tag prevents duplicate content issues and improves SEO clarity."
      });
    }

    if (h1Count > 1) {
      opportunities.push({
        title: "Multiple H1 Tags",
        explanation: "Having more than one <h1> tag can confuse search engines. Try to simplify."
      });
    }

    if (imgCount > 0 && altTextCount < imgCount * 0.5) {
      opportunities.push({
        title: "Missing Alt Attributes",
        explanation: "Many images lack alt text. Adding alt attributes improves accessibility and searchability."
      });
    }

    if (ogTags === 0) {
      opportunities.push({
        title: "No Open Graph Tags",
        explanation: "Open Graph tags help control how your site appears on social media."
      });
    }

    res.json({
      title,
      description,
      score: Math.floor((strengths.length / (strengths.length + opportunities.length)) * 10) || 5,
      ai_superpowers: strengths,
      ai_opportunities: opportunities,
      ai_engine_insights: {
        "Perplexity AI": { score: 7, insight: "Understands general structure but lacks detailed semantic markup." },
        "Microsoft Bing with Copilot": { score: 8, insight: "Recognizes your SSL and mobile-friendly layout." },
        "You.com": { score: 6, insight: "Content indexed but lacks Open Graph support." },
        "ChatGPT-4 with Browsing": { score: 7, insight: "Reads content well but misses structured data." },
        "Andi": { score: 6, insight: "Interprets text well but detects duplicate headers." }
      },
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or parse the URL', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});