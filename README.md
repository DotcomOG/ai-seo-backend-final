# AI SEO Analyzer – Working Alpha Deployment

## Project Purpose
This project is an AI SEO Analyzer that evaluates how well a website might perform in AI-driven search engines such as Google Search with Bard, ChatGPT with browsing, Bing with Copilot, You.com, and Andi. It analyzes a live page's HTML to produce:

- An overall SEO readiness score (1–10)
- Key strengths ("superpowers")
- SEO opportunities
- Engine-specific insights about how each AI platform may interpret the site

The tool consists of a front‑end form and a Node.js/Express backend that fetches real-time HTML for analysis using Axios and Cheerio.

## Current Status
- **index.html** – User input form that fetches `/friendly?url=...`
- **index.js** – Frontend logic for results display
- **full-report.html** – Placeholder for a detailed report view
- **server.js** – Functional backend that validates URLs, extracts meta data, and returns strengths and opportunities

The backend handles CORS for deployment on platforms like Vercel.

## Requested Enhancements
1. **Accept All Valid URL Formats** – Normalize URLs such as `example.com`, `www.example.com`, `http://example.com`, etc.
2. **Funnel Flow + Form Fields** – Small form on `index.html` leading to `full-report.html`, passing user data and submitting a longer form to Google Sheets.
3. **AI Search Engine Alignment** – Improve per‑engine scoring and show how Bard, ChatGPT, Bing, and others evaluate content. Potential use of OpenAI for insights.

The goal is a smooth end‑to‑end experience in a hosted environment (Vercel + Railway) with reliable data flow and scoring.
