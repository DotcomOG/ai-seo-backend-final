// server.js
// 2025-05-14 17:40:00 ET — Force exactly 5 strengths, ≥10 opportunities, and insights

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
      'You are an expert SEO auditor. Review the provided page content and return ONLY a JSON object with exactly these keys:\n' +
      '- score: integer 1–10\n' +
      '- score_explanation: concise reason for the score based on this page\n' +
      '- ai_superpowers: array of EXACTLY 5 distinct strengths this page clearly demonstrates, each an object with title and explanation\n' +
      '- ai_opportunities: array of AT LEAST 10 distinct issues you observe on this page, each with title, explanation, and contact_url\n' +
      '- ai_engine_insights: object mapping at least two major search engines (e.g., Google, Bing) to a concise, actionable insight\n' +
      'Use contact_url "https://example.com/contact" for all AI opportunities. Do NOT list generic SEO definitions—only specific observations from the page content. JSON only.';

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