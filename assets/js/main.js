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

/* ── PLAYER DE VÍDEO LOCAL — modal com fundo borrado ── */
(function initVideoModal() {
  const openBtn  = document.getElementById('vidOpenBtn');
  const vidCard  = document.getElementById('vidCard');
  const modal    = document.getElementById('vidModal');
  const player   = document.getElementById('vidPlayer');
  const closeBtn = document.getElementById('vidClose');
  const inner    = modal ? modal.querySelector('.vid-inner') : null;

  if (!modal || !player) return;

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    player.play().catch(function() {}); /* autoplay pode ser bloqueado pelo browser */
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    player.pause();
  }

  /* Abrir ao clicar no botão play ou no card inteiro */
  if (openBtn) openBtn.addEventListener('click', function(e) { e.stopPropagation(); openModal(); });
  if (vidCard) vidCard.addEventListener('click', openModal);

  /* Fechar ao clicar no X */
  if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeModal(); });

  /* Fechar ao clicar fora do vídeo (no fundo borrado) */
  modal.addEventListener('click', function(e) {
    if (inner && !inner.contains(e.target)) closeModal();
  });

  /* Fechar com ESC */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
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
    { q: 'O que é LTCAT?',
      a: 'O Laudo Técnico das Condições Ambientais do Trabalho (LTCAT) é exigido pelo INSS e avalia a exposição do trabalhador a agentes nocivos. É necessário para fins de aposentadoria especial. Elaboramos com engenheiro ou médico do trabalho habilitado.' },
    { q: 'O que é PGR e PCMSO?',
      a: 'PGR (Programa de Gerenciamento de Riscos) substitui o PPRA, é obrigatório por lei e identifica riscos no ambiente de trabalho.\n\nPCMSO (Programa de Controle Médico de Saúde Ocupacional) define os exames médicos periódicos necessários para cada função.' },
    { q: 'Como funciona a locação de equipamentos?',
      a: 'Fornecemos EPIs, EPCs e equipamentos especializados por tempo determinado para:\n• Trabalho em altura\n• Espaço confinado\n• Resgate vertical\n• Operações industriais\nA locação inclui assistência técnica durante o período.' },
    { q: 'Fazem resgate e alpinismo industrial?',
      a: 'Sim! Temos equipes treinadas e certificadas para:\n• Resgate vertical em alturas e estruturas complexas\n• Inspeção de fachadas e estruturas industriais\n• Operações em silos, torres e grandes alturas\nTudo conforme NR-35 e normas ABNT.' },
    { q: 'Qual o prazo para entrega de laudos?',
      a: 'Em geral, laudos como LTCAT e PGR são entregues em 5 a 15 dias úteis após a vistoria técnica. O prazo exato depende do porte da empresa e é definido em contrato.' },
    { q: 'Como é emitido o certificado dos cursos?',
      a: 'Certificado digital válido em todo o Brasil, emitido após aprovação. Treinamentos presenciais e in company também incluem certificado físico. Na plataforma EAD, basta concluir as avaliações para receber o certificado online.' },
    { q: 'Atendem empresas de qualquer porte?',
      a: 'Sim! Atendemos desde MEIs e pequenas empresas até grandes plantas industriais. Temos soluções adequadas para cada realidade, com orçamentos personalizados.' },
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
