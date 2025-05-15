// server.js
// 2025-05-15 11:00:00 ET — Enhance bullet detail: 3-5 sentence AI SEO–focused explanations

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
  let fetchUrl = url;
  // normalize host: add www if missing (e.g., adl.org → www.adl.org)
  try {
    const parsed = new URL(fetchUrl);
    if (!parsed.hostname.startsWith('www.')) {
      parsed.hostname = 'www.' + parsed.hostname;
      fetchUrl = parsed.toString();
    }
  } catch {}
  if (fetchUrl.startsWith('http://')) {
    fetchUrl = 'https://' + fetchUrl.slice(7);
  }

  let rawHtml;
  try {
    const response = await axios.get(fetchUrl, { maxRedirects: 5 });
    rawHtml = response.data;
  } catch (err) {
    const status = err.response?.status;
    const msg = status
      ? `HTTP ${status}: ${err.response.statusText}`
      : err.message || 'Unknown error';
    return res.status(500).json({ error: msg });
  }

  const content = String(rawHtml)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);

  const systemPrompt =
    `You are a senior AI SEO consultant. Analyze the entire site for visibility in AI-driven search engines (Google AI, Bing AI). Return ONLY a JSON object with these keys:\n` +
    `• score (1–10 integer)\n` +
    `• score_explanation (concise rationale)\n` +
    `• ai_superpowers: array of exactly 5 strengths. For each, provide a title and a detailed explanation **of 3–5 sentences**, focusing solely on AI SEO factors (e.g., semantic clarity, structured data, content architecture).\n` +
    `• ai_opportunities: array of at least 10 issues. For each, provide a title and a detailed explanation **of 3–5 sentences**, focusing solely on AI SEO improvements needed and include contact_url \"https://example.com/contact\".\n` +
    `• ai_engine_insights: object mapping \"Google AI\" and \"Bing AI\" to actionable insights.\n` +
    `Do NOT reference individual pages or generic SEO definitions. This must be site-wide, AI-centric, and JSON only.`;

  const userPrompt = `Site URL: ${fetchUrl}\n\nCONTENT (truncated to 10000 chars):\n${content}`;

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