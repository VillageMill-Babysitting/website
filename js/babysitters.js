/**
 * LITTLE STARS CARE — babysitters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads window.BABYSITTERS_DATA (defined in data/babysitters.js)
 *
 * Exposed globals:
 *   window.renderFeaturedBabysitters(containerId)   — home page compact cards
 *   window.initBabysittersPage()                    — full babysitters page
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

/* ── Scroll animation observer ─────────────────────────────────────────────── */
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

/* ── Compact card (home page) ──────────────────────────────────────────────── */
function _compactCard(s) {
  const certHtml = s.certifications.slice(0, 2)
    .map(c => `<span class="cert-chip">✓ ${_esc(c)}</span>`).join('');

  return `
    <article class="sitter-card animate-in" aria-label="${_esc(s.name)} babysitter">
      <div class="sitter-card-img-wrap">
        <img class="sitter-card-img"
             src="${_esc(s.photo)}"
             alt="${_esc(s.photoAlt)}"
             loading="lazy"
             onerror="this.src='https://placehold.co/300x300/C0D9F5/1A4A8A?text=${encodeURIComponent(s.name[0])}'">
        <div class="sitter-badge-wrap">
          <span class="sitter-badge" aria-label="Rated ${s.rating} out of 5">
            <span class="star" aria-hidden="true">★</span> ${s.rating}
          </span>
        </div>
      </div>
      <div class="sitter-card-body">
        <h3 class="sitter-card-name">${_esc(s.name)}</h3>
        <div class="sitter-card-meta">
          <span class="sitter-meta-chip">👩‍👧 ${s.experience} yrs exp</span>
          <span class="sitter-meta-chip">🕐 ${_esc(s.availability)}</span>
        </div>
        <p class="sitter-card-desc">${_esc(s.shortBio)}</p>
        <div class="sitter-certs" aria-label="Certifications">${certHtml}</div>
        <a href="babysitters.html#sitter-${s.id}" class="btn btn-secondary btn-sm" style="margin-top:4px">
          View Profile →
        </a>
      </div>
    </article>`;
}

/* ── Full profile card (babysitters page) ─────────────────────────────────── */
function _profileCard(s) {
  const certHtml = s.certifications
    .map(c => `<span class="cert-chip">✓ ${_esc(c)}</span>`).join('');

  const specHtml = s.specialties
    .map(sp => `<span class="specialty-chip">${_esc(sp)}</span>`).join('');

  const firstName = s.name.split(' ')[0];

  return `
    <article class="sitter-profile-card animate-in" id="sitter-${s.id}"
             aria-label="${_esc(s.name)} full profile">
      <div class="sitter-profile-img-col">
        <img class="sitter-profile-img"
             src="${_esc(s.photo)}"
             alt="${_esc(s.photoAlt)}"
             loading="lazy"
             onerror="this.src='https://placehold.co/260x320/C0D9F5/1A4A8A?text=${encodeURIComponent(s.name[0])}'">
        <div class="sitter-profile-overlay">
          <div class="sitter-profile-rating">
            <span aria-hidden="true">★</span>
            <strong>${s.rating}</strong>
            <span>(${s.reviewCount} reviews)</span>
          </div>
        </div>
      </div>
      <div class="sitter-profile-body">
        <h2 class="sitter-profile-name">${_esc(s.name)}</h2>
        <p class="sitter-profile-tagline">${_esc(s.shortBio)}</p>
        <div class="sitter-profile-details">
          ${s.age ? `<span class="sitter-detail-item"><span class="sitter-detail-icon" aria-hidden="true">🎂</span> Age ${s.age}</span>` : ''}
          <span class="sitter-detail-item">
            <span class="sitter-detail-icon" aria-hidden="true">⭐</span>
            ${s.experience} years experience
          </span>
          <span class="sitter-detail-item">
            <span class="sitter-detail-icon" aria-hidden="true">🕐</span>
            ${_esc(s.availability)}
          </span>
        </div>
        <p class="sitter-profile-bio">${_esc(s.bio)}</p>
        <div class="sitter-specialties" aria-label="Specialties">${specHtml}</div>
        <div class="sitter-certs" aria-label="Certifications" style="margin-top:12px">${certHtml}</div>
        <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap">
          <a href="request.html?sitter=${encodeURIComponent(s.name)}"
             class="btn btn-primary btn-sm">Book ${_esc(firstName)}</a>
          <a href="reviews.html?sitter=${encodeURIComponent(s.name)}"
             class="btn btn-secondary btn-sm">Read Reviews</a>
        </div>
      </div>
    </article>`;
}

/* ── Helper: HTML-escape ───────────────────────────────────────────────────── */
function _esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: Featured cards for the home page
   ═══════════════════════════════════════════════════════════════════════════ */
function renderFeaturedBabysitters(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const data     = window.BABYSITTERS_DATA || [];
  const featured = data.filter(s => s.featured).slice(0, 3);

  if (!featured.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-icon" aria-hidden="true">👩‍👧</span>
        <h3>Babysitters Coming Soon</h3>
        <p>Check back shortly to meet our team.</p>
      </div>`;
    return;
  }

  container.innerHTML = featured.map(_compactCard).join('');
  _animateCards(container);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC: Full babysitters page with search / filter
   ═══════════════════════════════════════════════════════════════════════════ */
function initBabysittersPage() {
  const grid   = document.getElementById('babysitters-grid');
  const search = document.getElementById('sitter-search');
  const avlFil = document.getElementById('sitter-availability');
  const countEl= document.getElementById('sitter-count');

  if (!grid) return;

  const data = window.BABYSITTERS_DATA || [];

  function _render(list) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon" aria-hidden="true">🔍</span>
          <h3>No sitters match your search</h3>
          <p>Try a different name, specialty, or availability option.</p>
        </div>`;
    } else {
      grid.innerHTML = list.map(_profileCard).join('');
      _animateCards(grid);
    }
    if (countEl) {
      countEl.textContent = list.length + ' sitter' + (list.length !== 1 ? 's' : '');
    }
  }

  function _filter() {
    const q  = (search ? search.value : '').toLowerCase().trim();
    const av = avlFil ? avlFil.value.toLowerCase() : '';

    _render(data.filter(s => {
      const matchQ = !q
        || s.name.toLowerCase().includes(q)
        || s.shortBio.toLowerCase().includes(q)
        || s.bio.toLowerCase().includes(q)
        || s.specialties.some(sp => sp.toLowerCase().includes(q))
        || s.certifications.some(c => c.toLowerCase().includes(q));
      const matchA = !av || s.availability.toLowerCase().includes(av);
      return matchQ && matchA;
    }));
  }

  // Initial render
  _render(data);

  // Scroll to anchor if URL has #sitter-N
  if (window.location.hash) {
    setTimeout(() => {
      const t = document.querySelector(window.location.hash);
      if (t) {
        const top = t.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 350);
  }

  if (search) search.addEventListener('input', _filter);
  if (avlFil) avlFil.addEventListener('change', _filter);
}

/* ── Expose ────────────────────────────────────────────────────────────────── */
window.renderFeaturedBabysitters = renderFeaturedBabysitters;
window.initBabysittersPage       = initBabysittersPage;
