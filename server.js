diff --git a//dev/null b/private/server.js
index 0000000..3817f1d 100644
--- a//dev/null
 b/private/server.js
@@ -0,0 1,179 @@
// 2025-05-20 01:00 AM ET
"use strict";

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable Cross-Origin Resource Sharing so the Vercel frontend can access the API
app.use(cors());
app.use(express.json());

/**
 * Utility function to fetch raw HTML from a URL.
 * Normalizes to https:// if no protocol provided.
 */
async function fetchHtml(targetUrl) {
  let url = targetUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://'  url;
  }
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (AI SEO Analyzer)',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    throw new Error(`Unable to fetch URL: ${err.message}`);
  }
}

/**
 * Simple heuristic scoring based on common SEO elements.
 */
function computeScore($) {
  let score = 50; // Start from a neutral score
  if ($('title').text()) score = 10;
  if ($('meta[name="description"]').attr('content')) score = 10;
  if ($('h1').length) score = 10;
  if ($('link[rel="canonical"]').attr('href')) score = 10;
  if ($('script[type="application/ldjson"]').length) score = 10;
  if ($('img[alt]').length === $('img').length && $('img').length > 0) score = 5;
  return Math.min(100, score);
}

/**
 * Create a summary or full report object based on scraped HTML.
 */
function buildReport(html, type) {
  const $ = cheerio.load(html);
  const isFull = type === 'full';

  const score = computeScore($);
  const superpowers = [];
  const opportunities = [];

  // Detect basic features
  const hasH1 = $('h1').length > 0;
  const hasH2 = $('h2').length > 0;
  const hasMetaDesc = $('meta[name="description"]').length > 0;
  const hasCanonical = $('link[rel="canonical"]').length > 0;
  const hasLdJson = $('script[type="application/ldjson"]').length > 0;
  const hasFaq = $('script[type="application/ldjson"]').toArray().some(el => $(el).html().includes('"FAQPage"'));
  const imagesWithoutAlt = $('img').length - $('img[alt]').length;

  if (hasH1) superpowers.push('Clear semantic structure using H1.');
  if (hasH2) superpowers.push('Well organized subsections with H2 headings.');
  if (hasMetaDesc) superpowers.push('Meta description tag present for quick indexing.');
  if (hasCanonical) superpowers.push('Canonical tag helps avoid duplicate content issues.');
  if (hasLdJson) superpowers.push('Structured data detected for rich results.');
  if (imagesWithoutAlt === 0 && $('img').length > 0) superpowers.push('All images have descriptive alt text.');
  if (hasFaq) superpowers.push('FAQ structured data detected.');
  if ($('title').text()) superpowers.push('Title tag found.');
  if ($('meta[property="og:title"]').length) superpowers.push('Open Graph metadata present.');
  if ($('meta[name="robots"]').attr('content')) superpowers.push('Robots meta tag defined.');

  while (superpowers.length < (isFull ? 10 : 5)) {
    superpowers.push('Readable content structure detected.');
  }

  if (!hasFaq) opportunities.push('No FAQ structured data detected, which Bard favors.');
  if (imagesWithoutAlt > 0) opportunities.push(`${imagesWithoutAlt} images missing alt text.`);
  if (!hasMetaDesc) opportunities.push('Missing meta description tag.');
  if (!hasCanonical) opportunities.push('Missing canonical link tag.');
  if (!hasLdJson) opportunities.push('No structured data markup detected.');
  if (!hasH1) opportunities.push('No H1 heading found.');
  if (!hasH2) opportunities.push('No H2 headings found.');
  if (!$('title').text()) opportunities.push('Missing page title.');
  if (!$('meta[property="og:title"]').length) opportunities.push('Open Graph metadata is missing.');
  if (!$('meta[property="og:description"]').length) opportunities.push('Open Graph description is missing.');
  opportunities.push('Consider adding fresh, regularly updated content.');
  opportunities.push('Ensure pages load quickly and are mobile optimized.');
  opportunities.push('Improve internal linking for better crawlability.');
  opportunities.push('Add clear timestamps to blog articles.');
  opportunities.push('Use conversational tone in headings and body text.');

  while (opportunities.length < (isFull ? 25 : 10)) {
    opportunities.push('Review overall content quality for AI search friendliness.');
  }

  const bardDetails = [
    hasFaq ? 'Page includes structured FAQ markup.' : 'Add FAQ structured data to satisfy Bard answer boxes.',
    'Fresh content under 7 days old is prioritized in Bard indexing.',
    'Bard prefers clearly timestamped blog content.'
  ];
  const chatDetails = [
    'Text structured in conversational tone.',
    'Clear question-and-answer formatting detected.',
    'ChatGPT indexes listicles and how-to formats effectively.'
  ];

  if (isFull) {
    bardDetails.push(
      'Use concise, authoritative language for Bard snippets.',
      'Include high-quality outbound links to credible sources.',
      'Optimize images with descriptive file names.',
      'Include geographical hints for local search.',
      'Create short, scannable paragraphs.',
      'Ensure schema.org markup is valid JSON-LD.',
      'Use HTTPS for all internal links.'
    );

    chatDetails.push(
      'Bold key phrases to help ChatGPT summarization.',
      'Provide direct answers near the start of paragraphs.',
      'Break up long sentences for better readability.',
      'Utilize ordered lists for step-by-step instructions.',
      'Include internal anchors for quick navigation.',
      'Keep content free of excessive marketing language.',
      'Ensure the site navigation is easily crawlable.'
    );
  }

  const insights = [
    { engine: 'Bard', details: bardDetails.slice(0, isFull ? 10 : bardDetails.length) },
    { engine: 'ChatGPT', details: chatDetails.slice(0, isFull ? 10 : chatDetails.length) }
  ];

  return {
    generatedAt: new Date().toISOString(),
    score,
    superpowers: superpowers.slice(0, isFull ? 10 : 5),
    opportunities: opportunities.slice(0, isFull ? 25 : 10),
    insights
  };
}

// Main endpoint for friendly reports
app.get('/friendly', async (req, res) => {
  const { url, type = 'summary' } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  if (type !== 'summary' && type !== 'full') {
    return res.status(400).json({ error: "Invalid type parameter. Use 'summary' or 'full'." });
  }

  try {
    const html = await fetchHtml(url);
    const report = buildReport(html, type);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

