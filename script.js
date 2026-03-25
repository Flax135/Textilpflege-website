// ===========================
//  ÖFFNUNGSZEITEN LOGIK
// ===========================
function isOpen() {
  const now   = new Date();
  const day   = now.getDay();   // 0=So, 1=Mo, …, 6=Sa
  const hours = now.getHours();
  const mins  = now.getMinutes();
  const time  = hours * 60 + mins;

  const OPEN_MOFR_AM_START  = 8  * 60 + 30;  // 08:30
  const OPEN_MOFR_AM_END    = 13 * 60;        // 13:00
  const OPEN_MOFR_PM_START  = 14 * 60 + 30;  // 14:30
  const OPEN_MOFR_PM_END    = 18 * 60;        // 18:00
  const OPEN_SA_START       = 9  * 60;        // 09:00
  const OPEN_SA_END         = 13 * 60;        // 13:00

  // Sonntag: geschlossen
  if (day === 0) return { status: 'closed', label: 'Heute geschlossen' };

  // Samstag
  if (day === 6) {
    if (time >= OPEN_SA_START && time < OPEN_SA_END) return { status: 'open', label: 'Geöffnet · bis 13:00 Uhr' };
    if (time < OPEN_SA_START)  return { status: 'closed', label: `Öffnet um 09:00 Uhr` };
    return { status: 'closed', label: 'Heute geschlossen' };
  }

  // Mo–Fr
  if (time >= OPEN_MOFR_AM_START && time < OPEN_MOFR_AM_END)
    return { status: 'open', label: 'Geöffnet · bis 13:00 Uhr' };

  if (time >= OPEN_MOFR_AM_END && time < OPEN_MOFR_PM_START)
    return { status: 'pause', label: 'Mittagspause · öffnet 14:30 Uhr' };

  if (time >= OPEN_MOFR_PM_START && time < OPEN_MOFR_PM_END)
    return { status: 'open', label: 'Geöffnet · bis 18:00 Uhr' };

  if (time < OPEN_MOFR_AM_START)
    return { status: 'closed', label: 'Öffnet um 08:30 Uhr' };

  return { status: 'closed', label: 'Heute geschlossen' };
}

function updateStatus() {
  const { status, label } = isOpen();

  // Hero badge
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (dot && text) {
    dot.className  = 'status-dot ' + status;
    text.textContent = label;
  }

  // Öffnungszeiten section live bar
  const liveDot = document.getElementById('liveStatusDot');
  const liveMsg = document.getElementById('liveStatusMsg');
  if (liveDot && liveMsg) {
    liveDot.className = 'live-dot';
    if (status === 'open') {
      liveDot.style.background = '#4ade80';
      liveDot.style.boxShadow  = '0 0 0 3px rgba(74,222,128,.3)';
      liveDot.style.animation  = 'pulse 2s infinite';
    } else if (status === 'pause') {
      liveDot.style.background = '#f59e0b';
      liveDot.style.boxShadow  = '0 0 0 3px rgba(245,158,11,.3)';
      liveDot.style.animation  = '';
    } else {
      liveDot.style.background = '#f87171';
      liveDot.style.boxShadow  = 'none';
      liveDot.style.animation  = '';
    }
    liveMsg.textContent = 'Aktuell: ' + label;
  }
}

// ===========================
//  MOBILE NAV TOGGLE
// ===========================
const navToggle = document.querySelector('.nav-toggle');
const mainNav   = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isVisible = mainNav.style.display === 'flex';
    mainNav.style.display = isVisible ? 'none' : 'flex';
    mainNav.style.flexDirection = 'column';
    mainNav.style.position = 'absolute';
    mainNav.style.top = '68px';
    mainNav.style.left = '0';
    mainNav.style.right = '0';
    mainNav.style.background = '#fff';
    mainNav.style.padding = '12px 24px 20px';
    mainNav.style.borderBottom = '1px solid #e4e8ed';
    mainNav.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
    mainNav.style.zIndex = '99';
    if (isVisible) mainNav.style.display = 'none';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { mainNav.style.display = 'none'; });
  });
}

// ===========================
//  SCROLL ANIMATION
// ===========================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.leistung-card, .review-card, .oz-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// Init
updateStatus();
// Refresh every minute
setInterval(updateStatus, 60_000);
