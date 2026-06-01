/**
 * VILLAGE MILL BABYSITTING — babysitters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches babysitter profiles from Firestore via getBabysitters() in
 * firebase-app.js. Falls back to window.BABYSITTERS_DATA (data/babysitters.js)
 * if Firestore is unavailable or the collection is empty.
 *
 * The `photo` field in Firestore should be a full URL — either:
 *   - A Firebase Storage download URL
 *   - Any public image URL
 * If the field is missing or the image fails to load, a placeholder initial
 * tile is shown automatically.
 *
 * Exposed globals (called from HTML pages with plain <script> tags):
 *   window.renderFeaturedBabysitters(containerId)
 *     — Renders up to 3 featured:true compact cards (home page)
 *
 *   window.initBabysittersPage()
 *     — Renders all full profile cards with live search + filter
 *       (babysitters.html). Fetches from Firestore on first call.
 *
 *   window.loadBabysittersIntoSelects(selectIds)
 *     — Populates one or more <select> elements with sitter names
 *       (used by booking form, dashboard, reviews form)
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function _esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Safely read an array field — Firestore arrays come back as JS arrays already */
function _arr(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

/** Placeholder image URL using the sitter's first initial */
function _placeholder(name) {
  const initial = encodeURIComponent((name || '?')[0].toUpperCase());
  return `https://placehold.co/300x300/D4EEDA/245233?text=${initial}`;
}

/** Placeholder for profile-sized images */
function _placeholderLg(name) {
  const initial = encodeURIComponent((name || '?')[0].toUpperCase());
  return `https://placehold.co/260x320/D4EEDA/245233?text=${initial}`;
}

/** Trigger IntersectionObserver fade-in on newly inserted cards */
function _animateCards(container) {
  if (!window.IntersectionObserver) {
    container.querySelectorAll('.animate-in').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.05 });
  container.querySelectorAll('.animate-in').forEach(el => obs.observe(el));
}

/** Show a loading skeleton in a container */
function _showLoading(container, cols = 1) {
  const style = cols > 1 ? `grid-column:1/-1` : '';
  container.innerHTML = `
    <div class="db-loading" style="${style};justify-content:center;padding:48px 24px">
      <span class="spinner" style="width:24px;height:24px;border-width:2.5px"></span>
      <span style="color:var(--text-light);font-size:.9rem">Loading babysitters…</span>
    </div>`;
}

/** Show an error state */
function _showError(container, msg, cols = 1) {
  const style = cols > 1 ? `grid-column:1/-1` : '';
  container.innerHTML = `
    <div class="empty-state" style="${style}">
      <span class="empty-icon" style="font-size:36px;opacity:.5">&#9888;</span>
      <h3>Could not load babysitters</h3>
      <p>${_esc(msg)}</p>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATA LOADING
   Tries Firestore first, falls back to window.BABYSITTERS_DATA
   ═══════════════════════════════════════════════════════════════════════════ */

/** In-memory cache so pages don't re-fetch on every call */
let _cache = null;

async function _loadSitters() {
  if (_cache) return _cache;

  // Try Firestore (firebase-app.js exports getBabysitters as an ES module,
  // but babysitters.js is a classic script — we read it from window if the
  // page has already imported it, otherwise fall back to static data)
  if (typeof window._getBabysitters === 'function') {
    try {
      const data = await window._getBabysitters();
      if (data && data.length) {
        _cache = data;
        // Keep window.BABYSITTERS_DATA in sync for legacy callers
        window.BABYSITTERS_DATA = data;
        return _cache;
      }
    } catch (err) {
      console.warn('[babysitters.js] Firestore fetch failed, using static data.', err);
    }
  }

  // Static fallback
  _cache = window.BABYSITTERS_DATA || [];
  return _cache;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARD RENDERERS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Compact card — used on the home page grid */
function _compactCard(s) {
  const certs = _arr(s.certifications).slice(0, 2)
    .map(c => `<span class="cert-chip">&#10003; ${_esc(c)}</span>`).join('');

  const photo = s.photo || _placeholder(s.name);
  const alt   = s.photoAlt || `${s.name}, babysitter`;

  return `
    <article class="sitter-card animate-in" aria-label="${_esc(s.name)}, babysitter profile">
      <div class="sitter-card-img-wrap">
        <img
          class="sitter-card-img"
          src="${_esc(photo)}"
          alt="${_esc(alt)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${_placeholder(s.name)}'">
        <div class="sitter-badge-wrap">
          <span class="sitter-badge" aria-label="Rated ${s.rating || 'N/A'} out of 5">
            <span class="star" aria-hidden="true">&#9733;</span> ${s.rating ?? ''}
          </span>
        </div>
      </div>
      <div class="sitter-card-body">
        <h3 class="sitter-card-name">${_esc(s.name)}</h3>
        <div class="sitter-card-meta">
          <span class="sitter-meta-chip">${_esc(s.experience)} yrs exp</span>
          <span class="sitter-meta-chip">${_esc(s.availability || 'Flexible')}</span>
        </div>
        <p class="sitter-card-desc">${_esc(s.shortBio || '')}</p>
        <div class="sitter-certs" aria-label="Certifications">${certs}</div>
        <a href="babysitters.html#sitter-${_esc(s.id)}"
           class="btn btn-secondary btn-sm"
           style="margin-top:4px">
          View Profile
        </a>
      </div>
    </article>`;
}

/** Full profile card — used on the babysitters page */
function _profileCard(s) {
  const certs = _arr(s.certifications)
    .map(c => `<span class="cert-chip">&#10003; ${_esc(c)}</span>`).join('');

  const specs = _arr(s.specialties)
    .map(sp => `<span class="specialty-chip">${_esc(sp)}</span>`).join('');

  const photo     = s.photo || _placeholderLg(s.name);
  const alt       = s.photoAlt || `${s.name}, babysitter`;
  const firstName = (s.name || 'Sitter').split(' ')[0];
  const reviews   = s.reviewCount ? `(${s.reviewCount} review${s.reviewCount !== 1 ? 's' : ''})` : '';

  return `
    <article
      class="sitter-profile-card animate-in"
      id="sitter-${_esc(s.id)}"
      aria-label="${_esc(s.name)} full profile">

      <div class="sitter-profile-img-col">
        <img
          class="sitter-profile-img"
          src="${_esc(photo)}"
          alt="${_esc(alt)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${_placeholderLg(s.name)}'">
        <div class="sitter-profile-overlay">
          <div class="sitter-profile-rating" aria-label="Rating: ${s.rating ?? 'N/A'} out of 5">
            <span aria-hidden="true">&#9733;</span>
            <strong>${s.rating ?? '—'}</strong>
            <span>${reviews}</span>
          </div>
        </div>
      </div>

      <div class="sitter-profile-body">
        <h2 class="sitter-profile-name">${_esc(s.name)}</h2>
        <p class="sitter-profile-tagline">${_esc(s.shortBio || '')}</p>

        <div class="sitter-profile-details">
          ${s.age ? `
          <span class="sitter-detail-item">
            Age ${_esc(String(s.age))}
          </span>` : ''}
          <span class="sitter-detail-item">
            ${_esc(String(s.experience ?? 0))} yrs experience
          </span>
          <span class="sitter-detail-item">
            ${_esc(s.availability || 'Flexible')}
          </span>
        </div>

        <p class="sitter-profile-bio">${_esc(s.bio || '')}</p>

        ${specs ? `<div class="sitter-specialties" aria-label="Specialties">${specs}</div>` : ''}
        ${certs ? `<div class="sitter-certs" aria-label="Certifications" style="margin-top:12px">${certs}</div>` : ''}

        <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
          <a href="booking.html?sitter=${encodeURIComponent(s.name)}"
             class="btn btn-primary btn-sm">
            Book ${_esc(firstName)}
          </a>
          <a href="reviews.html?sitter=${encodeURIComponent(s.name)}"
             class="btn btn-secondary btn-sm">
            Read Reviews
          </a>
        </div>
      </div>
    </article>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: renderFeaturedBabysitters(containerId)
   Called by index.html after the module sets window._getBabysitters
   ═══════════════════════════════════════════════════════════════════════════ */
async function renderFeaturedBabysitters(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  _showLoading(container, 3);

  let data;
  try {
    data = await _loadSitters();
  } catch (err) {
    _showError(container, err.message, 3);
    return;
  }

  const featured = data.filter(s => s.featured).slice(0, 3);

  if (!featured.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <h3>Babysitters Coming Soon</h3>
        <p>Check back shortly to meet our team.</p>
      </div>`;
    return;
  }

  container.innerHTML = featured.map(_compactCard).join('');
  _animateCards(container);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: initBabysittersPage()
   Called by babysitters.html — renders full profile cards with search/filter
   ═══════════════════════════════════════════════════════════════════════════ */
async function initBabysittersPage() {
  const grid    = document.getElementById('babysitters-grid');
  const search  = document.getElementById('sitter-search');
  const avlFil  = document.getElementById('sitter-availability');
  const countEl = document.getElementById('sitter-count');

  if (!grid) return;

  _showLoading(grid);

  let data;
  try {
    data = await _loadSitters();
  } catch (err) {
    _showError(grid, err.message);
    return;
  }

  /** Render a filtered subset */
  function _render(list) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No sitters match your search</h3>
          <p>Try a different name, specialty, or availability.</p>
        </div>`;
    } else {
      grid.innerHTML = list.map(_profileCard).join('');
      _animateCards(grid);
    }
    if (countEl) {
      countEl.textContent = `${list.length} sitter${list.length !== 1 ? 's' : ''}`;
    }
  }

  /** Apply search + availability filter */
  function _filter() {
    const q  = (search?.value ?? '').toLowerCase().trim();
    const av = (avlFil?.value ?? '').toLowerCase();

    _render(data.filter(s => {
      const searchable = [
        s.name,
        s.shortBio,
        s.bio,
        ..._arr(s.specialties),
        ..._arr(s.certifications)
      ].join(' ').toLowerCase();

      const matchQ = !q || searchable.includes(q);
      const matchA = !av || (s.availability || '').toLowerCase().includes(av);
      return matchQ && matchA;
    }));
  }

  // Initial full render
  _render(data);

  // Wire filters
  search?.addEventListener('input', _filter);
  avlFil?.addEventListener('change', _filter);

  // Scroll to anchor hash if present (#sitter-<id>)
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const navH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
        ) || 68;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - navH - 12,
          behavior: 'smooth'
        });
      }
    }, 400);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: loadBabysittersIntoSelects(selectIds)
   Populates any number of <select> elements with sitter name options.
   Called by booking.html, dashboard.html, reviews.html after data is ready.
   ═══════════════════════════════════════════════════════════════════════════ */
async function loadBabysittersIntoSelects(selectIds = []) {
  let data;
  try {
    data = await _loadSitters();
  } catch {
    return; // silently skip — selects stay at their default option
  }

  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    // Don't duplicate if already populated
    if (sel.options.length > 1) return;
    data.forEach(s => {
      const opt = document.createElement('option');
      opt.value       = s.name;
      opt.textContent = `${s.name}${s.experience ? ` (${s.experience} yrs)` : ''}`;
      sel.appendChild(opt);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPOSE TO WINDOW
   These are called from plain <script> blocks in HTML pages.
   The ES module bridge in each page sets window._getBabysitters so this
   classic script can reach Firestore without being a module itself.
   ═══════════════════════════════════════════════════════════════════════════ */
window.renderFeaturedBabysitters  = renderFeaturedBabysitters;
window.initBabysittersPage        = initBabysittersPage;
window.loadBabysittersIntoSelects = loadBabysittersIntoSelects;
