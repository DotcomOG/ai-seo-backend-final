// public/full-report.js
// 2025-05-01 15:45:00 ET (patched)

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const spList   = document.getElementById('superpowers');
  const oppList  = document.getElementById('opportunities');
  const insightsContainer = document.getElementById('insights-container');
  const urlParams = new URLSearchParams(window.location.search);
  const url       = urlParams.get('url');

  if (!url) {
    statusEl.textContent = 'Error: Missing URL parameter.';
    statusEl.classList.add('error');
    return;
  }

  statusEl.textContent = 'Analyzing full report…';

  try {
    const res = await fetch(`/friendly?type=full&url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }
    const data = await res.json();

    // Overall Score
    document.getElementById('score').textContent = data.score ?? 'N/A';

    // AI Superpowers
    spList.innerHTML = '';
    if (Array.isArray(data.ai_superpowers) && data.ai_superpowers.length) {
      data.ai_superpowers.forEach(p => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `<strong>${p.title}</strong>: ${p.explanation}`;
        spList.append(li);
      });
    } else {
      spList.innerHTML = '<li>No “AI Superpowers” returned.</li>';
    }

    // AI Opportunities
    oppList.innerHTML = '';
    if (Array.isArray(data.ai_opportunities) && data.ai_opportunities.length) {
      data.ai_opportunities.forEach(o => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `<strong>${o.title}</strong>: ${o.explanation}`;
        oppList.append(li);
      });
    } else {
      oppList.innerHTML = '<li>No “AI Opportunities” returned.</li>';
    }

    // AI Engine Insights
    insightsContainer.innerHTML = '<h2>AI Engine Insights</h2>';
    if (data.ai_engine_insights && typeof data.ai_engine_insights === 'object') {
      Object.entries(data.ai_engine_insights).forEach(([engine, detail]) => {
        const div = document.createElement('div');
        div.className = 'engine-insight';
        div.innerHTML = `<h3 class="engine-name">${engine}</h3><p>${detail}</p>`;
        insightsContainer.append(div);
      });
    } else {
      insightsContainer.innerHTML += '<p>No “AI Engine Insights” returned.</p>';
    }

    // Show report
    statusEl.style.display = 'none';
    resultsEl.style.display = 'block';

  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    statusEl.classList.add('error');
  }

  // Contact form handler
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('contactStatus').textContent = 'Thank you! We will be in touch soon.';
    e.target.reset();
  });
});