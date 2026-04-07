// ===========================
//  ÖFFNUNGSZEITEN LOGIK
// ===========================
function isOpen() {
  const now   = new Date();
  const day   = now.getDay();
  const time  = now.getHours() * 60 + now.getMinutes();

  const MO_AM_S = 8*60+30, MO_AM_E = 13*60;
  const MO_PM_S = 14*60+30, MO_PM_E = 18*60;
  const SA_S = 9*60, SA_E = 13*60;

  if (day === 0) return { status: 'closed', label: 'Heute geschlossen' };

  if (day === 6) {
    if (time >= SA_S && time < SA_E) return { status: 'open',   label: 'Geöffnet · bis 13:00 Uhr' };
    if (time < SA_S)                 return { status: 'closed',  label: 'Öffnet um 09:00 Uhr' };
    return { status: 'closed', label: 'Heute geschlossen' };
  }

  if (time >= MO_AM_S && time < MO_AM_E) return { status: 'open',   label: 'Geöffnet · bis 13:00 Uhr' };
  if (time >= MO_AM_E && time < MO_PM_S) return { status: 'pause',  label: 'Mittagspause · öffnet 14:30 Uhr' };
  if (time >= MO_PM_S && time < MO_PM_E) return { status: 'open',   label: 'Geöffnet · bis 18:00 Uhr' };
  if (time < MO_AM_S)                    return { status: 'closed',  label: 'Öffnet um 08:30 Uhr' };
  return { status: 'closed', label: 'Heute geschlossen' };
}

function updateStatus() {
  const { status, label } = isOpen();

  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (dot && text) { dot.className = 'status-dot ' + status; text.textContent = label; }

  const liveDot = document.getElementById('liveStatusDot');
  const liveMsg = document.getElementById('liveStatusMsg');
  if (liveDot && liveMsg) {
    if (status === 'open') {
      liveDot.style.cssText = 'background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.3);animation:pulse 2s infinite';
    } else if (status === 'pause') {
      liveDot.style.cssText = 'background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.3)';
    } else {
      liveDot.style.cssText = 'background:#f87171';
    }
    liveMsg.textContent = 'Aktuell: ' + label;
  }
}

// ===========================
//  SCROLL PROGRESS BAR
// ===========================
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

// ===========================
//  NAVBAR SHRINK ON SCROLL
// ===========================
function initNavbarShrink() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

// ===========================
//  COUNTER ANIMATION
// ===========================
function countUp(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter-value');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        countUp(el, target, 1600);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
}

// ===========================
//  STAGGERED CARD ANIMATIONS
// ===========================
function initStaggeredCards() {
  const cards = document.querySelectorAll('.leistung-card, .review-card, .oz-card, .stat-item');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, _) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  // Group cards by their parent container and stagger within groups
  const groups = new Map();
  cards.forEach(card => {
    const parent = card.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(card);
  });

  groups.forEach(group => {
    group.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = `opacity .5s ease ${i * 90}ms, transform .5s ease ${i * 90}ms`;
      obs.observe(card);
    });
  });
}

// ===========================
//  BACK TO TOP
// ===========================
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===========================
//  BUTTON RIPPLE EFFECT
// ===========================
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', function(e) {
      const rect  = btn.getBoundingClientRect();
      const size  = Math.max(rect.width, rect.height) * 2;
      const x     = e.clientX - rect.left - size / 2;
      const y     = e.clientY - rect.top  - size / 2;
      const span  = document.createElement('span');
      span.className = 'ripple-el';
      span.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
      btn.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    });
  });
}

// ===========================
//  MOBILE NAV TOGGLE
// ===========================
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// ===========================
//  SECTION TAG REVEAL
// ===========================
function initSectionTags() {
  const tags = document.querySelectorAll('.section-tag');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  tags.forEach(tag => {
    tag.style.opacity = '0';
    tag.style.transform = 'translateY(12px)';
    tag.style.transition = 'opacity .4s ease, transform .4s ease';
    obs.observe(tag);
  });
}

// ===========================
//  INIT ALL
// ===========================
updateStatus();
setInterval(updateStatus, 60_000);

initScrollProgress();
initNavbarShrink();
initCounters();
initStaggeredCards();
initBackToTop();
initRipple();
initMobileNav();
initSectionTags();
