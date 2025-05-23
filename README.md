# AI SEO Analyzer (Working Alpha)

## Purpose

This project is a working alpha of an AI SEO Analyzer that evaluates how well a website is likely to be indexed, interpreted, and surfaced by AI-powered search engines, such as:
- Google/Bard
- ChatGPT with Browsing
- Bing with Copilot
- You.com
- Andi

It pulls live HTML from any URL and analyzes real SEO signals like meta tags, heading structure, structured data, and alt attributes, returning:
- ✅ **Strengths** (AI superpowers)
- ⚠️ **Opportunities** (SEO gaps)
- 💡 **Engine-specific insights**

---

## What Works Now
- Fully functional backend (`server.js`) using Express, Axios, and Cheerio
- Accepts any valid URL (normalizes input)
- Real-time live HTML scraping
- Dynamically generated strengths and opportunities
- Custom AI engine scoring logic
- Full CORS and preflight support for Vercel
- Vercel-compatible frontend (`index.html`, `index.js`)
- Clean design with clear UX
- Ready for zip upload or Git-based deployment

---

## Enhancements Requested
1. **URL Normalization**
   - Accept user input in any format (`example.com`, `www.example.org`, `.co.il`, etc.)
   - Backend and frontend should auto-format these inputs for analysis
2. **Two-Part Form Flow**
   - Small form at the bottom of `index.html` (Name, Email, Company)
   - On submission, redirect to `full-report.html`, carrying form data
   - `full-report.html` should include a more detailed form (including a message field)
   - Final form should submit to Google Sheets via Apps Script or a secure API
3. **Call to Action + Footer Form**
   - Add a strong CTA (“Want a full audit? Let’s talk.”)
   - Collect detailed lead info in `full-report.html`
   - Data must flow from page to page without loss
4. **AI Engine Signal Validation**
   - Improve backend insight logic to reflect how Bard uses structured data
   - Evaluate how ChatGPT interprets web content for citation
   - Account for how Bing indexes social/meta/structured data for Copilot
   - Possibly use OpenAI to generate smarter scoring summaries

---

## What’s Included
- `server.js` — Live HTML scraper and analyzer
- `public/index.html` — Analyzer UI
- `public/index.js` — Dynamic fetch logic and rendering
- `public/full-report.html` — Placeholder for final report (to be developed)
- `package.json` — Includes dependencies
- `setup.sh` — Optional install script for Codex or cloud container
- `README.md` — This file

---

## Submission Goal

Help me:
- Validate the current integration in a hosted Codex environment
- Add missing form flow and data persistence
- Improve backend logic for Google/Bard/ChatGPT signal alignment
- Make this alpha a public, consultable demo for clients

