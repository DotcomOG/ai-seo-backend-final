// public/index.js
// Summary-only MVP

document.addEventListener('DOMContentLoaded', function(){
  var form     = document.getElementById('analyzerForm');
  var resultEl = document.getElementById('result');

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var rawUrl = document.getElementById('url').value.trim();
    var url = rawUrl.startsWith('http://') 
      ? 'https://' + rawUrl.slice(7) 
      : rawUrl;

    resultEl.textContent = 'Analyzing...';

    fetch('/friendly?type=summary&url=' + encodeURIComponent(url))
      .then(function(res){
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
