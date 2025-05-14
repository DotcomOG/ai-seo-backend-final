// server.js — Summary-only MVP

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
    return res.status(400).json({ error: 'Only summary mode is supported right now.' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const { data: rawHtml } = await axios.get(url);
    let content = rawHtml || '';
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (content.length > 1000) {
      content = content.slice(0, 1000) + ' ...';
    }

    const systemPrompt = `
You are an AI SEO auditor. Return ONLY a single JSON object with keys:
• score: integer 1–10
• ai_superpowers: array of { title: string, explanation: string }
• ai_opportunities: array of { title: string, explanation: string }
• ai_engine_insights: object mapping engine names to insight strings
JSON only—no extra text or markdown.
`.trim();

    const userPrompt = `Type: "summary"\nURL: ${url}\n\nCONTENT:\n${content}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    });

    const aiText = response.choices[0].message.content;
    let json;
    try {
      json = JSON.parse(aiText);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from AI', aiText });
    }
    res.json(json);

  } catch (err) {
    const msg = err.response?.data?.error || err.message || '';
    return res.status(500).json({ error: msg });
  }
});

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
