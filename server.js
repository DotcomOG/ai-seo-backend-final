// server.js
// 2025-05-15 10:45:00 ET — Final simplified redirect handling

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
  if (type !== 'summary') return res.status(400).json({ error: 'Only summary mode is supported.' });
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  // Ensure HTTPS
  let fetchUrl = url.startsWith('http://')
    ? 'https://' + url.slice(7)
    : url;

  let rawHtml;
  try {
    // Axios follows 301/302/307 by default
    const response = await axios.get(fetchUrl, { maxRedirects: 5 });
    rawHtml = response.data;
  } catch (err) {
    const status = err.response?.status;
    const msg = status
      ? `HTTP ${status}: ${err.response.statusText}`
      : err.message || 'Unknown error';
    return res.status(500).json({ error: msg });
  }

  // Clean and truncate
  const content = String(rawHtml)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);

  const systemPrompt =
    `You are a senior AI SEO consultant. Analyze the entire site for AI-driven search engine visibility (Google AI, Bing AI). Return ONLY a JSON object with keys:\n` +
    `• score (1–10)\n` +
    `• score_explanation\n` +
    `• ai_superpowers (array of exactly 5 {title, explanation})\n` +
    `• ai_opportunities (array of at least 10 {title, explanation, contact_url})\n` +
    `• ai_engine_insights (object mapping "Google AI" and "Bing AI" to insight strings)\n` +
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
    return res.json(json);
  } catch (e) {
    return res.status(500).json({ error: 'Invalid JSON from AI', aiText });
  }
});

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
