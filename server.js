// server.js
// 2025-05-14 18:20:00 ET — Final site-wide AI SEO audit prompt

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

app.get('/health', (_req, res) => {
  res.send('OK');
});

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') {
    return res.status(400).json({ error: 'Only summary mode is supported.' });
  }
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Fetch homepage HTML for site-wide context
    const { data: rawHtml } = await axios.get(url);
    let content = rawHtml || '';
    content = content
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);

    // AI prompt focuses on site-wide AI SEO
    const systemPrompt =
      `You are a senior AI SEO consultant. Analyze the entire site for visibility in AI-driven search engines like Google AI and Bing AI.` +
      ` Return ONLY a JSON object with the following keys:` +
      `
• score: integer 1–10 rating overall AI SEO readiness` +
      `
• score_explanation: concise rationale referencing AI-centric factors such as semantic clarity, structured data availability, and context depth` +
      `
• ai_superpowers: array of EXACTLY 5 specific strengths the site shows for AI SEO, each an object { title, explanation },` +
      ` with explanation in 3–5 sentences tying directly to how AI models interpret content` +
      `
• ai_opportunities: array of AT LEAST 10 concrete issues hindering AI SEO, each an object { title, explanation, contact_url },` +
      ` with explanation in 3–5 sentences framing business impact and AI ranking consequences; use contact_url "https://example.com/contact"` +
      `
• ai_engine_insights: object mapping "Google AI" and "Bing AI" to concise, actionable bullet-point insights` +
      `
Do not reference individual pages; focus on site-wide observations. JSON only—no markdown or generic SEO definitions.`;

    const userPrompt =
      `Site URL: ${url}

SITE CONTENT (first 10000 chars):
${content}`;

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
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON from AI', aiText });
    }

    res.json(json);
  } catch (err) {
    const msg = err.response?.data?.error || err.message || 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));