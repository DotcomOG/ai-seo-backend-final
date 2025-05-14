// public/index.js
// 2025-05-14 17:00:00 ET — Correct fallback labels for strengths

document.addEventListener('DOMContentLoaded', function() {
  const form      = document.getElementById('analyzerForm');
  const statusEl  = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const scoreEl   = document.getElementById('score');
  const scoreExpEl= document.getElementById('scoreExplanation');
  const spList    = document.getElementById('superpowers');
  const oppList   = document.getElementById('opportunities');
  const insights  = document.getElementById('insights');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const rawUrl = document.getElementById('url').value.trim();
    const url    = rawUrl.startsWith('http://') ? 'https://'+rawUrl.slice(7) : rawUrl;

    statusEl.textContent    = 'Analyzing...';
    statusEl.className      = 'loader';
    resultsEl.style.display = 'none';
    scoreEl.textContent     = '';
    scoreExpEl.textContent  = '';
    spList.innerHTML        = '';
    oppList.innerHTML       = '';
    insights.innerHTML      = '';

    try {
      const res = await fetch('/friendly?type=summary&url='+encodeURIComponent(url));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||res.statusText);

      statusEl.textContent    = '';
      scoreEl.textContent     = (data.score ?? 'N/A') + '/10';
      scoreExpEl.textContent  = data.score_explanation ?? '';

      if (Array.isArray(data.ai_superpowers) && data.ai_superpowers.length) {
        data.ai_superpowers.forEach(p => {
          const li = document.createElement('li');
          li.className = 'list-item';
          li.innerHTML = `<strong>${p.title}</strong>: ${p.explanation}`;
          spList.appendChild(li);
        });
      } else {
        spList.innerHTML = '<li>No strengths found.</li>';
      }

      if (Array.isArray(data.ai_opportunities) && data.ai_opportunities.length) {
        data.ai_opportunities.forEach(o => {
          const li = document.createElement('li');
          li.className = 'list-item';
          li.innerHTML = `<strong>${o.title}</strong>: ${o.explanation}`;
          oppList.appendChild(li);
        });
      } else {
        oppList.innerHTML = '<li>No opportunities found.</li>';
      }

      // Engine insights
      insights.innerHTML = '';
      if (data.ai_engine_insights && Object.keys(data.ai_engine_insights).length) {
        Object.entries(data.ai_engine_insights).forEach(([eng, txt]) => {
          const div = document.createElement('div');
          div.innerHTML = `<h3>${eng}</h3><p>${txt}</p>`;
          insights.appendChild(div);
        });
      } else {
        insights.innerHTML = '<p>No insights available.</p>';
      }

      resultsEl.style.display = 'block';
    } catch (err) {
      statusEl.textContent = 'Error: '+err.message;
      statusEl.className   = 'error';
    }
  });
});
