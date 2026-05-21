(function () {
  const form = document.getElementById('waitlist-form');
  if (!form) return;

  const input = document.getElementById('waitlist-email');
  const btn = document.getElementById('waitlist-submit');
  const msg = document.getElementById('waitlist-msg');

  function setMsg(text, type) {
    msg.textContent = text;
    msg.classList.remove('success', 'error');
    if (type) msg.classList.add(type);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (input.value || '').trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsg('Please enter a valid email address.', 'error');
      return;
    }

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Joining…';
    setMsg('', null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setMsg(data.error || 'Something went wrong. Try again shortly.', 'error');
      } else {
        setMsg(data.message || "You're on the list.", 'success');
        input.value = '';
      }
    } catch (err) {
      setMsg('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
})();
