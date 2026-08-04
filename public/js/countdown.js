(function () {
  const el = document.querySelector('.countdown');
  if (!el) return;
  const target = new Date(el.dataset.launch).getTime();
  if (Number.isNaN(target)) return;

  const nodes = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function setValue(node, value) {
    if (!node) return;
    if (node.textContent !== value) {
      node.textContent = value;
      node.classList.remove('tick');
      // Force reflow so animation retriggers
      void node.offsetWidth;
      node.classList.add('tick');
      window.setTimeout(() => node.classList.remove('tick'), 220);
    }
  }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      setValue(nodes.days, '00');
      setValue(nodes.hours, '00');
      setValue(nodes.mins, '00');
      setValue(nodes.secs, '00');
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setValue(nodes.days, pad(d));
    setValue(nodes.hours, pad(h));
    setValue(nodes.mins, pad(m));
    setValue(nodes.secs, pad(s));
  }

  tick();
  setInterval(tick, 1000);
})();
