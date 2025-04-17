const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: "https://ai-seo-clean.vercel.app" }));
app.use(express.json());

// ✅ The /friendly route
app.get("/friendly", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // 🧪 Example static output — replace later with real analysis
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
        ChatGPT: "Good structure, but minor accessibility issues.",
        Gemini: "Great metadata, but large JS payload.",
        Copilot: "Efficient layout, weak keyword targeting.",
        Jasper: "Strong CTAs, excellent meta usage."
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🧠 Loaded version: ai-seo-final-${new Date().toISOString()}`);

});