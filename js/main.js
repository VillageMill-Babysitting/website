/**
 * VILLAGE MILL BABYSITTING — main.js
 * Mobile menu, scroll header, active nav, scroll animations, counters
 */
'use strict';

/* ── Mobile Menu ─────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', close));

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function close() {
    nav.classList.remove('nav-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ── Scroll Header ───────────────────────────────────────────────────────── */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const fn = () => header.classList.toggle('scrolled', window.scrollY > 6);
  window.addEventListener('scroll', fn, { passive: true });
  fn();
}

/* ── Active Nav Link ─────────────────────────────────────────────────────── */
function initActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href  = link.getAttribute('href') || '';
    const match = href === page || (page === '' && href === 'index.html');
    link.classList.toggle('active', match);
    if (match) link.setAttribute('aria-current', 'page');
  });
}

/* ── Scroll Animations ───────────────────────────────────────────────────── */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
  document.querySelectorAll('.animate-in').forEach(el => obs.observe(el));
}

/* ── Counters ────────────────────────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const duration = 1100;
  const start    = performance.now();
  const decimal  = String(target).includes('.');
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (decimal ? (e * target).toFixed(1) : Math.floor(e * target)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
}

/* ── Smooth Scroll ───────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - offset - 14, behavior: 'smooth' });
      }
    });
  });
}

/* ── Helpers exposed to other scripts ────────────────────────────────────── */
window.renderStars = function(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="${i < Math.round(rating) ? 'star-filled' : 'star-empty'}" aria-hidden="true">${i < Math.round(rating) ? '★' : '☆'}</span>`
  ).join('');
};

window.formatDate = function(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

window.esc = function(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};

/* ── FAQ Accordion ───────────────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

/* ── Init ────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollHeader();
  initActiveNav();
  initScrollAnimations();
  initSmoothScroll();
  initCounters();
  initFAQ();
});
