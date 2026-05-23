/* ============================================================
   TALENTFORGE — MAIN JAVASCRIPT
   ============================================================ */

'use strict';

// ── PAGE LOADER ──────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) loader.classList.add('hidden');
  }, 600);
});

// ── NAV SCROLL STATE ─────────────────────────────────────────
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── ACTIVE NAV LINK ──────────────────────────────────────────
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}
setActiveNav();

// ── MOBILE MENU ──────────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

// ── SCROLL REVEAL ────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

function initReveal() {
  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (el.dataset.delay) {
      el.style.transitionDelay = el.dataset.delay;
    }
    revealObserver.observe(el);
  });
}
document.addEventListener('DOMContentLoaded', initReveal);

// ── TOAST NOTIFICATIONS ──────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, duration);
}
window.showToast = showToast;

// ── MODAL HELPERS ────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}
window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── TABS ─────────────────────────────────────────────────────
function initTabs(containerSelector) {
  document.querySelectorAll(containerSelector || '.tabs').forEach(tabs => {
    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.tab;
        const parent = tabs.closest('[data-tabs-container]') || document;
        tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = parent.querySelector(`#tab-${panel}`);
        if (target) target.classList.add('active');
      });
    });
  });
}
document.addEventListener('DOMContentLoaded', () => initTabs());

// ── ANIMATED COUNTER ─────────────────────────────────────────
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const isDecimal = String(target).includes('.');
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = target * ease;
    el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCounter(e.target, parseFloat(e.target.dataset.target), 1800);
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
});

// ── SCORE RING ───────────────────────────────────────────────
function drawScoreRing(el, score, maxScore = 100) {
  const pct = score / maxScore;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#FF9340' : '#EF4444';
  el.innerHTML = `
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="10"
        stroke-dasharray="${dash} ${circ}" stroke-linecap="round"
        style="transition: stroke-dasharray 1.2s ease"/>
    </svg>
    <span class="score-value" style="color:${color}">${score}</span>
    <span class="score-label">/ ${maxScore}</span>
  `;
}
window.drawScoreRing = drawScoreRing;

// ── FORM VALIDATION ──────────────────────────────────────────
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const val = field.value.trim();
    const group = field.closest('.form-group');
    const err = group?.querySelector('.form-error');
    if (!val || (field.type === 'email' && !validateEmail(val))) {
      field.style.borderColor = 'var(--error)';
      if (err) err.style.display = 'block';
      valid = false;
    } else {
      field.style.borderColor = '';
      if (err) err.style.display = 'none';
    }
  });
  return valid;
}
window.validateForm = validateForm;

// ── LOCAL STORAGE HELPERS ────────────────────────────────────
const TF = {
  get: key => { try { return JSON.parse(localStorage.getItem('tf_' + key)); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem('tf_' + key, JSON.stringify(val)); } catch {} },
  remove: key => localStorage.removeItem('tf_' + key),
  isLoggedIn: () => !!TF.get('user'),
  getUser: () => TF.get('user'),
};
window.TF = TF;

// ── AUTH STATE UI ────────────────────────────────────────────
function updateAuthUI() {
  const user = TF.getUser();
  const loginBtn = document.getElementById('nav-login-btn');
  const userMenu = document.getElementById('nav-user-menu');
  const userName = document.getElementById('nav-user-name');
  if (loginBtn && userMenu) {
    if (user) {
      loginBtn.style.display = 'none';
      userMenu.style.display = 'flex';
      if (userName) userName.textContent = user.name?.split(' ')[0] || 'User';
    } else {
      loginBtn.style.display = 'block';
      userMenu.style.display = 'none';
    }
  }
  // Update CTA buttons
  document.querySelectorAll('[data-auth-cta]').forEach(el => {
    if (user) {
      el.textContent = el.dataset.authCta || 'Go to Dashboard';
      el.href = el.dataset.authHref || 'dashboard.html';
    }
  });
}
document.addEventListener('DOMContentLoaded', updateAuthUI);

// ── LOGOUT ───────────────────────────────────────────────────
function logout() {
  TF.remove('user');
  showToast('Signed out successfully', 'success');
  setTimeout(() => window.location.href = 'index.html', 800);
}
window.logout = logout;

// ── SPARKS GENERATOR ─────────────────────────────────────────
function initSparks(container, count = 8) {
  if (!container) return;
  const positions = [18, 28, 38, 50, 60, 70, 80, 90];
  const dxs = [28, -22, 16, -30, 22, -18, 24, -26];
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.cssText = `--x:${positions[i%positions.length]}%;--d:${2.6+i*.3}s;--delay:${i*.25}s;--dx:${dxs[i%dxs.length]}px;--s:${i%3===0?3:2}px`;
    container.appendChild(s);
  }
}
window.initSparks = initSparks;

// ── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────────────
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
});

console.log('%cTALENTFORGE', 'font-size:24px;font-weight:bold;color:#FF6B1A;');
console.log('%cForge Your Future — v1.0.0', 'color:#8A9BB0;');
