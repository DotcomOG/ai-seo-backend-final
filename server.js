const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 8080;

// Allow your Vercel frontend to call this backend
app.use(cors({
  origin: "https://ai-seo-clean.vercel.app"
}));
app.use(express.json());

// ✅ MAIN /friendly ENDPOINT
app.get("/friendly", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // ✅ Replace this section later with real analysis logic
    return res.json({
      score: 78,
      ai_superpowers: [
        { title: "Meta Tags", explanation: "Well-formed OG tags." },
        { title: "Mobile Optimization", explanation: "Responsive meta present." }
      ],
      ai_opportunities: [
        { title: "Alt Text", explanation: "Some images lack alt attributes." },
        { title: "Page Speed", explanation: "Unminified scripts detected." }
      ],
      ai_engine_insights: {
        ChatGPT: "Good content structure, but some minor accessibility issues.",
        Gemini: "Great metadata, but high JS payload.",
        Copilot: "Efficient layout, but poor keyword targeting.",
        Jasper: "Strong CTAs and meta usage."
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Confirm server is running
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});