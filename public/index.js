// public/index.js
// Updated: 2025-05-22 23:55 ET

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('analyzerForm');
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const scoreEl = document.getElementById('score');
  const scoreHelpBtn = document.getElementById('scoreHelp');
  const modalOverlay = document.getElementById('scoreModal');
  const closeModalBtn = document.getElementById('closeModal');
  const spContainer = document.getElementById('superpowers');
  const oppContainer = document.getElementById('opportunities');
  const insights = document.getElementById('insights');
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = 'Analyzing...';
      statusEl.className = '';
      resultsEl.style.display = 'none';
      spContainer.innerHTML = '';
      oppContainer.innerHTML = '';
      insights.innerHTML = '';
      scoreEl.textContent = '';

      const inputValue = document.getElementById('url').value.trim();
      const rawUrl = inputValue.startsWith('http://') ? 'https://' + inputValue.slice(7) : inputValue;
      const url = rawUrl;

      try {
        const res = await fetch(`https://ai-seo-backend-final-production-8545.up.railway.app/friendly?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        console.log("🔍 Full backend response:", data);

        if (!res.ok) throw new Error(data.error || res.statusText);

        statusEl.textContent = '';
        scoreEl.textContent = `${data.score}/10`;

        // Strengths
        (data.ai_superpowers || []).slice(0, 5).forEach(p => {
          const div = document.createElement('div');
          div.className = 'item';
          div.innerHTML = `
            <div class="item-header">💡 ${p.title}</div>
            <div class="item-explanation">${p.explanation}</div>
          `;
          spContainer.appendChild(div);
        });
        if (!(data.ai_superpowers && data.ai_superpowers.length)) {
          spContainer.innerHTML = '<div class="item"><div class="item-header">💡 No strengths found.</div></div>';
        }

        // Opportunities
        (data.ai_opportunities || []).slice(0, 25).forEach(o => {
          const div = document.createElement('div');
          div.className = 'item';
          div.innerHTML = `
            <div class="item-header">⚠️ ${o.title}</div>
            <div class="item-explanation">${o.explanation}</div>
          `;
          oppContainer.appendChild(div);
        });
        if (!(data.ai_opportunities && data.ai_opportunities.length)) {
          oppContainer.innerHTML = '<div class="item"><div class="item-header">⚠️ No opportunities found.</div></div>';
        }

        // AI Engine Insights
        ['Perplexity AI', 'Microsoft Bing with Copilot', 'You.com', 'ChatGPT-4 with Browsing', 'Andi'].forEach(engine => {
          const info = (data.ai_engine_insights || {})[engine];
          const div = document.createElement('div');
          div.className = 'item';
          if (info && typeof info === 'object') {
            div.innerHTML = `
              <div class="item-header">🔍 ${engine} (Score: ${info.score}/10)</div>
              <div class="item-explanation">${info.insight}</div>
            `;
          } else {
            div.innerHTML = `
              <div class="item-header">🔍 ${engine}</div>
              <div class="item-explanation">No insight available.</div>
            `;
          }
          insights.appendChild(div);
        });

        resultsEl.style.display = 'block';
      } catch (err) {
        console.error("❌ Fetch error:", err);
        statusEl.textContent = 'Error: ' + err.message;
        statusEl.className = 'error';
      }
    });
  }

  // Modal controls
  if (scoreHelpBtn && modalOverlay) {
    scoreHelpBtn.addEventListener('click', () => modalOverlay.style.display = 'flex');
  }

  if (closeModalBtn && modalOverlay) {
    closeModalBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
  }

  // Contact form
  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactStatus.textContent = 'Thank you! We will be in touch soon. 🙏';
      contactForm.reset();
    });
  }
});