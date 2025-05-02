// public/index.js
// 2025-05-02 10:30:00 ET — Minimal, ASCII-only

document.addEventListener('DOMContentLoaded', function(){
  var form     = document.getElementById('analyzerForm');
  var resultEl = document.getElementById('result');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var type = document.getElementById('type').value;
    var url  = document.getElementById('url').value;

    // Show interim status
    resultEl.textContent = 'Analyzing...';

    // Fetch and render raw JSON
    fetch('/friendly?type=' + encodeURIComponent(type) +
          '&url='  + encodeURIComponent(url))
      .then(function(res){
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(function(data){
        resultEl.textContent = JSON.stringify(data, null, 2);
      })
      .catch(function(err){
        resultEl.textContent = 'Error: ' + err.message;
      });
  });
});
