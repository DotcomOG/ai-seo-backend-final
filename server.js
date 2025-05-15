// server.js
// 2025-05-15 11:45:00 ET — Switch to native fetch for reliable redirects

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const OpenAI  = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();
const PORT   = process.env.PORT || 8080;

app.get('/health', (_req, res) => res.send('OK'));

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') return res.status(400).json({ error: 'Only summary mode is supported.' });
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  // Normalize to HTTPS
  let fetchUrl = url.startsWith('http://') ? 'https://' + url.slice(7) : url;

  let rawHtml;
  try {
    const response = await fetch(fetchUrl);
    rawHtml = await response.text();
  } catch (err) {
    return res.status(500).json({ error: 'Fetch error: ' + err.message });
  }

  // Clean and truncate
  const content = String(rawHtml)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);

  // Prompt
  const systemPrompt =
    `You are a senior AI SEO consultant. Analyze the entire site for AI-driven search visibility (Google AI, Bing AI). Return ONLY a JSON with:\n` +
    `score (1–10),\n` +
    `score_explanation,\n` +
    `ai_superpowers (5 items with 3–5 sentence explanations),\n` +
    `ai_opportunities (at least 10 items with 3–5 sentence impact explanations and contact_url),\n` +
    `ai_engine_insights ("Google AI" and "Bing AI" insights).\n` +
    `JSON only.`;

  const userPrompt = `Site URL: ${fetchUrl}\n\nCONTENT (first 10000 chars):\n${content}`;

  let aiText;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    });
    aiText = completion.choices[0].message.content;
  } catch (e) {
    return res.status(500).json({ error: 'AI request failed: ' + e.message });
  }

  try {
    const json = JSON.parse(aiText);
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: 'Invalid JSON from AI', aiText });
  }
});

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
