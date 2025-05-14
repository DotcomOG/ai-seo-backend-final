// server.js
// 2025-05-14 17:30:00 ET — Site-specific audit with 10k-char context

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
    // Fetch and clean HTML
    const { data: rawHtml } = await axios.get(url);
    let content = rawHtml || '';
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);

    // Build AI prompt
    const systemPrompt =
      'You are an expert SEO auditor. Review this SPECIFIC page’s content and return ONLY a JSON object with:' +
      ' score: integer 1–10,' +
      ' score_explanation: concise reason based on this page,’ +
      ' ai_superpowers: EXACTLY 5 real strengths this page demonstrates, each { title, explanation },' +
      ' ai_opportunities: ≥10 real issues on this page, each { title, explanation, contact_url },' +
      ' ai_engine_insights: object of per-engine actionable insights.' +
      ' Use contact_url "https://example.com/contact". JSON only—no generic definitions.';

    const userPrompt = 
      'URL: ' + url + '\n\n' +
      'CONTENT:\n' + content;

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