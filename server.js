// server.js
// 2025-05-15 11:30:00 ET — Simplify fetch: try original URL, then fallback to www host if needed

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

// Helper to add www if missing
function addWWW(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.startsWith('www.')) {
      u.hostname = 'www.' + u.hostname;
      return u.toString();
    }
  } catch {}
  return url;
}

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (type !== 'summary') return res.status(400).json({ error: 'Only summary mode is supported.' });
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  // Ensure HTTPS
  let baseUrl = url.startsWith('http://')
    ? 'https://' + url.slice(7)
    : url;
  baseUrl = baseUrl.replace(/\/$/, '');

  let rawHtml;
  const attempts = [baseUrl, addWWW(baseUrl)];
  for (const attempt of attempts) {
    try {
      const resp = await axios.get(attempt, { maxRedirects: 5 });
      rawHtml = resp.data;
      break;
    } catch (e) {
      continue;
    }
  }
  if (!rawHtml) {
    return res.status(500).json({ error: 'Failed to fetch URL after attempts.' });
  }

  // Clean and truncate
  const content = String(rawHtml)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);

  // Updated prompt for detailed explanations
  const systemPrompt =
    `You are a senior AI SEO consultant. Analyze the entire site for AI-driven search engine visibility (Google AI, Bing AI). Return ONLY a JSON object with keys:\n` +
    `• score (1–10)\n` +
    `• score_explanation (concise rationale)\n` +
    `• ai_superpowers (array of 5 strengths; each with title and 3–5 sentence explanation focused solely on AI SEO factors)\n` +
    `• ai_opportunities (array of at least 10 issues; each with title, 3–5 sentence AI SEO–focused explanation, and contact_url)\n` +
    `• ai_engine_insights (object mapping "Google AI" and "Bing AI" to actionable insights)\n` +
    `JSON only, no extra text or markdown.`;

  const userPrompt = `Site URL: ${baseUrl}\n\nCONTENT (truncated):\n${content}`;

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