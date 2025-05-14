// server.js
// 2025-05-14 16:45:00 ET — Site-specific audit prompt

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
  const type = req.query.type;
  const url  = req.query.url;
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
      .slice(0, 1000);

    // Focused AI prompt
    const systemPrompt =
      'You are an SEO auditor. Read the provided page content and produce a JSON with these keys:' +
      ' score: integer 1–10,' +
      ' score_explanation: a concise explanation of that score based solely on this page,' +
      ' ai_superpowers: real strengths this specific page demonstrates as {title, explanation},' +
      ' ai_opportunities: real, concrete issues found on this specific page as {title, explanation, contact_url},' +
      ' ai_engine_insights: per-engine actionable insight strings.' +
      ' Do NOT define generic SEO terms—only reference what you see on the page. ' +
      'contact_url must be "https://example.com/contact" for every opportunity. JSON only.';

    const userPrompt =
      'URL: ' + url + '\\n\\n' +
      'CONTENT:\\n' + content;

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
