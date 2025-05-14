// public/index.js
// 2025-05-14 16:10:00 ET — Summary-only flow

document.addEventListener('DOMContentLoaded', function(){
  const form      = document.getElementById('analyzerForm');
  const statusEl  = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const scoreEl   = document.getElementById('score');
  const spList    = document.getElementById('superpowers');
  const oppList   = document.getElementById('opportunities');
  const insights  = document.getElementById('insights');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUrl = document.getElementById('url').value.trim();
    const url    = rawUrl.startsWith('http://')
      ? 'https://' + rawUrl.slice(7)
      : rawUrl;

    statusEl.textContent    = 'Analyzing...';
    statusEl.className      = 'loader';
    resultsEl.style.display = 'none';
    spList.innerHTML        = '';
    oppList.innerHTML       = '';
    insights.innerHTML      = '';
    scoreEl.textContent     = '';

    try {
      const res = await fetch('/friendly?type=summary&url=' + encodeURIComponent(url));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);

      statusEl.textContent = '';
      scoreEl.textContent  = data.score ?? 'N/A';

      if (Array.isArray(data.ai_superpowers) && data.ai_superpowers.length) {
        data.ai_superpowers.forEach(p => {
          const li = document.createElement('li');
          li.className = 'list-item';
          li.innerHTML = `<strong>${p.title}</strong>: ${p.explanation}`;
          spList.appendChild(li);
        });
      } else {
        spList.innerHTML = '<li>No AI Superpowers found.</li>';
      }

      if (Array.isArray(data.ai_opportunities) && data.ai_opportunities.length) {
        data.ai_opportunities.forEach(o => {
          const li = document.createElement('li');
          li.className = 'list-item';
          li.innerHTML = `<strong>${o.title}</strong>: ${o.explanation}`;
          oppList.appendChild(li);
        });
      } else {
        oppList.innerHTML = '<li>No AI Opportunities found.</li>';
      }

      if (data.ai_engine_insights && typeof data.ai_engine_insights === 'object') {
        Object.entries(data.ai_engine_insights).forEach(([engine, text]) => {
          const div = document.createElement('div');
          div.innerHTML = `<h3>${engine}</h3><p>${text}</p>`;
          insights.appendChild(div);
        });
      } else {
        insights.innerHTML = '<p>No AI Engine Insights found.</p>';
      }

      resultsEl.style.display = 'block';
    } catch (err) {
      statusEl.textContent = 'Error: ' + err.message;
      statusEl.className   = 'error';
    }
  });
});
