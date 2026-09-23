(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle — initial theme is set inline in <head> to avoid a flash.
  const toggle = document.querySelector('[data-theme-toggle]');
  const syncToggle = () => {
    if (!toggle) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${next} theme`);
  };
  syncToggle();
  toggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!reduceMotion) {
      root.classList.add('theme-switching');
      setTimeout(() => root.classList.remove('theme-switching'), 250);
    }
    root.dataset.theme = next;
    try { localStorage.setItem('voult-theme', next); } catch (e) {}
    syncToggle();
  });
  // Follow OS changes until the user picks a theme explicitly.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('voult-theme'); } catch (err) {}
    if (!saved) { root.dataset.theme = e.matches ? 'dark' : 'light'; syncToggle(); }
  });

  // Nav: border on scroll + mobile menu.
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const btn = nav.querySelector('[data-nav-toggle]');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('#nav-menu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setOpen(false));
  }

  // Tabs (code block + console preview): WAI-ARIA tabs with arrow-key support.
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        const next = tabs[(i + d + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  // Copy buttons copy the visible code panel.
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.getAttribute('aria-label');
    btn.addEventListener('click', async () => {
      const block = btn.closest('[data-code]');
      const panel = [...block.querySelectorAll('.code-panel')].find((p) => !p.hidden);
      const text = (panel.querySelector('pre') || panel).innerText.trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.dataset.copied = '';
        btn.setAttribute('aria-label', 'Copied');
        setTimeout(() => { delete btn.dataset.copied; btn.setAttribute('aria-label', label); }, 1600);
      } catch (e) {}
    });
  });

  // Section reveal.
  const reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window && reveals.length) {
    root.classList.add('motion');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 50}ms`;
      io.observe(el);
    });
  }

  // Waitlist form → POST /api/waitlist.
  const form = document.getElementById('waitlist-form');
  if (form) {
    const input = document.getElementById('waitlist-email');
    const submit = document.getElementById('waitlist-submit');
    const msg = document.getElementById('waitlist-msg');
    const setMsg = (text, type) => {
      msg.textContent = text;
      msg.className = `waitlist-msg ${type || ''}`;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setMsg('Please enter a valid email address.', 'error');
        input.focus();
        return;
      }
      submit.disabled = true;
      const label = submit.textContent;
      submit.textContent = 'Joining…';
      setMsg('');
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) setMsg(data.error || 'Something went wrong. Try again shortly.', 'error');
        else { setMsg(data.message || "You're on the list.", 'success'); input.value = ''; }
      } catch (err) {
        setMsg('Network error. Please try again.', 'error');
      } finally {
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }
})();
