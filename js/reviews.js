/**
 * VILLAGE MILL BABYSITTING — reviews.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads window.REVIEWS_DATA (data/reviews.js) as a static fallback.
 * When window._getAllReviews is set by the Firebase module bridge on a page,
 * it fetches live reviews from Firestore instead.
 *
 * Exposed globals:
 *   window.renderFeaturedReviews(containerId)  — home page featured cards
 *   window.initReviewsPage()                   — full reviews page
 *
 * PERSISTENCE:
 *   Reviews submitted on the Reviews page are saved to Firestore via
 *   submitReview() (firebase-app.js) when a user is logged in.
 *   Anonymous submissions fall back to in-memory only for the session.
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function _esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function _initials(name) {
  return name.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function _fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function _starsHtml(rating) {
  let html = `<span class="sr-only">${rating} out of 5 stars</span>`;
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= rating ? 'star-filled' : 'star-empty'}" aria-hidden="true">${i <= rating ? '★' : '☆'}</span>`;
  }
  return html;
}

const AVATAR_BG = ['#367A4A','#245233','#2E6840','#3DAF78','#C9984A','#4A9660','#1C3D29'];

function _avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
}

function _animateCards(container) {
  if (!window.IntersectionObserver) {
    container.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.06 });
  container.querySelectorAll('.animate-in').forEach(el => obs.observe(el));
}

/* ── Card renderer ─────────────────────────────────────────────────────────── */

function _reviewCard(r) {
  const color = _avatarColor(r.reviewer);
  return `
    <article class="review-card animate-in" aria-label="Review by ${_esc(r.reviewer)}">
      <div class="review-stars" aria-label="${r.rating} out of 5 stars">
        ${_starsHtml(r.rating)}
      </div>
      <p class="review-text">&ldquo;${_esc(r.text)}&rdquo;</p>
      <footer class="review-footer">
        <div class="review-avatar"
             style="background:${color}"
             aria-hidden="true"
             title="${_esc(r.reviewer)}">${_initials(r.reviewer)}</div>
        <div>
          <p class="review-meta-name" style="margin:0">${_esc(r.reviewer)}</p>
          <p class="review-meta-sitter" style="margin:0">reviewed ${_esc(r.babysitter)}</p>
        </div>
        <time class="review-date" datetime="${r.date}">${_fmtDate(r.date)}</time>
      </footer>
    </article>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: Featured reviews for the home page
   ═══════════════════════════════════════════════════════════════════════════ */
function renderFeaturedReviews(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data     = window.REVIEWS_DATA || [];
  const featured = data.filter(r => r.featured).slice(0, 3);

  if (!featured.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-icon" aria-hidden="true">💬</span>
        <h3>Reviews Coming Soon</h3>
        <p>Be the first to share your experience!</p>
      </div>`;
    return;
  }

  container.innerHTML = featured.map(_reviewCard).join('');
  _animateCards(container);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: Full reviews page — search, filter, sort, add review
   ═══════════════════════════════════════════════════════════════════════════ */
function initReviewsPage() {
  const grid         = document.getElementById('reviews-grid');
  const searchInput  = document.getElementById('review-search');
  const sitterFilter = document.getElementById('review-sitter-filter');
  const sortSelect   = document.getElementById('review-sort');
  const countEl      = document.getElementById('review-count');

  if (!grid) return;

  // Mutable working copy — new submissions are prepended here
  let live = [...(window.REVIEWS_DATA || [])];

  // Pre-filter if URL has ?sitter=Name (coming from a babysitter profile)
  const urlParams  = new URLSearchParams(window.location.search);
  const urlSitter  = urlParams.get('sitter') || '';

  // Populate sitter filter <select> — use async helper if available, else static data
  async function _populateSitterFilter() {
    let sitters = [];
    if (typeof window.loadBabysittersIntoSelects === 'function') {
      await window.loadBabysittersIntoSelects(['review-sitter-filter']);
    } else if (window.BABYSITTERS_DATA) {
      (window.BABYSITTERS_DATA || []).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name; opt.textContent = s.name;
        if (sitterFilter) sitterFilter.appendChild(opt);
      });
    }
    if (sitterFilter && urlSitter) sitterFilter.value = urlSitter;
  }
  _populateSitterFilter();

  /* ── Render grid ───────────────────────────────────────────────────────── */
  function _render(list) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon" aria-hidden="true">🔍</span>
          <h3>No reviews match your search</h3>
          <p>Try adjusting the filters, or be the first to leave a review!</p>
        </div>`;
    } else {
      grid.innerHTML = list.map(_reviewCard).join('');
      _animateCards(grid);
    }
    if (countEl) countEl.textContent = list.length + ' review' + (list.length !== 1 ? 's' : '');
  }

  /* ── Filter + sort ─────────────────────────────────────────────────────── */
  function _update() {
    const q  = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const sf = sitterFilter ? sitterFilter.value : '';
    const so = sortSelect   ? sortSelect.value   : 'newest';

    let results = live.filter(r => {
      const mq = !q
        || r.reviewer.toLowerCase().includes(q)
        || r.babysitter.toLowerCase().includes(q)
        || r.text.toLowerCase().includes(q);
      const ms = !sf || r.babysitter === sf;
      return mq && ms;
    });

    if      (so === 'highest') results.sort((a,b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
    else if (so === 'lowest')  results.sort((a,b) => a.rating - b.rating || new Date(b.date) - new Date(a.date));
    else                       results.sort((a,b) => new Date(b.date) - new Date(a.date));

    _render(results);
  }

  // Initial render
  _update();

  if (searchInput)  searchInput.addEventListener('input',  _update);
  if (sitterFilter) sitterFilter.addEventListener('change', _update);
  if (sortSelect)   sortSelect.addEventListener('change',   _update);

  /* ── Add Review form ───────────────────────────────────────────────────── */
  const addForm     = document.getElementById('add-review-form');
  const addSuccess  = document.getElementById('add-review-success');
  const addError    = document.getElementById('add-review-error');

  if (!addForm) return;

  // Populate babysitter select in the add-review form
  if (typeof window.loadBabysittersIntoSelects === 'function') {
    window.loadBabysittersIntoSelects(['ar-babysitter']);
  } else if (window.BABYSITTERS_DATA) {
    const sitterSel = addForm.querySelector('#ar-babysitter');
    if (sitterSel) {
      (window.BABYSITTERS_DATA || []).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name; opt.textContent = s.name;
        sitterSel.appendChild(opt);
      });
    }
  }

  // Clear error highlight on input
  addForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('input', () => {
      const g = el.closest('.form-group');
      if (g) g.classList.remove('has-error');
      if (addError) addError.classList.remove('visible');
    });
  });

  addForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nameVal   = (addForm.querySelector('#ar-name').value   || '').trim();
    const sitterVal = (sitterSel                                 ? sitterSel.value : '');
    const textVal   = (addForm.querySelector('#ar-text').value   || '').trim();

    // Get selected star rating
    let ratingVal = 0;
    addForm.querySelectorAll('input[name="ar-rating"]').forEach(inp => {
      if (inp.checked) ratingVal = parseInt(inp.value);
    });

    let valid = true;

    // Validate text fields
    [
      { sel: '#ar-name',       val: nameVal },
      { sel: '#ar-babysitter', val: sitterVal },
      { sel: '#ar-text',       val: textVal }
    ].forEach(({ sel, val }) => {
      const el  = addForm.querySelector(sel);
      const grp = el ? el.closest('.form-group') : null;
      if (!val) { if (grp) grp.classList.add('has-error'); valid = false; }
    });

    // Validate rating
    const ratingGroup = addForm.querySelector('.star-rating-group');
    if (!ratingVal) {
      if (ratingGroup) ratingGroup.classList.add('has-error');
      valid = false;
    } else {
      if (ratingGroup) ratingGroup.classList.remove('has-error');
    }

    if (!valid) {
      if (addError) { addError.textContent = 'Please fill in all fields and choose a star rating.'; addError.classList.add('visible'); }
      return;
    }

    if (addError) addError.classList.remove('visible');

    // Build new review
    const newReview = {
      id        : live.length + 1000,
      reviewer  : nameVal,
      babysitter: sitterVal,
      rating    : ratingVal,
      date      : new Date().toISOString().split('T')[0],
      text      : textVal,
      featured  : false
    };

    live.unshift(newReview);
    _update();

    // Show success
    if (addSuccess) addSuccess.classList.add('visible');
    addForm.reset();

    setTimeout(() => {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  });
}

/* ── Expose ────────────────────────────────────────────────────────────────── */
window.renderFeaturedReviews = renderFeaturedReviews;
window.initReviewsPage       = initReviewsPage;
