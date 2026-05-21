(function () {
  const el = document.querySelector('.countdown');
  if (!el) return;
  const target = new Date(el.dataset.launch).getTime();
  if (Number.isNaN(target)) return;

  const $days = document.getElementById('cd-days');
  const $hours = document.getElementById('cd-hours');
  const $mins = document.getElementById('cd-mins');
  const $secs = document.getElementById('cd-secs');

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $days.textContent = '00';
      $hours.textContent = '00';
      $mins.textContent = '00';
      $secs.textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    $days.textContent = pad(d);
    $hours.textContent = pad(h);
    $mins.textContent = pad(m);
    $secs.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();
