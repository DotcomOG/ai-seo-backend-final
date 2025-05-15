// public/index.js
// Generated at: 2025-05-15 12:15:00 ET (America/New_York)

document.addEventListener('DOMContentLoaded', () => {
  /* (your existing analyze logic here) */

  // Modal controls
  document.getElementById('scoreHelp').addEventListener('click', () => {
    document.getElementById('scoreModal').style.display = 'flex';
  });
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('scoreModal').style.display = 'none';
  });
});
