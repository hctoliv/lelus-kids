(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const WA = '5511960237865';
  const wa = (msg, num = WA) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#e23a3a', '#ffc82e', '#2e9e55', '#2f55b8', '#e04a7a', '#7a4bb0', '#ff8a3d', '#5ec3e8'];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- intro (uma vez por visita) ---------- */
  let seen = false;
  try { seen = sessionStorage.getItem('lelus-intro') === '1'; } catch (e) {}
  const force = /[?&]intro/.test(location.search);
  let started = false;
  const start = () => { if (started) return; started = true; root.classList.add('ready'); heroIn(); };
  if ((!seen || force) && !reduce) {
    root.classList.add('intro-on');
    const box = $('#introDots');
    for (let i = 0; i < 46; i++) {
      const d = document.createElement('i');
      const s = rand(10, 46);
      d.style.cssText = `width:${s}px;height:${s}px;background:${COLORS[i % COLORS.length]}`;
      box.appendChild(d);
      const ang = rand(0, Math.PI * 2), dist = rand(18, 52);
      d.animate([
        { transform: 'translate(-50%,-50%) scale(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}vmax), calc(-50% + ${Math.sin(ang) * dist}vmax)) scale(1)`, opacity: .9, offset: .55 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist * 1.1}vmax), calc(-50% + ${Math.sin(ang) * dist * 1.1 + 12}vmax)) scale(.9)`, opacity: .7 }
      ], { duration: 1500, delay: rand(0, 160), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    }
    const end = () => {
      if (root.classList.contains('intro-out')) return;
      root.classList.add('intro-out');
      start();
      setTimeout(() => root.classList.remove('intro-on', 'intro-out'), 650);
      try { sessionStorage.setItem('lelus-intro', '1'); } catch (e) {}
    };
    setTimeout(end, 2000);
    $('#intro').addEventListener('click', end);
    addEventListener('keydown', end, { once: true });
  } else {
    requestAnimationFrame(start);
  }

  /* ---------- confete de fundo ---------- */
  const conf = $('#confetti');
  const dots = [];
  const nDots = innerWidth < 700 ? 14 : 26;
  for (let i = 0; i < nDots; i++) {
    const d = document.createElement('i');
    const s = rand(8, innerWidth < 700 ? 22 : 34);
    d.style.cssText = `width:${s}px;height:${s}px;left:${rand(0, 100)}%;top:-40px;background:${COLORS[i % COLORS.length]};opacity:${rand(.18, .45).toFixed(2)}`;
    conf.appendChild(d);
    const dot = { el: d, k: rand(.05, .3), y0: rand(0, 1) };
    dots.push(dot);
    d.style.transform = `translate3d(0,${dot.y0 * (innerHeight + 80)}px,0)`;
  }

  /* ---------- whatsapp ---------- */
  $$('[data-wa]').forEach(a => {
    a.href = wa(a.dataset.wa, a.dataset.num || WA);
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* ---------- header / menu ---------- */
  const hd = $('#hd'), burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = root.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    root.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- aberto agora (horário de São Paulo, 11h à 0h) ---------- */
  const live = () => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const h = +p.find(x => x.type === 'hour').value % 24;
    const open = h >= 11;
    const el = $('#live');
    el.classList.toggle('open', open);
    el.lastElementChild.textContent = open ? 'Atendendo agora' : 'Abre às 11h';
  };
  live(); setInterval(live, 60000);

  /* ---------- números ---------- */
  const countUp = el => {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1300;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- reveal ---------- */
  $$('.sec-t, .sec-sub, .num, .rev, .builder fieldset, .home-photos img, .team-img, .stop-tx, .extras-tx, .ev-list li, .visit-map, .info div').forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* ---------- vídeos: tocam só quando aparecem ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; if (!reduce) v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: .2 });
  $$('video[data-auto]').forEach(v => vio.observe(v));

  /* ---------- barraquinhas viram ---------- */
  $$('.tent').forEach(t => t.addEventListener('click', () => {
    const on = t.classList.toggle('flip');
    t.setAttribute('aria-pressed', on);
  }));

  /* ---------- temas: lightbox + sorteio ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const openLb = f => {
    const img = $('img', f);
    lbImg.src = img.src.replace('-s.webp', '.webp');
    lbImg.alt = img.alt;
    lbCap.textContent = f.dataset.name;
    lb.hidden = false;
    $('#lbX').focus();
  };
  const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
  $$('.theme').forEach(f => {
    f.tabIndex = 0;
    f.setAttribute('role', 'button');
    f.addEventListener('click', () => openLb(f));
    f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(f); } });
  });
  $('#lbX').addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  const themes = $$('.theme');
  let spinning = false;
  $('#shuffle').addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    themes.forEach(t => t.classList.remove('picked', 'dim'));
    const final = Math.floor(Math.random() * themes.length);
    const hops = reduce ? 1 : 14 + Math.floor(Math.random() * 6);
    let i = 0, cur = -1;
    const hop = () => {
      if (cur >= 0) themes[cur].classList.remove('picked');
      cur = i === hops - 1 ? final : Math.floor(Math.random() * themes.length);
      themes[cur].classList.add('picked');
      i++;
      if (i < hops) setTimeout(hop, 60 + i * 12);
      else {
        themes.forEach((t, k) => k !== cur && t.classList.add('dim'));
        $('#tema').value = themes[cur].dataset.name;
        update();
        setTimeout(() => { themes.forEach(t => t.classList.remove('dim')); spinning = false; }, 2200);
      }
    };
    hop();
  });

  /* ---------- monte sua festa ---------- */
  const form = $('#builder'), guests = $('#guests'), gOut = $('#guestOut');
  const BASE = 3390, PER = 40, INCL = 50;
  const brl = n => n.toLocaleString('pt-BR');
  let lastList = '';
  const val = n => (form.querySelector(`input[name="${n}"]:checked`) || {}).value;
  function update() {
    const tipo = val('tipo'), onde = val('onde'), ultima = val('ultima');
    const extras = $$('input[name="extra"]:checked', form).map(i => i.value);
    const g = +guests.value;
    gOut.textContent = g;
    guests.style.setProperty('--p', ((g - guests.min) / (guests.max - guests.min) * 100) + '%');
    $('#tkTipo').textContent = tipo;
    $('#tkOnde').textContent = `${onde === 'no salão' ? "no salão Lelu's" : 'a domicílio'} · ${g} convidados`;
    const items = onde === 'no salão'
      ? ['Salão de festa por 4 horas', '+30 min de cortesia com bebidas', 'Decoração principal e das mesas', 'Brinquedos, som, TV e Wi-Fi', 'Recepcionista', 'X-salada ou cachorro-quente', 'Crepe suíço', 'Pipoca e algodão doce', 'Bebidas', ultima]
      : ['Barraquinhas montadas no seu local', 'Equipe uniformizada', 'X-salada ou cachorro-quente', 'Crepe suíço', 'Pipoca e algodão doce', 'Bebidas', ultima];
    const tema = $('#tema').value.trim();
    if (tema) items.splice(2, 0, `Tema: ${tema}`);
    const html = items.map(t => `<li>${esc(t)}</li>`).join('') + extras.map(t => `<li class="add">${esc(t)}</li>`).join('');
    if (html !== lastList) {
      const list = $('#tkList');
      list.innerHTML = html;
      if (lastList && !reduce) $$('li', list).forEach((li, k) => { li.style.animationDelay = k * 15 + 'ms'; li.classList.add('pop'); });
      lastList = html;
    }
    const price = $('.tk-price');
    price.hidden = onde !== 'no salão';
    const ex = $('#tkExtra');
    if (g > INCL && onde === 'no salão') {
      ex.hidden = false;
      ex.textContent = `+ ${g - INCL} convidados × R$ ${PER} = R$ ${brl((g - INCL) * PER)} · estimativa R$ ${brl(BASE + (g - INCL) * PER)} à vista`;
    } else ex.hidden = true;

    const d = $('#data').value;
    const dataTxt = d ? d.split('-').reverse().join('/') : 'a combinar';
    const msg = [
      "Oi! Montei minha festa no site do Lelu's Kids:",
      `• Festa: ${tipo}`,
      `• Onde: ${onde}`,
      `• Convidados: ${g}`,
      `• Data: ${dataTxt}`,
      tema ? `• Tema: ${tema}` : null,
      `• 5ª barraquinha: ${ultima}`,
      extras.length ? `• Opcionais: ${extras.join(', ')}` : null,
      'Pode me passar o orçamento?'
    ].filter(Boolean).join('\n');
    $('#send').href = wa(msg);
  }
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', e => e.preventDefault());
  const today = new Date(); $('#data').min = today.toISOString().slice(0, 10);
  update();

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- animações com GSAP ---------- */
  function heroIn() {
    if (!window.gsap || reduce) return;
    gsap.from('.hero-t .ln>span', { yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: .1 });
    gsap.from('.hero .kicker, .hero-sub, .hero-ctas, .rating', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: .25 });
    gsap.from('.polaroid', { y: 140, opacity: 0, rotate: () => rand(-20, 20), duration: 1.2, ease: 'back.out(1.4)', stagger: .12, delay: .2 });
    gsap.from('.balloon', { y: 260, opacity: 0, duration: 1.6, ease: 'power2.out', stagger: .2, delay: .4 });
  }

  addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // lenis (rolagem suave) só no desktop
    let lenis = null;
    if (window.Lenis && !reduce && matchMedia('(pointer:fine)').matches) {
      lenis = new Lenis({ lerp: .1 });
      root.classList.add('lenis');
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = $(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
      }));
    }

    // header sólido
    ScrollTrigger.create({ start: 60, onToggle: s => hd.classList.toggle('solid', s.isActive) });

    // confete acompanha a rolagem (parallax leve)
    if (!reduce) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: s => {
          const y = s.scroll();
          const H = innerHeight + 80;
          for (const d of dots) {
            const p = (((d.y0 * H - y * d.k) % H) + H) % H;
            d.el.style.transform = `translate3d(0,${p}px,0)`;
          }
        }
      });
    }

    if (reduce) return;
    const mm = gsap.matchMedia();

    // polaroids se espalham ao rolar + seguem o mouse
    mm.add('(min-width: 901px)', () => {
      $$('.polaroid').forEach((p, i) => {
        gsap.to(p, { y: -80 * (+p.dataset.depth), rotate: (i % 2 ? 1 : -1) * 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      });
      const stage = $('#stage');
      const move = e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        $$('.polaroid', stage).forEach(p => gsap.to(p, { x: x * 30 * p.dataset.depth, duration: 1, ease: 'power2.out', overwrite: 'auto' }));
      };
      addEventListener('pointermove', move);
      return () => removeEventListener('pointermove', move);
    });

    // tour horizontal preso (desktop)
    mm.add('(min-width: 901px)', () => {
      const track = $('#tourTrack');
      const dist = () => track.scrollWidth - innerWidth;
      const tw = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#tourPin', start: 'center center', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$('.stop-img img').forEach(img => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.stop'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
      });
    });

    // barraquinhas entram uma a uma
    gsap.fromTo('.tent', { y: 80, opacity: 0, rotate: () => rand(-6, 6) }, { y: 0, opacity: 1, rotate: 0, duration: .9, ease: 'back.out(1.6)', stagger: .09, clearProps: 'transform,opacity,translate,rotate,scale', scrollTrigger: { trigger: '#tentRow', start: 'top 82%' } });

    // temas aparecem em cascata
    gsap.fromTo('.theme', { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .7, ease: 'power3.out', stagger: { each: .05, from: 'random' }, clearProps: 'transform,opacity,scale,translate,rotate', scrollTrigger: { trigger: '#themeGrid', start: 'top 80%' } });

    // vídeo da noite cresce
    gsap.from('.night-vid', { scale: .82, rotate: -4, ease: 'none', scrollTrigger: { trigger: '.night', start: 'top bottom', end: 'center center', scrub: true } });

    // fotos do domicílio
    mm.add('(min-width: 901px)', () => {
      gsap.to('.hp1', { y: -40, ease: 'none', scrollTrigger: { trigger: '.home', scrub: true } });
      gsap.to('.hp2', { y: 50, ease: 'none', scrollTrigger: { trigger: '.home', scrub: true } });
      gsap.to('.hp3', { y: -20, ease: 'none', scrollTrigger: { trigger: '.home', scrub: true } });
    });

    ScrollTrigger.refresh();
  });
})();
