// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();  // reads OPENAI_API_KEY from .env

const PORT = process.env.PORT || 8080;

app.get('/health', (_req, res) => {
  res.send('OK');
});

app.get('/friendly', async (req, res) => {
  const { type, url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });
  if (!['summary', 'full'].includes(type)) {
    return res.status(400).json({ error: 'Type must be summary or full' });
  }
  try {
    const page = await axios.get(url);
    const html = page.data;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI SEO analyzer. Respond with a single valid JSON object.' },
        { role: 'user',   content: `Analysis type: "${type}".\n\nHere is the HTML:\n\n${html}` }
      ],
      temperature: 0.2
    });

    const aiResponse = completion.choices[0].message.content;
    let json;
    try {
      json = JSON.parse(aiResponse);
    } catch (err) {
      return res.status(500).json({ error: 'Invalid JSON from AI', aiResponse });
    }
    res.json(json);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
