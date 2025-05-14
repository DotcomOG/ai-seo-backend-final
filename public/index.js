// public/index.js — broken-out items, no bullets, with emojis

document.addEventListener('DOMContentLoaded', function() {
  const form           = document.getElementById('analyzerForm');
  const statusEl       = document.getElementById('status');
  const resultsEl      = document.getElementById('results');
  const scoreEl        = document.getElementById('score');
  const scoreHelpBtn   = document.getElementById('scoreHelp');
  const modalOverlay   = document.getElementById('scoreModalOverlay');
  const closeModalBtn  = document.getElementById('closeModal');
  const scoreExpEl     = document.getElementById('scoreExplanation');
  const spContainer    = document.getElementById('superpowers');
  const oppContainer   = document.getElementById('opportunities');
  const insights       = document.getElementById('insights');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const rawUrl = document.getElementById('url').value.trim();
    const url    = rawUrl.startsWith('http://') ? 'https://' + rawUrl.slice(7) : rawUrl;

    // Reset
    statusEl.textContent    = 'Analyzing...';
    statusEl.className      = '';
    resultsEl.style.display = 'none';
    spContainer.innerHTML   = '';
    oppContainer.innerHTML  = '';
    insights.innerHTML      = '';
    scoreEl.textContent     = '';
    scoreExpEl.textContent  = '';

    try {
      const res  = await fetch('/friendly?type=summary&url=' + encodeURIComponent(url));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);

      // Score
      statusEl.textContent  = '';
      scoreEl.textContent   = (data.score ?? 'N/A') + '/10';
      scoreExpEl.textContent= data.score_explanation || 'No explanation provided.';

      // Strengths
      (data.ai_superpowers || []).slice(0,5).forEach(p => {
        const wrap = document.createElement('div');
        wrap.className = 'item';
        wrap.innerHTML = `
          <div class="item-header">💡 ${p.title}</div>
          <div class="item-explanation">${p.explanation}</div>
        `;
        spContainer.appendChild(wrap);
      });
      if (!data.ai_superpowers || !data.ai_superpowers.length) {
        spContainer.innerHTML = '<div class="item"><div class="item-header">💡 No strengths found.</div></div>';
      }

      // Opportunities
      (data.ai_opportunities || []).slice(0,10).forEach(o => {
        const wrap = document.createElement('div');
        wrap.className = 'item';
        wrap.innerHTML = `
          <div class="item-header">⚠️ ${o.title}</div>
          <div class="item-explanation">${o.explanation}</div>
        `;
        oppContainer.appendChild(wrap);
      });
      if (!data.ai_opportunities || !data.ai_opportunities.length) {
        oppContainer.innerHTML = '<div class="item"><div class="item-header">⚠️ No opportunities found.</div></div>';
      }

      // Insights
      insights.innerHTML = '';
      Object.entries(data.ai_engine_insights || {}).forEach(([engine, text]) => {
        const wrap = document.createElement('div');
        wrap.className = 'item';
        wrap.innerHTML = `
          <div class="item-header">🔍 ${engine}</div>
          <div class="item-explanation">${text}</div>
        `;
        insights.appendChild(wrap);
      });
      if (!Object.keys(data.ai_engine_insights || {}).length) {
        insights.innerHTML = '<div class="item"><div class="item-header">🔍 No insights available.</div></div>';
      }

      resultsEl.style.display = 'block';
    } catch (err) {
      statusEl.textContent = 'Error: ' + err.message;
      statusEl.className   = 'error';
    }
  });

  // Lightbox
  scoreHelpBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
  });
  closeModalBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });
});
