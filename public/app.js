(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- i18n (EN/ES) ---------- */
  function applyLang(lang) {
    root.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n-en]').forEach((el) => {
      const v = el.getAttribute(lang === 'es' ? 'data-i18n-es' : 'data-i18n-en');
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('.seg.lang .seg-btn').forEach((b) =>
      b.classList.toggle('active', b.dataset.lang === lang)
    );
    try { localStorage.setItem('fv-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.seg.lang .seg-btn').forEach((b) =>
    b.addEventListener('click', () => applyLang(b.dataset.lang))
  );
  applyLang(root.getAttribute('lang') === 'es' ? 'es' : 'en');

  /* ---------- theme ---------- */
  const tt = document.getElementById('theme-toggle');
  if (tt) tt.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('fv-theme', next); } catch (e) {}
  });

  /* ---------- nav: scrolled border ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- scroll-spy (active nav link) ---------- */
  const spies = [...document.querySelectorAll('.nav-link[data-spy]')];
  const sections = spies.map((a) => document.getElementById(a.dataset.spy)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          spies.forEach((a) => a.classList.toggle('active', a.dataset.spy === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- coverflow carousel (runs regardless of gsap/reduce) ---------- */
  (function carousel() {
    const stage = document.getElementById('cf-stage');
    const cf = document.getElementById('cf');
    const dotsWrap = document.getElementById('cf-dots');
    if (!stage || !cf || !dotsWrap) return;
    const items = [...stage.querySelectorAll('.cf-item')];
    const n = items.length;
    if (!n) return;
    let active = 0, timer = null;

    items.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'cf-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', 'Screenshot ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = [...dotsWrap.children];

    function layout() {
      items.forEach((el, i) => {
        const off = i - active;
        const a = Math.abs(off);
        let tx, sc, ry, op, z;
        if (a === 0) { tx = 0; sc = 1; ry = 0; op = 1; z = 30; }
        else if (a === 1) { tx = off * 46; sc = 0.82; ry = off * -26; op = 0.6; z = 20; }
        else if (a === 2) { tx = off * 78; sc = 0.64; ry = off * -32; op = 0.26; z = 10; }
        else { tx = off * 100; sc = 0.5; ry = off * -36; op = 0; z = 1; }
        el.style.transform = 'translate(-50%,-50%) translateX(' + tx + '%) scale(' + sc + ') rotateY(' + ry + 'deg)';
        el.style.opacity = op;
        el.style.zIndex = z;
        el.style.pointerEvents = a > 2 ? 'none' : 'auto';
        el.style.cursor = a === 0 ? 'zoom-in' : 'pointer';
        el.onclick = () => {
          if (i === active) { const img = el.querySelector('img'); openLB(img.src, img.alt); }
          else go(i);
        };
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }
    function go(i) { active = (i + n) % n; layout(); restart(); }
    const next = () => go(active + 1);
    const prev = () => go(active - 1);
    document.getElementById('cf-next').addEventListener('click', next);
    document.getElementById('cf-prev').addEventListener('click', prev);

    function restart() { if (timer) clearInterval(timer); if (!reduce) timer = setInterval(next, 4500); }
    cf.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    cf.addEventListener('mouseleave', restart);

    let sx = 0, dragging = false;
    cf.addEventListener('pointerdown', (e) => { dragging = true; sx = e.clientX; });
    window.addEventListener('pointerup', (e) => {
      if (!dragging) return; dragging = false;
      const dx = e.clientX - sx;
      if (dx > 40) prev(); else if (dx < -40) next();
    });

    cf.setAttribute('tabindex', '0');
    cf.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    /* lightbox: click the centered shot to view it full size */
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbClose = document.getElementById('lb-close');
    function openLB(src, alt) {
      if (!lb) return;
      lbImg.src = src; lbImg.alt = alt || '';
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      if (timer) clearInterval(timer);
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function closeLB() {
      if (!lb) return;
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      restart();
    }
    if (lb) {
      lbClose.addEventListener('click', closeLB);
      lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
      window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLB(); });
    }

    layout();
    restart();
  })();

  /* ---------- build MacBook keyboard keys ---------- */
  (function keyboard() {
    const kb = document.getElementById('mb-kb');
    if (!kb) return;
    const rows = [13, 14, 14, 13, 12];
    rows.forEach((n, ri) => {
      const r = document.createElement('div');
      r.className = 'mb-krow';
      for (let i = 0; i < n; i++) {
        const k = document.createElement('span');
        k.className = 'mb-key' + (ri === 0 ? ' k-fn' : '');
        r.appendChild(k);
      }
      kb.appendChild(r);
    });
    const last = document.createElement('div');
    last.className = 'mb-krow';
    [1.3, 1, 1, 1.3, 'space', 1.3, 1, 1].forEach((w) => {
      const k = document.createElement('span');
      k.className = 'mb-key' + (w === 'space' ? ' k-space' : '');
      if (w !== 'space') k.style.flex = String(w);
      last.appendChild(k);
    });
    kb.appendChild(last);
  })();

  /* ---------- living-cipher canvas (reacts to cursor) ---------- */
  (function cipher() {
    const cv = document.getElementById('cipher');
    const fx = document.getElementById('site-fx');
    if (!cv || !fx || reduce) return;
    const ctx = cv.getContext('2d');
    const GLYPHS = '0123456789ABCDEF·▮▪◇◈∎⎓';
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    let cols = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let mx = -9999, my = -9999, raf = 0, t = 0;
    const font = 15, step = 22;

    function size() {
      const r = fx.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = '600 ' + font + 'px "SF Mono", ui-monospace, Menlo, monospace';
      ctx.textBaseline = 'top';
      const n = Math.ceil(W / step);
      cols = Array.from({ length: n }, (_, i) => ({
        x: i * step + step * 0.3,
        y: Math.random() * H,
        speed: 26 + Math.random() * 46,
        gap: 3 + Math.floor(Math.random() * 5),
      }));
    }

    function draw(now) {
      raf = requestAnimationFrame(draw);
      const dt = Math.min((now - t) / 1000 || 0, 0.05); t = now;
      ctx.clearRect(0, 0, W, H);
      const dark = root.getAttribute('data-theme') !== 'light';
      for (const c of cols) {
        c.y += c.speed * dt;
        if (c.y > H + 40) { c.y = -Math.random() * 120; c.speed = 26 + Math.random() * 46; }
        for (let k = 0; k < 7; k++) {
          const gy = c.y - k * step * c.gap * 0.34;
          if (gy < -20 || gy > H) continue;
          const dxm = c.x - mx, dym = gy - my;
          const dist = Math.sqrt(dxm * dxm + dym * dym);
          const near = dist < 150 ? (1 - dist / 150) : 0;
          const head = k === 0;
          let a = (head ? (dark ? 0.5 : 0.62) : (dark ? 0.16 : 0.28) - k * 0.02) + near * (dark ? 0.75 : 0.9);
          if (a <= 0.02) continue;
          if (near > 0.35 || head) {
            if (dark) ctx.fillStyle = (near > 0.5 ? 'rgba(56,189,248,' : 'rgba(167,139,250,') + Math.min(a, 0.95) + ')';
            else ctx.fillStyle = (near > 0.5 ? 'rgba(2,132,199,' : 'rgba(109,40,217,') + Math.min(a, 0.95) + ')';
          } else {
            ctx.fillStyle = (dark ? 'rgba(150,170,220,' : 'rgba(58,50,110,') + Math.min(a, dark ? 0.7 : 0.85) + ')';
          }
          const gi = ((Math.floor(gy / step) + k * 3) % GLYPHS.length + GLYPHS.length) % GLYPHS.length;
          ctx.fillText(GLYPHS[gi], c.x, gy);
        }
      }
    }

    size();
    window.addEventListener('resize', size, { passive: true });
    if (!isCoarse) {
      window.addEventListener('pointermove', (e) => {
        const r = fx.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top;
      }, { passive: true });
    }
    raf = requestAnimationFrame(draw);
  })();

  /* ---------- cursor spotlight + hero 3D tilt ---------- */
  (function heroFx() {
    if (reduce) return;
    const spot = document.getElementById('spotlight');
    const fx = document.getElementById('site-fx');
    const tilt = document.getElementById('tilt');
    if (window.matchMedia('(pointer: coarse)').matches) return;

    if (spot && fx) {
      window.addEventListener('pointermove', (e) => {
        const r = fx.getBoundingClientRect();
        if (e.clientY - r.top > r.height) return;
        spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }

    if (tilt) {
      const vis = tilt.parentElement;
      let rafT = 0;
      vis.addEventListener('pointermove', (e) => {
        const r = vis.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (rafT) return;
        rafT = requestAnimationFrame(() => {
          tilt.style.transform = 'rotateY(' + (px * 9) + 'deg) rotateX(' + (-py * 7) + 'deg)';
          rafT = 0;
        });
      });
      vis.addEventListener('pointerleave', () => { tilt.style.transform = 'rotateY(0) rotateX(0)'; });
    }
  })();

  /* ---------- card spotlight + 3D tilt (cursor-reactive) ---------- */
  {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    document.querySelectorAll('.card[data-spot]').forEach((card) => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--cy', (e.clientY - r.top) + 'px');
        if (reduce || coarse) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          card.style.transform = 'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-6px)';
          raf = 0;
        });
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- copy-to-clipboard (USDT address) ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const t = document.createElement('textarea');
        t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(t);
      }
      const lang = root.getAttribute('lang') === 'es' ? 'es' : 'en';
      const done = lang === 'es' ? '¡Copiado!' : 'Copied!';
      const orig = btn.getAttribute(lang === 'es' ? 'data-i18n-es' : 'data-i18n-en') || btn.textContent;
      btn.textContent = done; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
    });
  });

  /* ---------- motion ---------- */
  if (reduce || !window.gsap) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // hero entrance (staggered) — copy first, product rises last
  gsap.to('.hero-copy .reveal', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.09, delay: 0.05 });
  gsap.fromTo('.hero-visual',
    { opacity: 0, y: 60, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 1.15, ease: 'power3.out', delay: 0.3 }
  );
  gsap.fromTo('.pill',
    { opacity: 0 },
    { opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.12, delay: 0.9 }
  );

  // generic scroll reveals (skip hero + bento cards; cards get a staggered batch)
  gsap.utils.toArray('.reveal').forEach((el) => {
    if (el.closest('.hero') || el.classList.contains('card')) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });

  // trust bar: staggered pop-in (fromTo so items always settle at their natural spot)
  gsap.fromTo('.trust-item',
    { opacity: 0, y: 16 },
    {
      opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.trust', start: 'top 95%' },
    }
  );

  // bento cards: staggered rise + scale as the row enters
  if (window.ScrollTrigger && window.ScrollTrigger.batch) {
    window.ScrollTrigger.batch('.card', {
      start: 'top 90%',
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, y: 34, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.09, overwrite: true }
      ),
    });
  }

  // hero product cinematic scrub — scales/lifts as you scroll past
  gsap.to('.hero-visual', {
    yPercent: -6, scale: 1.02, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // security shield: gentle parallax drift on scroll (rings self-spin via CSS)
  gsap.to('.shield', {
    yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.security', start: 'top bottom', end: 'bottom top', scrub: true },
  });
})();
