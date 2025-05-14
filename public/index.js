// public/index.js — UI logic including contact form

document.addEventListener('DOMContentLoaded', () => {
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
  const contactForm    = document.getElementById('contactForm');
  const contactStatus  = document.getElementById('contactStatus');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    statusEl.textContent    = 'Analyzing...';
    statusEl.className      = '';
    resultsEl.style.display = 'none';
    spContainer.innerHTML   = '';
    oppContainer.innerHTML  = '';
    insights.innerHTML      = '';
    scoreEl.textContent     = '';
    scoreExpEl.textContent  = '';

    const rawUrl = document.getElementById('url').value.trim();
    const url    = rawUrl.startsWith('http://')
      ? 'https://' + rawUrl.slice(7)
      : rawUrl;

    try {
      const res  = await fetch('/friendly?type=summary&url=' + encodeURIComponent(url));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);

      statusEl.textContent   = '';
      scoreEl.textContent    = (data.score ?? 'N/A') + '/10';
      scoreExpEl.textContent = data.score_explanation || 'No explanation.';

      (data.ai_superpowers || []).slice(0,5).forEach(p => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div class="item-header">💡 ${p.title}</div>
          <div class="item-explanation">${p.explanation}</div>
        `;
        spContainer.appendChild(div);
      });

      (data.ai_opportunities || []).slice(0,10).forEach(o => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div class="item-header">⚠️ ${o.title}</div>
          <div class="item-explanation">${o.explanation}</div>
        `;
        oppContainer.appendChild(div);
      });

      Object.entries(data.ai_engine_insights || {}).forEach(([engine, text]) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
          <div class="item-header">🔍 ${engine}</div>
          <div class="item-explanation">${text}</div>
        `;
        insights.appendChild(div);
      });

      resultsEl.style.display = 'block';
    } catch (err) {
      statusEl.textContent = 'Error: ' + err.message;
      statusEl.className   = 'error';
    }
  });

  scoreHelpBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'flex';
  });
  closeModalBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    contactStatus.textContent = 'Thank you! We will be in touch soon. 🙏';
    contactForm.reset();
  });
});
