(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav scroll state
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.fade-up');
  if (revealEls.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 0.06}s`;
        observer.observe(el);
      });
    }
  }

  // Feature spotlight follow
  document.querySelectorAll('.feature').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
  });

  // Typewriter code snippet
  const codeEl = document.getElementById('typed-code');
  if (!codeEl) return;

  const lines = [
    { html: '<span class="t-k">const</span> res = <span class="t-k">await</span> voult.auth.<span class="t-f">register</span>({\n' },
    { html: '  email: <span class="t-s">"dev@example.com"</span>,\n' },
    { html: '  password: <span class="t-s">"StrongPassword123!"</span>,\n' },
    { html: '});\n\n' },
    { html: '<span class="t-c">// → { user, accessToken, refreshToken }</span>' },
  ];

  if (prefersReduced) {
    codeEl.innerHTML = lines.map((l) => l.html).join('');
    return;
  }

  let lineIdx = 0;
  let charIdx = 0;
  const cursor = '<span class="cursor"></span>';

  function stripTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || '';
  }

  // Type by revealing more of the plain text, but render full HTML once line completes
  // Simpler approach: type plain text then swap to highlighted HTML per line
  function tick() {
    if (lineIdx >= lines.length) {
      codeEl.innerHTML = lines.map((l) => l.html).join('') + cursor;
      return;
    }

    const line = lines[lineIdx];
    const plain = stripTags(line.html);

    if (charIdx <= plain.length) {
      const typedPlain = lines
        .slice(0, lineIdx)
        .map((l) => l.html)
        .join('');
      const currentPlain = plain.slice(0, charIdx);
      // Escape current partial plain text
      const escaped = currentPlain
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      codeEl.innerHTML = typedPlain + escaped + cursor;
      charIdx += 1;
      const delay = plain[charIdx - 2] === '\n' ? 180 : 18 + Math.random() * 28;
      setTimeout(tick, delay);
    } else {
      lineIdx += 1;
      charIdx = 0;
      setTimeout(tick, 80);
    }
  }

  setTimeout(tick, 600);
})();
