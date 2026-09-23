/* ============================================================
   GRUPO FIRE WORK — main.js
============================================================ */

/* ── SCROLL INSTANTÂNEO ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 68, behavior: 'instant' });
    const mm = document.getElementById('mmenu');
    if (mm && mm.classList.contains('open')) closeMob();
  });
});

/* ── NAV ── */
const nav = document.getElementById('nav');
if (nav) window.addEventListener('scroll', () => nav.classList.toggle('up', window.scrollY > 60), { passive: true });

/* ── ACTIVE SECTION ── */
const navLinks = document.querySelectorAll('.nl[href^="#"]');
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id));
    });
  }, { threshold: 0.2, rootMargin: '-68px 0px -35% 0px' }).observe(sec);
});

/* ── HAMBURGER ── */
const hbg   = document.getElementById('hbg');
const mmenu = document.getElementById('mmenu');
function closeMob() {
  if (hbg)   hbg.classList.remove('open');
  if (mmenu) mmenu.classList.remove('open');
  document.body.style.overflow = '';
}
if (hbg && mmenu) {
  hbg.addEventListener('click', () => {
    hbg.classList.toggle('open');
    mmenu.classList.toggle('open');
    document.body.style.overflow = mmenu.classList.contains('open') ? 'hidden' : '';
  });
}

/* ── GSAP ANIMATIONS (não-crítico — chatbot funciona mesmo sem GSAP) ── */
try {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.set('.hero-in > *', { opacity: 0, y: 22 });
    gsap.to('.hero-in > *',  { opacity: 1, y: 0, duration: .65, stagger: .1, ease: 'power2.out', delay: .1 });

    gsap.from('#svcGrid .svc-card', {
      scrollTrigger: { trigger: '#svcGrid', start: 'top 82%' },
      opacity: 0, y: 32, duration: .5, stagger: .06, ease: 'power2.out'
    });

    document.querySelectorAll('[data-anim="bottom"]').forEach(el =>
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 88%' }, opacity: 0, y: 26, duration: .6, ease: 'power2.out' })
    );
    document.querySelectorAll('[data-anim="left"]').forEach(el =>
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 82%' }, opacity: 0, x: -50, duration: .7, ease: 'power3.out' })
    );
    document.querySelectorAll('[data-anim="right"]').forEach(el =>
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 82%' }, opacity: 0, x: 50, duration: .7, ease: 'power3.out' })
    );
  }
} catch (e) {
  console.warn('GSAP não disponível — animações desativadas, resto do site normal.', e);
}

/* ── CARROSSEL com drag mouse + toque ── */
(function initCarousel() {
  const outer = document.getElementById('logosOuter');
  const track = document.getElementById('logosTrack');
  if (!track || !outer) return;

  setTimeout(() => {
    const originals = Array.from(track.querySelectorAll('.logo-box'));
    if (!originals.length) return;

    track.innerHTML = '';
    for (let s = 0; s < 8; s++) {
      originals.forEach(item => {
        const cl = item.cloneNode(true);
        if (s > 0) cl.setAttribute('aria-hidden', 'true');
        track.appendChild(cl);
      });
    }

    const ITEM_W = 200, GAP = 20, UNIT = ITEM_W + GAP;
    const SET_W  = originals.length * UNIT;
    track.style.width      = (SET_W * 8) + 'px';
    track.style.willChange = 'transform';
    track.querySelectorAll('img').forEach(img => {
      img.setAttribute('draggable', 'false');
      img.style.webkitUserDrag = 'none';
    });

    let pos      = 0;
    let paused   = false;
    const SPEED  = 0.28;

    /* ── mouse drag ── */
    let mouseDown = false, mStartX = 0, mDelta = 0;
    outer.addEventListener('mousedown', e => {
      mouseDown = true; paused = true;
      mStartX = e.clientX; mDelta = 0;
      outer.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!mouseDown) return;
      mDelta = e.clientX - mStartX;
      track.style.transform = 'translateX(' + (pos + mDelta) + 'px)';
    });
    document.addEventListener('mouseup', () => {
      if (!mouseDown) return;
      pos += mDelta;
      while (pos <= -SET_W) pos += SET_W;
      while (pos > 0)       pos -= SET_W;
      mDelta = 0; mouseDown = false; paused = false;
      outer.style.cursor = 'grab';
    });

    /* ── hover pause ── */
    outer.addEventListener('mouseenter', () => { if (!mouseDown) paused = true; });
    outer.addEventListener('mouseleave', () => { if (!mouseDown) paused = false; });

    /* ── touch drag ── */
    let touching   = false;
    let touchStart = 0, touchStartY = 0, touchDelta = 0;

    document.addEventListener('touchstart', e => {
      if (!outer.contains(e.target)) return;
      touching    = true; paused = true;
      touchStart  = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDelta  = 0;
    });
    document.addEventListener('touchmove', e => {
      if (!touching) return;
      const dx = e.touches[0].clientX - touchStart;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
      touchDelta = dx;
      track.style.transform = 'translateX(' + (pos + touchDelta) + 'px)';
    }, { passive: false });
    document.addEventListener('touchend', () => {
      if (!touching) return;
      pos      += touchDelta;
      while (pos <= -SET_W) pos += SET_W;
      while (pos > 0)       pos -= SET_W;
      touchDelta = 0; touching = false; paused = false;
    });

    /* ── auto-scroll ── */
    (function tick() {
      if (!paused && !mouseDown && !touching) {
        pos -= SPEED;
        if (pos <= -SET_W) pos += SET_W;
        track.style.transform = 'translateX(' + pos + 'px)';
      }
      requestAnimationFrame(tick);
    })();
  }, 400);
})();

/* ── PLAYER YOUTUBE EAD ── */
(function initEadVideo() {
  const videos = [
    {
      title: 'Grupo Fire Work — Segurança do Trabalho',
      thumb: 'https://img.youtube.com/vi/GKd5-o2HclE/maxresdefault.jpg',
      fb:    'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=700&q=80',
      url:   'https://youtu.be/GKd5-o2HclE?si=M6tmUzvj4No6O-ue'
    }
    /* Adicione mais vídeos aqui: { title:'...', thumb:'...', fb:'...', url:'...' } */
  ];

  let cur = 0;
  const screen  = document.getElementById('evcScreen');
  const thumb   = document.getElementById('evcThumb');
  const play    = document.getElementById('evcPlay');
  const counter = document.getElementById('evcCounter');
  const titleEl = document.getElementById('evcTitle');
  const prevBtn = document.getElementById('evcPrev');
  const nextBtn = document.getElementById('evcNext');
  const fill    = document.getElementById('ytFill');

  if (!screen) return;

  function render(i) {
    const v   = videos[i];
    thumb.src = v.thumb;
    thumb.onerror = () => { thumb.src = v.fb; thumb.onerror = null; };
    if (titleEl)   titleEl.textContent  = v.title;
    if (counter)   counter.textContent  = (i + 1) + ' / ' + videos.length;
    if (fill) { fill.style.animation = 'none'; void fill.offsetHeight; fill.style.animation = ''; }
    const open = () => window.open(v.url, '_blank');
    if (screen) screen.onclick = open;
    if (play)   play.onclick   = e => { e.stopPropagation(); open(); };
  }

  if (prevBtn) prevBtn.onclick = () => { cur = (cur - 1 + videos.length) % videos.length; render(cur); };
  if (nextBtn) nextBtn.onclick = () => { cur = (cur + 1) % videos.length; render(cur); };
  render(0);
})();

/* ── FORMULÁRIO WHATSAPP ── */
function enviarWpp(anchor) {
  const nome  = document.getElementById('f-nome').value.trim();
  const emp   = document.getElementById('f-emp').value.trim();
  const tel   = document.getElementById('f-tel').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const svc   = document.getElementById('f-svc').value;
  const msg   = document.getElementById('f-msg').value.trim();

  if (!nome) {
    const c = document.getElementById('f-nome');
    c.focus(); c.style.borderColor = '#C83300';
    c.placeholder = 'Campo obrigatório';
    setTimeout(() => { c.style.borderColor = ''; c.placeholder = 'Seu nome completo'; }, 2500);
    return false;
  }

  let txt = '*Contato via Site — Grupo Fire Work*\n\n';
  txt += 'Nome: '     + nome  + '\n';
  if (emp)   txt += 'Empresa: '   + emp   + '\n';
  if (tel)   txt += 'Telefone: '  + tel   + '\n';
  if (email) txt += 'E-mail: '    + email + '\n';
  if (svc)   txt += 'Serviço: '   + svc   + '\n';
  if (msg)   txt += '\nMensagem:\n' + msg;

  anchor.href = 'https://wa.me/5519994174009?text=' + encodeURIComponent(txt);
  return true;
}

/* ── CHATBOT ── */
(function initChat() {
  const cw  = document.getElementById('cw');
  const cwp = document.getElementById('cwp');
  const cwb = document.getElementById('cwb');
  const cwm = document.getElementById('cwm');
  const cwo = document.getElementById('cwo');

  /* Validação — não executa se algum elemento faltar */
  if (!cw || !cwp || !cwb || !cwm || !cwo) {
    console.warn('Chat: elemento não encontrado, bot desativado.');
    return;
  }

  const QA = [
    { q: 'Quais serviços vocês oferecem?',
      a: 'Trabalhamos com:\n• Elaboração de laudos (LTCAT, PCMSO, PGR)\n• Capacitação e treinamentos NR\n• Gestão SST + eSocial\n• Terceirização de profissionais\n• Locação e venda de equipamentos' },
    { q: 'Fazem treinamentos in company?',
      a: 'Sim! Realizamos treinamentos diretamente nas instalações da sua empresa, com toda a estrutura necessária.' },
    { q: 'O que é Pro Board / NFPA?',
      a: 'Programa de certificação reconhecido mundialmente. Somos uma das únicas empresas do Brasil com instrutores Pro Board/NFPA.' },
    { q: 'Atendem minha região?',
      a: 'Atuamos em 6 estados brasileiros. Informe sua cidade e verificamos disponibilidade.' },
    { q: 'Vocês têm cursos online?',
      a: 'Sim! Plataforma Fire Work — pague uma vez e acesse todos os cursos. Certificado digital incluso.\n\n👉 plataformafirework.com.br' },
    { q: 'Quais NRs vocês treinam?',
      a: 'NR-35 Trabalho em Altura · NR-33 Espaço Confinado · NR-10 Elétrica · NR-12 Máquinas · Brigada de Incêndio (Pro Board) · Primeiros Socorros' },
    { q: 'O que é gestão SST + eSocial?',
      a: 'Gerenciamos todo o SST no eSocial: S-2210, S-2220, S-2240, ASO, PPP e CAT. Sua empresa sem multa e em dia com a lei.' },
    { q: 'Vocês terceirizam profissionais?',
      a: 'Sim! Técnicos de Segurança, Médicos do Trabalho e Engenheiros de Segurança por tempo determinado.' },
    { q: 'Como solicitar orçamento?',
      a: 'Preencha o formulário abaixo e clique "Enviar via WhatsApp".\nOu ligue direto: (19) 99417-4009.' },
  ];

  let isOpen = false, greeted = false;

  function addMsg(txt, role) {
    const d = document.createElement('div');
    d.className   = role === 'bot' ? 'm-b' : 'm-u';
    d.textContent = txt;
    cwm.appendChild(d);
    cwm.scrollTop = cwm.scrollHeight;
  }

  function buildOpts() {
    cwo.innerHTML = '';
    QA.forEach(item => {
      const b       = document.createElement('button');
      b.className   = 'o-btn';
      b.textContent = item.q;
      b.addEventListener('click', () => {
        addMsg(item.q, 'user');
        b.remove();
        setTimeout(() => addMsg(item.a, 'bot'), 300);
      });
      cwo.appendChild(b);
    });
  }

  function openChat() {
    isOpen = true;
    cw.classList.add('open');
    cwp.classList.add('open');
    if (!greeted) {
      greeted = true;
      setTimeout(() => {
        addMsg('Olá! Selecione uma dúvida ou fale pelo WhatsApp.', 'bot');
        buildOpts();
      }, 280);
    }
  }

  function closeChat() {
    isOpen = false;
    cw.classList.remove('open');
    cwp.classList.remove('open');
  }

  cwb.addEventListener('click', e => {
    e.stopPropagation();
    isOpen ? closeChat() : openChat();
  });

  document.addEventListener('click', e => {
    if (isOpen && !cw.contains(e.target)) closeChat();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });
})();
