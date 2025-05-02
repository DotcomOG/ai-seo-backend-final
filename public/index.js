// public/index.js
// 2025-05-02 10:45:00 ET — Minimal with 400-length fallback

document.addEventListener('DOMContentLoaded', function(){
  var form     = document.getElementById('analyzerForm');
  var resultEl = document.getElementById('result');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var type = document.getElementById('type').value;
    var rawUrl = document.getElementById('url').value.trim();
    // Normalize HTTP→HTTPS
    var url = rawUrl.startsWith('http://') ? 'https://' + rawUrl.slice(7) : rawUrl;

    resultEl.textContent = 'Analyzing...';

    fetch('/friendly?type=' + encodeURIComponent(type) +
          '&url='  + encodeURIComponent(url))
      .then(function(res){
        // If AI returned an HTTP 400 with a JSON error body, bubble it up.
        if (!res.ok) return res.json().then(function(j){ throw new Error(j.error);} );
        return res.json();
      })
      .then(function(data){
        resultEl.textContent = JSON.stringify(data, null, 2);
      })
      .catch(function(err){
        var msg = err.message || '';
        if (msg.match(/maximum context length/i)) {
          resultEl.textContent = 
            'Error: Page too large to analyze. Try “Summary” mode or a shorter page.';
        } else {
          resultEl.textContent = 'Error: ' + msg;
        }
      });
  });
});
