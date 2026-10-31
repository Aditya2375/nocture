/* NOCTURE — interactions v2 */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;

  /* ── catalogue ─────────────────────────────────────────── */
  const PRODUCTS = [
    { id: 'ambre',  num: 'N°01', name: 'Ambre Minuit',  img: 'hero.jpg',
      color: 'rgba(222,168,92,.42)', ghost: 'Ambre',
      alt: 'A tall pillar candle burning against pure darkness',
      desc: 'The hour the lamps come on. Warm amber folded into vanilla bean, with a thread of birch smoke that stays after the flame is out.',
      top: 'Golden amber', heart: 'Vanilla bean', base: 'Birch smoke',
      price: '₹ 2,400', burn: '55 h burn' },
    { id: 'iris',   num: 'N°02', name: 'Iris Cendré',   img: 'iris.jpg',
      color: 'rgba(164,152,205,.42)', ghost: 'Iris',
      alt: 'A white pillar candle burning in darkness',
      desc: 'Powdery orris over white cedar, cooled by a breath of cold ash. The quietest candle in the collection, and the one people ask about.',
      top: 'Orris root', heart: 'White cedar', base: 'Cold ash',
      price: '₹ 2,600', burn: '50 h burn' },
    { id: 'santal', num: 'N°03', name: 'Santal Obscur', img: 'santal.jpg',
      color: 'rgba(214,118,48,.45)', ghost: 'Santal',
      alt: 'A close-up of a candle flame with a glowing ember',
      desc: 'Sandalwood worn like a old leather jacket — smooth, darkened at the edges, finished with a single clove. Burns slow and low.',
      top: 'Sandalwood', heart: 'Worn leather', base: 'Clove bud',
      price: '₹ 2,800', burn: '60 h burn' },
    { id: 'neroli', num: 'N°04', name: 'Néroli Noir',   img: 'neroli-noir.jpg',
      color: 'rgba(229,200,120,.40)', ghost: 'Néroli',
      alt: 'A single candle burning alone in a dark room',
      desc: 'Neroli after sundown: bright at first strike, then bergamot deepens into black tea. The light it throws comes in rings.',
      top: 'Neroli', heart: 'Bergamot', base: 'Black tea',
      price: '₹ 2,400', burn: '48 h burn' },
    { id: 'vetiver',num: 'N°05', name: 'Vétiver Fumé',  img: 'vetiver-fume.jpg',
      color: 'rgba(126,158,110,.40)', ghost: 'Vétiver',
      alt: 'A tea light burning before a field of warm candle glow',
      desc: 'Earth and water. Vetiver root and tobacco leaf steeped in dark rum — the scent of a jetty at night, still warm from the day.',
      top: 'Vetiver root', heart: 'Tobacco leaf', base: 'Dark rum',
      price: '₹ 2,600', burn: '52 h burn' },
    { id: 'rose',   num: 'N°06', name: 'Rose Crue',     img: 'rose.jpg',
      color: 'rgba(198,92,92,.44)', ghost: 'Rose',
      alt: 'A candle in a glass jar seen from above on dark cloth',
      desc: 'Rose absolute left raw, backed by oud and a pinch of saffron. Nothing powdered, nothing polite — the flower after midnight.',
      top: 'Rose absolute', heart: 'Oud', base: 'Saffron',
      price: '₹ 3,200', burn: '58 h burn' },
  ];

  const $ = (id) => document.getElementById(id);
  const lerp = (a, b, t) => a + (b - a) * t;
  const wallRow = $('wallRow'), product = $('product'), ghost = $('flipGhost');

  /* ── preloader ─────────────────────────────────────────── */
  const word = $('loaderWord'), bar = $('loaderBar');
  'NOCTURE'.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch; s.style.animationDelay = (i * 70) + 'ms';
    word.appendChild(s);
  });
  let p = 0;
  const tick = setInterval(() => { p = Math.min(90, p + 10); bar.style.width = p + '%'; }, 90);
  const ready = () => {
    clearInterval(tick); bar.style.width = '100%';
    setTimeout(() => { $('loader').classList.add('done'); document.body.classList.add('ready'); }, 350);
  };
  addEventListener('load', () => setTimeout(ready, 500));
  setTimeout(ready, 2600);

  /* ── build the wall ────────────────────────────────────── */
  const niches = PRODUCTS.map((pr, i) => {
    const el = document.createElement('div');
    el.className = 'wniche';
    el.style.setProperty('--c', pr.color);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Open ' + pr.name);
    el.innerHTML =
      '<div class="wniche__glow"></div>' +
      '<img src="' + pr.img + '" alt="' + pr.alt + '" loading="' + (i < 3 ? 'eager' : 'lazy') + '">' +
      '<div class="wniche__meta"><div class="wniche__num">' + pr.num + '</div>' +
      '<div class="wniche__name">' + pr.name + '</div>' +
      '<div class="wniche__price">' + pr.price + '</div></div>';
    el.addEventListener('click', () => openProduct(i, el.querySelector('img')));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(i, el.querySelector('img')); } });
    wallRow.appendChild(el);
    return { el, glow: el.querySelector('.wniche__glow'), light: 0, target: 0, hovered: false };
  });
  niches.forEach((n, i) => {
    n.el.addEventListener('pointerenter', () => { n.hovered = true; });
    n.el.addEventListener('pointerleave', () => { n.hovered = false; });
  });

  /* ── pointer state (shared by cursor + wall spotlight) ─── */
  let mx = -9999, my = -9999;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* ── custom cursor ─────────────────────────────────────── */
  const dot = $('curDot'), ring = $('curRing');
  let dx = innerWidth / 2, dy = innerHeight / 2, rx = dx, ry = dy;
  const HOVER_SEL = 'a, button, .wniche, [role="button"]';
  if (FINE && !RM) {
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(HOVER_SEL)) ring.classList.add('on');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(HOVER_SEL)) ring.classList.remove('on');
    });
  }

  /* ── magnetic buttons ──────────────────────────────────── */
  const magnets = [];
  if (FINE && !RM) {
    document.querySelectorAll('.btn, .hdr__bag, .product__nav button').forEach((el) => {
      const m = { el, tx: 0, ty: 0, x: 0, y: 0 };
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        m.tx = (e.clientX - (r.left + r.width / 2)) * .22;
        m.ty = (e.clientY - (r.top + r.height / 2)) * .3;
      });
      el.addEventListener('pointerleave', () => { m.tx = 0; m.ty = 0; });
      magnets.push(m);
    });
  }

  /* ── marquee: velocity-reactive ────────────────────────── */
  const track = document.querySelector('.marquee__track');
  let marqX = 0, vel = 0, lastY = scrollY;
  const marqHalf = () => track.scrollWidth / 2;

  /* ── wall lighting: scroll + proximity ─────────────────── */
  const wall = $('wall');
  const wallProgress = () => {
    const r = wall.getBoundingClientRect();
    const total = r.height - innerHeight;
    if (total <= 0) return 1;
    return Math.min(1, Math.max(0, -r.top / total));
  };

  /* ── hero parallax + atmosphere drift (from v1) ────────── */
  const hStage = $('heroStage'), hCopy = $('heroCopy'), hGlow = $('heroGlow'), atmos = $('atmosImg');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5);
  }, { passive: true });

  /* ── fade hero copy/meta before it reaches the header ──── */
  const heroFade = [$('heroCopy'), document.querySelector('.hero__meta')].filter(Boolean);
  const fadeOnScroll = () => {
    const f = Math.max(0, 1 - scrollY / (innerHeight * .55));
    heroFade.forEach((el) => { el.style.opacity = f.toFixed(3); });
  };

  /* ── master rAF loop ───────────────────────────────────── */
  const loop = () => {
    /* cursor */
    if (FINE && !RM) {
      dx = lerp(dx, mx, .55); dy = lerp(dy, my, .55);
      rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16);
      dot.style.transform = 'translate(' + (dx - 3) + 'px,' + (dy - 3) + 'px)';
      ring.style.transform = 'translate(' + (rx - 19) + 'px,' + (ry - 19) + 'px)';
      magnets.forEach((m) => {
        m.x = lerp(m.x, m.tx, .14); m.y = lerp(m.y, m.ty, .14);
        m.el.style.transform = 'translate(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px)';
      });
    }

    /* scroll velocity */
    const dySc = scrollY - lastY; lastY = scrollY;
    vel = lerp(vel, Math.min(6, Math.abs(dySc) / 30), .08);

    /* marquee: base drift + velocity boost */
    if (!RM && track) {
      marqX -= .45 + vel * 2.2;
      const h = marqHalf();
      if (h > 0 && -marqX >= h) marqX += h;
      track.style.transform = 'translateX(' + marqX.toFixed(1) + 'px)';
      track.style.animation = 'none';
    }

    /* wall lighting */
    const prog = wallProgress();
    niches.forEach((n, i) => {
      /* scroll: each niche lights in sequence through the pin */
      const start = i / (niches.length + 1);
      const sc = Math.min(1, Math.max(0, (prog - start) * (niches.length + 1) * .9));
      let t = .12 + sc * .55;
      /* proximity spotlight (desktop) */
      if (FINE && !RM) {
        const r = n.el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const nx = r.left + r.width / 2, ny = r.top + r.height / 2;
          const d = Math.hypot(mx - nx, my - ny);
          const prox = Math.max(0, 1 - d / (innerWidth * .32));
          t = Math.max(t, prox * .95);
        }
      }
      if (n.hovered) t = 1;
      n.target = t;
      n.light = lerp(n.light, n.target, .09);
      n.glow.style.opacity = n.light.toFixed(3);
      n.el.classList.toggle('lit', n.light > .6);
    });

    /* hero parallax + atmos drift */
    if (!RM) {
      cx = lerp(cx, tx, .045); cy = lerp(cy, ty, .045);
      if (scrollY < innerHeight * 1.2) {
        hStage.style.transform = 'translate(' + (cx * -14) + 'px,' + (cy * -10) + 'px)';
        hCopy.style.transform = 'translate(' + (cx * 8) + 'px,' + (cy * 6) + 'px)';
        hGlow.style.transform = 'translateX(-50%) translate(' + (cx * 26) + 'px,' + (cy * 18) + 'px)';
      }
      const r = atmos.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const ap = (innerHeight - r.top) / (innerHeight + r.height);
        atmos.style.transform = 'translateY(' + ((ap - .5) * -9) + '%)';
      }
    }

    fadeOnScroll();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  /* ── product scene ─────────────────────────────────────── */
  let cur = 0, isOpen = false, sourceImg = null;
  const halo = $('sceneHalo'), ghostName = $('sceneGhost');

  const setContent = (i) => {
    const pr = PRODUCTS[i];
    $('pNum').textContent = pr.num;
    $('pName').textContent = pr.name;
    $('pDesc').textContent = pr.desc;
    $('pTop').textContent = pr.top;
    $('pHeart').textContent = pr.heart;
    $('pBase').textContent = pr.base;
    $('pPrice').textContent = pr.price;
    $('pBurn').textContent = pr.burn;
    $('pIdx').textContent = String(i + 1).padStart(2, '0') + ' / 06';
    ghostName.textContent = pr.ghost;
    const img = $('pImg');
    img.src = pr.img; img.alt = pr.alt;
    halo.style.setProperty('--sc', pr.color);
  };

  const flipTo = (fromImg, done) => {
    if (RM || !fromImg) { done(); return; }
    const target = $('pImg');
    const run = () => {
      const r1 = fromImg.getBoundingClientRect(), r2 = target.getBoundingClientRect();
      ghost.src = fromImg.currentSrc || fromImg.src;
      Object.assign(ghost.style, {
        display: 'block', left: r1.left + 'px', top: r1.top + 'px',
        width: r1.width + 'px', height: r1.height + 'px',
      });
      target.style.opacity = '0';
      const dx2 = r2.left - r1.left, dy2 = r2.top - r1.top;
      const anim = ghost.animate([
        { transform: 'translate(0,0)', width: r1.width + 'px', height: r1.height + 'px' },
        { transform: 'translate(' + dx2 + 'px,' + dy2 + 'px)', width: r2.width + 'px', height: r2.height + 'px' },
      ], { duration: 720, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      anim.onfinish = () => {
        ghost.style.display = 'none';
        target.style.opacity = '1';
        done();
      };
    };
    if (target.complete) run(); else target.onload = run;
  };

  const openProduct = (i, fromImg) => {
    cur = i; isOpen = true; sourceImg = fromImg;
    setContent(i);
    product.classList.add('open');
    product.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    flipTo(fromImg, () => {});
  };

  const closeProduct = () => {
    isOpen = false;
    product.classList.remove('open');
    product.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const step = (dir) => {
    const next = (cur + dir + PRODUCTS.length) % PRODUCTS.length;
    const stage = $('pImg'), info = document.querySelector('.product__info');
    const t = RM ? 1 : 340;
    const outT = 'translateX(' + (-64 * dir) + 'px) scale(.96)';
    const inT = 'translateX(' + (64 * dir) + 'px) scale(.96)';
    halo.style.opacity = '0';
    ghostName.animate([{ opacity: 1, transform: 'translate(-50%,-54%)' }, { opacity: 0, transform: 'translate(calc(-50% + ' + (-40 * dir) + 'px),-54%)' }], { duration: t, easing: 'ease-in', fill: 'forwards' });
    stage.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: outT }], { duration: t, easing: 'ease-in', fill: 'forwards' })
      .onfinish = () => {
        cur = next; setContent(cur);
        requestAnimationFrame(() => { halo.style.opacity = '1'; });
        stage.animate([{ opacity: 0, transform: inT }, { opacity: 1, transform: 'none' }], { duration: t + 160, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
        ghostName.animate([{ opacity: 0, transform: 'translate(calc(-50% + ' + (40 * dir) + 'px),-54%)' }, { opacity: 1, transform: 'translate(-50%,-54%)' }], { duration: t + 160, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
        info.animate([{ opacity: .15, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: t + 160, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      };
  };

  $('productClose').addEventListener('click', closeProduct);
  $('productBg').addEventListener('click', closeProduct);
  $('prevBtn').addEventListener('click', () => step(-1));
  $('nextBtn').addEventListener('click', () => step(1));
  addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') closeProduct();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* touch swipe inside the scene */
  let swX = null;
  product.addEventListener('touchstart', (e) => { swX = e.touches[0].clientX; }, { passive: true });
  product.addEventListener('touchend', (e) => {
    if (swX === null) return;
    const d = e.changedTouches[0].clientX - swX;
    if (Math.abs(d) > 48) step(d < 0 ? 1 : -1);
    swX = null;
  }, { passive: true });

  /* ── bag ───────────────────────────────────────────────── */
  let bag = 0, toastTimer = null;
  $('addBtn').addEventListener('click', () => {
    bag++; $('bagCount').textContent = bag;
    const toast = $('toast');
    toast.textContent = 'Added — ' + PRODUCTS[cur].name;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  });
  $('bagBtn').addEventListener('click', () => {
    const toast = $('toast');
    toast.textContent = bag === 0 ? 'Your bag is empty' : bag + (bag === 1 ? ' candle' : ' candles') + ' — checkout is disabled for this concept';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  });

  /* ── scroll reveals ────────────────────────────────────── */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .18 });
  document.querySelectorAll('.rv').forEach((el) => io.observe(el));

  /* ── smooth anchors ────────────────────────────────────── */
  document.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
  }));
})();
