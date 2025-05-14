// server.js
// 2025-05-14 18:20:00 ET — Corrected syntax; site-wide AI SEO audit

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

    const systemPrompt = `You are a senior AI SEO consultant. Analyze the entire site content for its visibility in AI-driven search engines like Google AI and Bing AI. Return ONLY a JSON object with:\n\n` +
      `score: integer 1–10 rating overall AI SEO visibility,\n` +
      `score_explanation: concise rationale referencing AI-centric factors (semantic clarity, structured data, context depth),\n` +
      `ai_superpowers: array of EXACTLY 5 specific strengths the site demonstrates for AI SEO, each {title, explanation}, where explanation is 3–5 sentences tying to AI search evaluation criteria,\n` +
      `ai_opportunities: array of AT LEAST 10 concrete issues across the site that hinder AI search visibility, each {title, explanation, contact_url} with 3–5 sentence business impact and AI ranking consequences,\n` +
      `ai_engine_insights: object mapping major AI search engines (e.g., 'Google AI', 'Bing AI') to actionable insights.\n\n` +
      `Use contact_url "https://example.com/contact" for each opportunity. Do NOT include generic SEO definitions—only specific observations. JSON only.`;

    const userPrompt = `Site URL: ${url}\n\nSITE CONTENT (first 10000 chars):\n${content}`;

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