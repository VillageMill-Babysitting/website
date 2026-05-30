/**
 * LITTLE STARS CARE — main.js
 * Handles: mobile menu, scroll header, active nav, scroll animations, smooth scroll
 */

/* ─── Mobile Menu ─────────────────────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.classList.toggle('is-active');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when a nav link is tapped
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on click outside
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  function closeMenu() {
    nav.classList.remove('nav-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}


/* ─── Scroll Header Shadow ────────────────────────────────────────────────── */
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const handler = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', handler, { passive: true });
  handler(); // run once on load
}


/* ─── Highlight Active Nav Link ────────────────────────────────────────────── */
function initActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    const match = href === page || (page === '' && href === 'index.html');
    link.classList.toggle('active', match);
    if (match) link.setAttribute('aria-current', 'page');
  });
}


/* ─── IntersectionObserver Scroll Animations ──────────────────────────────── */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    document.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}


/* ─── Smooth Scroll for Anchor Links ─────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h')) || 70;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}


/* ─── Animated Number Counter ─────────────────────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = eased * target;
    el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
}


/* ─── Render Star Display ─────────────────────────────────────────────────── */
function renderStars(rating, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += i <= Math.round(rating)
      ? '<span class="star-filled" aria-hidden="true">★</span>'
      : '<span class="star-empty"  aria-hidden="true">☆</span>';
  }
  return html;
}

// Expose for other scripts
window.renderStars = renderStars;


/* ─── Date Formatting ─────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

window.formatDate = formatDate;


/* ─── Init All ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollHeader();
  initActiveNav();
  initScrollAnimations();
  initSmoothScroll();
  initCounters();
});
