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
  const { type = 'summary', url } = req.query;
  if (!['summary', 'full'].includes(type)) {
    return res.status(400).json({ error: "Invalid type parameter. Use 'summary' or 'full'." });
  }
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
    `You are a senior AI SEO consultant. Analyze the entire site for AI-driven search engine visibility in the following AI search platforms: Perplexity AI, Microsoft Bing with Copilot, You.com, ChatGPT-4 with Browsing, and Andi. Return ONLY a JSON object with these keys:
` +
    `• score (1–10 integer), representing overall AI SEO readiness for the site.
` +
    `• score_explanation (concise rationale).
` +
    `• ai_superpowers: array of exactly 5 items (strengths), each with keys 'title' and 'explanation'. Each 'explanation' must be 3–5 sentences focusing solely on AI SEO factors (semantic clarity, structured data, content architecture, AI indexing relevance).
` +
    `• ai_opportunities: array of at least 10 items (issues), each with keys 'title', 'explanation', and 'contact_url'. Each 'explanation' must be 3–5 sentences describing specific AI SEO improvements needed, business impact, and why AI engines would benefit. Use 'contact_url' = "https://example.com/contact".
` +
    `• ai_engine_insights: object with exactly five properties: 'Perplexity AI', 'Microsoft Bing with Copilot', 'You.com', 'ChatGPT-4 with Browsing', 'Andi'. Each property's value must be an object with:
` +
    `    - score: integer 1–10 rating the site's readiness on that platform.
` +
    `    - insight: 2–3 sentence actionable recommendation focused on AI SEO optimizations for that specific platform.
` +
    `Do NOT use any other key names or formats. JSON only, no markdown or extra text.`;

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
