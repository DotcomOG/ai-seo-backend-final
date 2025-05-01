// public/index.js
document.getElementById('analyzerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.getElementById('type').value;
  const url  = document.getElementById('url').value;
  const resultEl = document.getElementById('result');
  resultEl.textContent = 'Analyzing…';

  try {
    const res = await fetch(\`/friendly?type=\${type}&url=\${encodeURIComponent(url)}\`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }
    const data = await res.json();
    resultEl.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    resultEl.textContent = 'Error: ' + err.message;
  }
});
