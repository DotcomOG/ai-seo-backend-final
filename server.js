// server.js
// 2025-05-15 09:25:00 ET — Follow redirects to handle HTTP URLs

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

  // Normalize to HTTPS and follow redirects
  const fetchUrl = url.startsWith('http://') ? 'https://' + url.slice(7) : url;

  try {
    const response = await axios.get(fetchUrl, { maxRedirects: 5 });
    const rawHtml = response.data;
    let content = (rawHtml || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);

    const systemPrompt = 
      `You are a senior AI SEO consultant. Analyze the entire site for visibility in AI-driven search engines like Google AI and Bing AI. Return ONLY a JSON object with:\n` +
      `• score: integer 1–10 rating overall AI SEO readiness\n` +
      `• score_explanation: concise rationale referencing AI-centric factors\n` +
      `• ai_superpowers: EXACTLY 5 strengths { title, explanation } with 3–5 sentence AI-focused rationale\n` +
      `• ai_opportunities: AT LEAST 10 issues { title, explanation, contact_url } with business and AI ranking impact; use contact_url \"https://example.com/contact\"\n` +
      `• ai_engine_insights: object mapping \"Google AI\" and \"Bing AI\" to actionable insights.\n` +
      `Do NOT reference individual pages or generic SEO definitions. JSON only.`;

    const userPrompt = `Site URL: ${fetchUrl}\n\nSITE CONTENT (truncated):\n${content}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ]
    });

    let json;
    try {
      json = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from AI', aiText: completion.choices[0].message.content });
    }
    res.json(json);
  } catch (err) {
    const msg = err.response?.status
      ? `HTTP ${err.response.status}: ${err.response.statusText}`
      : err.message || 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
