/* NOCTURE — interactions */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── catalogue ─────────────────────────────────────────── */
  const PRODUCTS = [
    { id: 'ambre',  num: 'N°01', name: 'Ambre Minuit',  img: 'hero.jpg',
      alt: 'A tall pillar candle burning against pure darkness',
      desc: 'The hour the lamps come on. Warm amber folded into vanilla bean, with a thread of birch smoke that stays after the flame is out.',
      top: 'Golden amber', heart: 'Vanilla bean', base: 'Birch smoke',
      price: '₹ 2,400', burn: '55 h burn' },
    { id: 'iris',   num: 'N°02', name: 'Iris Cendré',   img: 'iris.jpg',
      alt: 'A white pillar candle burning in darkness',
      desc: 'Powdery orris over white cedar, cooled by a breath of cold ash. The quietest candle in the collection, and the one people ask about.',
      top: 'Orris root', heart: 'White cedar', base: 'Cold ash',
      price: '₹ 2,600', burn: '50 h burn' },
    { id: 'santal', num: 'N°03', name: 'Santal Obscur', img: 'santal.jpg',
      alt: 'A close-up of a candle flame with a glowing ember',
      desc: 'Sandalwood worn like a old leather jacket — smooth, darkened at the edges, finished with a single clove. Burns slow and low.',
      top: 'Sandalwood', heart: 'Worn leather', base: 'Clove bud',
      price: '₹ 2,800', burn: '60 h burn' },
    { id: 'neroli', num: 'N°04', name: 'Néroli Noir',   img: 'neroli.jpg',
      alt: 'A candle in glass casting rings of warm light',
      desc: 'Neroli after sundown: bright at first strike, then bergamot deepens into black tea. The light it throws comes in rings.',
      top: 'Neroli', heart: 'Bergamot', base: 'Black tea',
      price: '₹ 2,400', burn: '48 h burn' },
    { id: 'vetiver',num: 'N°05', name: 'Vétiver Fumé',  img: 'vetiver.jpg',
      alt: 'A candle burning on dark still water',
      desc: 'Earth and water. Vetiver root and tobacco leaf steeped in dark rum — the scent of a jetty at night, still warm from the day.',
      top: 'Vetiver root', heart: 'Tobacco leaf', base: 'Dark rum',
      price: '₹ 2,600', burn: '52 h burn' },
    { id: 'rose',   num: 'N°06', name: 'Rose Crue',     img: 'rose.jpg',
      alt: 'A candle in a glass jar seen from above on dark cloth',
      desc: 'Rose absolute left raw, backed by oud and a pinch of saffron. Nothing powdered, nothing polite — the flower after midnight.',
      top: 'Rose absolute', heart: 'Oud', base: 'Saffron',
      price: '₹ 3,200', burn: '58 h burn' },
  ];

  const $ = (id) => document.getElementById(id);
  const shelf = $('shelf'), product = $('product'), ghost = $('flipGhost');

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
  setTimeout(ready, 2600); // never trap the visitor

  /* ── collection shelf ──────────────────────────────────── */
  PRODUCTS.forEach((pr, i) => {
    const card = document.createElement('div');
    card.className = 'niche-card';
    card.innerHTML =
      '<figure class="niche"><img class="niche__img" src="' + pr.img + '" alt="' + pr.alt + '" loading="' + (i < 3 ? 'eager' : 'lazy') + '"></figure>' +
      '<div class="niche-card__meta"><div><div class="niche-card__num">' + pr.num + '</div>' +
      '<div class="niche-card__name">' + pr.name + '</div></div>' +
      '<div class="niche-card__price">' + pr.price + '</div></div>';
    card.addEventListener('click', () => openProduct(i, card.querySelector('img')));
    shelf.appendChild(card);
  });

  /* ── product overlay ───────────────────────────────────── */
  let cur = 0, isOpen = false, sourceImg = null;
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
    const img = $('pImg');
    img.src = pr.img; img.alt = pr.alt;
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
      const dx = r2.left - r1.left, dy = r2.top - r1.top;
      const anim = ghost.animate([
        { transform: 'translate(0,0)', width: r1.width + 'px', height: r1.height + 'px' },
        { transform: 'translate(' + dx + 'px,' + dy + 'px)', width: r2.width + 'px', height: r2.height + 'px' },
      ], { duration: 640, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
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
    const out = [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-34 * dir) + 'px)' }];
    const inn = [{ opacity: 0, transform: 'translateX(' + (34 * dir) + 'px)' }, { opacity: 1, transform: 'translateX(0)' }];
    const t = RM ? 1 : 300;
    stage.animate(out, { duration: t, easing: 'ease-in', fill: 'forwards' })
      .onfinish = () => {
        cur = next; setContent(cur);
        stage.animate(inn, { duration: t + 80, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
        info.animate([{ opacity: .2 }, { opacity: 1 }], { duration: t + 80, easing: 'ease-out' });
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

  /* ── hero parallax + atmosphere drift ──────────────────── */
  if (!RM) {
    const stage = $('heroStage'), copy = $('heroCopy'), glow = $('heroGlow');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5);
    }, { passive: true });
    const atmos = $('atmosImg');
    const loop = () => {
      cx += (tx - cx) * .045; cy += (ty - cy) * .045;
      stage.style.transform = 'translate(' + (cx * -14) + 'px,' + (cy * -10) + 'px)';
      copy.style.transform = 'translate(' + (cx * 8) + 'px,' + (cy * 6) + 'px)';
      glow.style.transform = 'translateX(-50%) translate(' + (cx * 26) + 'px,' + (cy * 18) + 'px)';
      const r = atmos.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const prog = (innerHeight - r.top) / (innerHeight + r.height);
        atmos.style.transform = 'translateY(' + ((prog - .5) * -9) + '%)';
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ── smooth anchors ────────────────────────────────────── */
  document.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
  }));
})();
