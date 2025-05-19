// public/full-report.js
// 2025-05-01 15:45:00 ET

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');
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
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    const data = await res.json();

    document.getElementById('score').textContent = data.score ?? 'N/A';

    const spList = document.getElementById('superpowers');
    spList.innerHTML = '';
    (data.ai_superpowers || []).forEach(p => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<strong>${p.title}</strong>: ${p.explanation}`;
      spList.append(li);
    });

    const oppList = document.getElementById('opportunities');
    oppList.innerHTML = '';
    (data.ai_opportunities || []).forEach(o => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<strong>${o.title}</strong>: ${o.explanation}`;
      oppList.append(li);
    });

    const insightsContainer = document.getElementById('insights-container');
    insightsContainer.innerHTML = '<h2>AI Engine Insights</h2>';
    Object.entries(data.ai_engine_insights || {}).forEach(([engine, detail]) => {
      const div = document.createElement('div');
      div.className = 'engine-insight';
      if (detail && typeof detail === 'object') {
        const score = detail.score ?? 'N/A';
        const text = detail.insight ?? '';
        div.innerHTML = `<h3 class="engine-name">${engine} (Score: ${score}/10)</h3><p>${text}</p>`;
      } else {
        div.innerHTML = `<h3 class="engine-name">${engine}</h3><p>${detail}</p>`;
      }
      insightsContainer.append(div);
    });

    statusEl.style.display = 'none';
    resultsEl.style.display = 'block';
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    statusEl.classList.add('error');
  }

  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (contactStatus) {
        contactStatus.textContent = 'Thank you! We will be in touch soon.';
      }
      e.target.reset();
    });
  }
});