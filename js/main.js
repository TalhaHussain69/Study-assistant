/* ============================================================
   STUDY ASSISTANT — MAIN JS
   Custom cursor, scroll progress, theme toggle, utilities,
   toast system, modal, FAQ, scroll reveal, ripple
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   CUSTOM CURSOR
────────────────────────────────────────────────────────── */
const initCursor = () => {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if ('ontouchstart' in window) { dot.style.display = ring.style.display = 'none'; return; }

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  const smoothRing = () => {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(smoothRing);
  };
  smoothRing();

  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });
};

/* ──────────────────────────────────────────────────────────
   SCROLL PROGRESS BAR
────────────────────────────────────────────────────────── */
const initScrollProgress = () => {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const update = () => {
    const el = document.documentElement;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    bar.style.width = Math.min(100, pct) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
};

/* ──────────────────────────────────────────────────────────
   THEME TOGGLE (Dark / Light)
────────────────────────────────────────────────────────── */
const initTheme = () => {
  const saved = localStorage.getItem('sa-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sa-theme', next);
      updateThemeIcons(next);
    });
  });
  updateThemeIcons(saved);
};

const updateThemeIcons = theme => {
  document.querySelectorAll('[data-theme-icon]').forEach(el => {
    el.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
};

/* ──────────────────────────────────────────────────────────
   BUTTON RIPPLE
────────────────────────────────────────────────────────── */
const initRipple = () => {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const rx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    const ry = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    btn.style.setProperty('--rx', rx);
    btn.style.setProperty('--ry', ry);
  });
};

/* ──────────────────────────────────────────────────────────
   TOAST SYSTEM
────────────────────────────────────────────────────────── */
const ICONS = {
  success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️'
};

window.toast = (message, type = 'info', duration = 3500) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="toast-icon">${ICONS[type] || 'ℹ️'}</span>
    <span style="flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--txt-muted);font-size:16px;cursor:pointer;padding:0 0 0 8px;line-height:1">×</button>
    <div class="toast-bar"></div>
  `;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, duration);
};

/* ──────────────────────────────────────────────────────────
   MODAL SYSTEM
────────────────────────────────────────────────────────── */
window.openModal = (id) => {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(id);
  }, { once: true });
};

window.closeModal = (id) => {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
};

// ESC key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

/* ──────────────────────────────────────────────────────────
   FAQ ACCORDION
────────────────────────────────────────────────────────── */
const initFAQ = () => {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Open clicked (unless was already open)
      if (!isOpen) item.classList.add('open');
    });
  });
};

/* ──────────────────────────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────────────────────────── */
const initScrollReveal = () => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
};

/* ──────────────────────────────────────────────────────────
   NAVBAR SCROLL STATE (Landing)
────────────────────────────────────────────────────────── */
const initNavbar = () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', update, { passive: true });
  update();
};

/* ──────────────────────────────────────────────────────────
   MOBILE NAV TOGGLE
────────────────────────────────────────────────────────── */
const initMobileNav = () => {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
};

/* ──────────────────────────────────────────────────────────
   SIDEBAR TOGGLE (Dashboard)
────────────────────────────────────────────────────────── */
const initSidebar = () => {
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  const hamburger= document.querySelector('.hamburger');
  if (!sidebar || !hamburger) return;

  const close = () => { sidebar.classList.remove('open'); overlay && overlay.classList.remove('show'); document.body.style.overflow = ''; };
  const open  = () => { sidebar.classList.add('open');    overlay && overlay.classList.add('show');    document.body.style.overflow = 'hidden'; };

  hamburger.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);
};

/* ──────────────────────────────────────────────────────────
   NOTIFICATION PANEL
────────────────────────────────────────────────────────── */
const initNotifications = () => {
  const btn   = document.getElementById('notif-btn');
  const panel = document.getElementById('notif-panel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', e => e.stopPropagation());
};

/* ──────────────────────────────────────────────────────────
   COUNTER ANIMATION (Stats)
────────────────────────────────────────────────────────── */
const animateCounters = () => {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals || 0;
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = (ease * target).toFixed(decimals);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

const initCounters = () => {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        obs.disconnect();
      }
    });
  }, { threshold: .3 });

  els.forEach(el => obs.observe(el));
};

/* ──────────────────────────────────────────────────────────
   PRICING TOGGLE (Monthly / Annual)
────────────────────────────────────────────────────────── */
const initPricingToggle = () => {
  const toggle = document.getElementById('pricing-toggle');
  if (!toggle) return;

  const prices = {
    monthly: { starter: '0', pro: '19', team: '49' },
    annual:  { starter: '0', pro: '15', team: '39' }
  };

  toggle.addEventListener('change', () => {
    const mode = toggle.checked ? 'annual' : 'monthly';
    document.querySelectorAll('[data-price]').forEach(el => {
      el.textContent = prices[mode][el.dataset.price] || el.textContent;
    });
    document.querySelectorAll('[data-billing]').forEach(el => {
      el.textContent = toggle.checked ? '/mo billed annually' : '/month';
    });
  });
};

/* ──────────────────────────────────────────────────────────
   SMOOTH ANCHOR LINKS
────────────────────────────────────────────────────────── */
const initSmoothLinks = () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

/* ──────────────────────────────────────────────────────────
   ACTIVE NAV LINK (Dashboard)
────────────────────────────────────────────────────────── */
const initActiveNavLink = () => {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
};

/* ──────────────────────────────────────────────────────────
   SVG CHART DRAWING (Dashboard)
────────────────────────────────────────────────────────── */
window.drawLineChart = (svgId, datasets, labels) => {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const W = svg.viewBox.baseVal.width  || 600;
  const H = svg.viewBox.baseVal.height || 180;
  const PAD = { t: 10, r: 20, b: 30, l: 40 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const allVals = datasets.flatMap(d => d.values);
  const maxVal  = Math.max(...allVals) * 1.1 || 100;

  const xScale = i => PAD.l + (i / (labels.length - 1)) * chartW;
  const yScale = v => PAD.t + chartH - (v / maxVal) * chartH;

  // Grid lines
  [0, .25, .5, .75, 1].forEach(t => {
    const y = PAD.t + (1 - t) * chartH;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', PAD.l); line.setAttribute('x2', W - PAD.r);
    line.setAttribute('y1', y);     line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(255,255,255,.06)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  });

  // X labels
  labels.forEach((label, i) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', xScale(i));
    text.setAttribute('y', H - 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'rgba(255,255,255,.35)');
    text.setAttribute('font-size', '10');
    text.textContent = label;
    svg.appendChild(text);
  });

  // Datasets
  datasets.forEach((dataset, di) => {
    const points = dataset.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
    const firstX = xScale(0), lastX = xScale(dataset.values.length - 1);
    const baseY  = PAD.t + chartH;

    // Gradient fill
    const gradId = `chartGrad${svgId}${di}`;
    const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svg.firstChild);
    defs.innerHTML += `
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="${dataset.color}" stop-opacity=".3"/>
        <stop offset="100%" stop-color="${dataset.color}" stop-opacity="0"/>
      </linearGradient>`;

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    area.setAttribute('points', `${firstX},${baseY} ${points} ${lastX},${baseY}`);
    area.setAttribute('fill', `url(#${gradId})`);
    svg.appendChild(area);

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', dataset.color);
    polyline.setAttribute('stroke-width', '2.5');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');

    const totalLength = polyline.getTotalLength ? polyline.getTotalLength() : 1000;
    polyline.setAttribute('stroke-dasharray', totalLength);
    polyline.setAttribute('stroke-dashoffset', totalLength);
    polyline.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)';
    svg.appendChild(polyline);

    // Dots
    dataset.values.forEach((v, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', xScale(i));
      circle.setAttribute('cy', yScale(v));
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', dataset.color);
      circle.setAttribute('stroke', 'var(--bg-surface, #13132b)');
      circle.setAttribute('stroke-width', '2');
      circle.style.opacity = '0';
      circle.style.transition = `opacity .3s ease ${.1 * i + 1.2}s`;
      svg.appendChild(circle);
      setTimeout(() => { circle.style.opacity = '1'; }, 100);
    });

    setTimeout(() => { polyline.style.strokeDashoffset = '0'; }, 200);
  });
};

/* ──────────────────────────────────────────────────────────
   PROGRESS CIRCLES
────────────────────────────────────────────────────────── */
window.setProgressCircle = (id, pct) => {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  const circle = wrap.querySelector('.progress-circle-fill');
  const label  = wrap.querySelector('.progress-circle-pct');
  if (!circle) return;
  const r = circle.r ? circle.r.baseVal.value : 36;
  const circumference = 2 * Math.PI * r;
  circle.style.strokeDasharray  = circumference;
  circle.style.strokeDashoffset = circumference * (1 - pct / 100);
  if (label) label.textContent = pct + '%';
};

/* ──────────────────────────────────────────────────────────
   BAR CHART (simple SVG)
────────────────────────────────────────────────────────── */
window.drawBarChart = (svgId, data, labels, color) => {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const W = 300, H = 120;
  const PAD = { t: 8, r: 8, b: 24, l: 8 };
  const bW = (W - PAD.l - PAD.r) / data.length;
  const maxVal = Math.max(...data) * 1.1 || 1;

  data.forEach((val, i) => {
    const bH = ((val / maxVal) * (H - PAD.t - PAD.b));
    const x  = PAD.l + i * bW + bW * .15;
    const y  = H - PAD.b - bH;
    const w  = bW * .7;
    const r  = Math.min(4, w / 2);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', H - PAD.b);
    rect.setAttribute('width', w);
    rect.setAttribute('height', 0);
    rect.setAttribute('rx', r);
    rect.setAttribute('fill', color || '#6C63FF');
    rect.setAttribute('opacity', '.8');
    svg.appendChild(rect);

    // Animate
    setTimeout(() => {
      rect.style.transition = `y .6s ease ${i * .08}s, height .6s ease ${i * .08}s`;
      rect.setAttribute('y', y);
      rect.setAttribute('height', bH);
    }, 100);

    if (labels && labels[i]) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + w / 2);
      text.setAttribute('y', H - 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'rgba(255,255,255,.3)');
      text.setAttribute('font-size', '9');
      text.textContent = labels[i];
      svg.appendChild(text);
    }
  });
};

/* ──────────────────────────────────────────────────────────
   DONUT CHART
────────────────────────────────────────────────────────── */
window.drawDonut = (svgId, segments) => {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const cx = 60, cy = 60, r = 44, strokeW = 14;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, b) => a + b.value, 0);
  let offset = circ / 4;

  segments.forEach(seg => {
    const dash = (seg.value / total) * circ;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', seg.color);
    circle.setAttribute('stroke-width', strokeW);
    circle.setAttribute('stroke-dasharray', `${dash} ${circ - dash}`);
    circle.setAttribute('stroke-dashoffset', offset);
    circle.setAttribute('stroke-linecap', 'round');
    circle.style.transition = 'stroke-dasharray .8s ease';
    svg.appendChild(circle);
    offset -= dash;
  });
};

/* ──────────────────────────────────────────────────────────
   INIT ALL
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollProgress();
  initTheme();
  initRipple();
  initFAQ();
  initScrollReveal();
  initNavbar();
  initMobileNav();
  initSidebar();
  initNotifications();
  initCounters();
  initPricingToggle();
  initSmoothLinks();
  initActiveNavLink();
  console.log('%c🎓 Study Assistant Dashboard Loaded', 'color:#6C63FF;font-size:14px;font-weight:bold');
});