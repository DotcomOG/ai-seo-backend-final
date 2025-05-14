// server.js
// 2025-05-14 17:55:00 ET — Site-wide AI SEO scan prompt (no page references)

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');
const OpenAI  = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();
const PORT   = process.env.PORT || 8080;

app.get('/health', (_req, res) => res.send('OK'));

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Only summary mode is supported.' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Fetch and clean site homepage HTML for context
    const { data: rawHtml } = await axios.get(url);
    let content = rawHtml || '';
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);

    const systemPrompt =
      'You are an expert AI SEO auditor. Your goal is to help organizations maximize their visibility across AI-driven search engines by performing a site-wide audit (not just a single page).' +
      ' Return ONLY a JSON object with:' +
      '\n• score: integer 1–10 rating the overall site for AI SEO visibility' +
      '\n• score_explanation: concise reason for that score based on site-wide observations (e.g., structured data, content breadth, navigation)' +
      '\n• ai_superpowers: array of EXACTLY 5 real strengths the site demonstrates for AI SEO, each as { title, explanation }' +
      '\n• ai_opportunities: array of AT LEAST 10 concrete issues across the site that hinder AI search visibility, each as { title, explanation, contact_url }' +
      '\n• ai_engine_insights: object mapping major AI search engines (e.g., "Google AI", "Bing AI") to concise, actionable insights.' +
      ' Use contact_url "https://example.com/contact" for all opportunities. Do NOT include any references to individual pages—speak only about the site.' +
      ' JSON only—no generic SEO definitions.';

    const userPrompt =
      'Site URL: ' + url + '\n\n' +
      'SITE CONTENT (first 10000 chars):\n' + content;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    });

    const aiText = completion.choices[0].message.content;
    let json;
    try {
      json = JSON.parse(aiText);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from AI', aiText });
    }
    res.json(json);

  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

app.use(express.static('public'));
app.listen(PORT, () => console.log('Server running on port ' + PORT));