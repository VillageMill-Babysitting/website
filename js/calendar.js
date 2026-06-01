/**
 * VILLAGE MILL BABYSITTING — calendar.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable interactive availability calendar.
 * Reads window.AVAILABILITY_DATA (defined in data/availability.js)
 *
 * Usage:
 *   new AvailabilityCalendar('#container-id', {
 *     requestPage : 'booking.html', // page to link to for booking
 *     showBanner  : true,           // show selected-date banner
 *     onSelect    : (dateStr) => {} // optional callback
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

class AvailabilityCalendar {

  constructor(selector, options) {
    this.el = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!this.el) {
      console.warn('AvailabilityCalendar: container not found —', selector);
      return;
    }

    this.opts = Object.assign({
      requestPage : 'booking.html',
      showBanner  : true,
      onSelect    : null
    }, options || {});

    // Set today to midnight for accurate comparisons
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);

    // Start view on the current month
    this.view = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

    this.selected = null;

    // Load availability sets from the global data file
    const raw = window.AVAILABILITY_DATA || {};
    this.available = new Set(raw.available || []);
    this.booked    = new Set(raw.booked    || []);

    this._render();
  }

  /* ── Utilities ─────────────────────────────────────────────────────────── */

  _key(d) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  _status(d) {
    if (d < this.today)              return 'past';
    const k = this._key(d);
    if (this.booked.has(k))          return 'booked';
    if (this.available.has(k))       return 'available';
    return 'unavailable';
  }

  _longDate(dateStr) {
    return new Date(dateStr + 'T00:00:00')
      .toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
  }

  /* ── Main Render ───────────────────────────────────────────────────────── */

  _render() {
    const yr = this.view.getFullYear();
    const mo = this.view.getMonth();
    const monthLabel = new Date(yr, mo, 1)
      .toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const isCurrentMonth =
      yr === this.today.getFullYear() && mo === this.today.getMonth();

    this.el.innerHTML = `
      <div class="calendar-wrapper" role="application" aria-label="Babysitting availability calendar">

        <div class="calendar-header">
          <button class="cal-nav-btn" id="cal-prev" aria-label="Previous month"
            ${isCurrentMonth ? 'disabled style="opacity:.4;pointer-events:none"' : ''}>&#8249;</button>
          <h3 class="cal-title">${monthLabel}</h3>
          <button class="cal-nav-btn" id="cal-next" aria-label="Next month">&#8250;</button>
        </div>

        <div class="calendar-legend" role="list" aria-label="Calendar legend">
          <span class="legend-item" role="listitem">
            <span class="legend-dot legend-available" aria-hidden="true"></span>Available
          </span>
          <span class="legend-item" role="listitem">
            <span class="legend-dot legend-booked" aria-hidden="true"></span>Fully Booked
          </span>
          <span class="legend-item" role="listitem">
            <span class="legend-dot legend-past" aria-hidden="true"></span>Unavailable
          </span>
        </div>

        <div class="calendar-grid">
          <div class="calendar-days-header" role="row">
            ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
              .map(d => `<div class="cal-day-name" role="columnheader" abbr="${d}">${d}</div>`)
              .join('')}
          </div>
          <div class="calendar-dates" id="cal-dates-${yr}-${mo}" role="grid"></div>
        </div>

        ${this.opts.showBanner ? `
        <div class="selected-date-banner" id="cal-banner" role="status" aria-live="polite" aria-atomic="true">
          <span class="banner-icon" aria-hidden="true">✅</span>
          <div class="banner-text">
            <strong id="cal-banner-date">Date selected!</strong>
            <span>This date is available. Click below to continue.</span>
          </div>
          <a id="cal-banner-cta" href="#" class="btn btn-primary btn-sm">Book This Date →</a>
        </div>` : ''}

      </div>
    `;

    this._renderDates(yr, mo);
    this._bindNav();

    // Restore selected highlight if we navigated back to its month
    if (this.selected) {
      const [sy, sm] = this.selected.split('-').map(Number);
      if (sy === yr && sm === mo + 1) {
        const cell = this.el.querySelector(`[data-date="${this.selected}"]`);
        if (cell) cell.classList.add('cal-selected');
        this._showBanner(this.selected);
      }
    }
  }

  /* ── Date Grid ─────────────────────────────────────────────────────────── */

  _renderDates(yr, mo) {
    const grid        = this.el.querySelector('[id^="cal-dates-"]');
    const firstDay    = new Date(yr, mo, 1).getDay();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const todayKey    = this._key(this.today);
    let   html        = '';

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-date cal-empty" aria-hidden="true"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d      = new Date(yr, mo, day);
      const key    = this._key(d);
      const status = this._status(d);
      const isToday    = key === todayKey;
      const isSelected = key === this.selected;

      let cls   = 'cal-date';
      let attrs = '';
      let inner = `<span class="cal-day-num">${day}</span>`;
      let ariaLabel = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      switch (status) {
        case 'past':
          cls += ' cal-past';
          ariaLabel += ', past date';
          attrs = `aria-disabled="true"`;
          break;

        case 'booked':
          cls += ' cal-booked';
          ariaLabel += ', fully booked';
          attrs = `aria-disabled="true" data-date="${key}"`;
          inner += `<span class="cal-booked-label" aria-hidden="true">Booked</span>`;
          break;

        case 'available':
          cls += ' cal-available';
          ariaLabel += ', available — press Enter to select';
          attrs = `tabindex="0" role="button" data-date="${key}" aria-pressed="${isSelected}"`;
          break;

        default:
          cls += ' cal-unavailable';
          ariaLabel += ', not available';
          attrs = `aria-disabled="true"`;
      }

      if (isToday && !isSelected) cls += ' cal-today';
      if (isSelected && status === 'available') cls += ' cal-selected';

      html += `<div class="${cls}" ${attrs} aria-label="${ariaLabel}">${inner}</div>`;
    }

    grid.innerHTML = html;

    // Bind events on available dates
    grid.querySelectorAll('.cal-available').forEach(cell => {
      cell.addEventListener('click', () => this._select(cell.dataset.date));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._select(cell.dataset.date);
        }
        // Arrow key navigation
        if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
          e.preventDefault();
          const cells = Array.from(grid.querySelectorAll('.cal-date:not(.cal-empty)'));
          const idx   = cells.indexOf(cell);
          const map   = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
          const next  = cells[idx + map[e.key]];
          if (next) next.focus();
        }
      });
    });
  }

  /* ── Selection & Banner ────────────────────────────────────────────────── */

  _select(dateStr) {
    this.selected = dateStr;

    // Clear previous highlight
    this.el.querySelectorAll('.cal-selected').forEach(el => {
      el.classList.remove('cal-selected');
      el.setAttribute('aria-pressed', 'false');
    });

    // Apply new highlight
    const cell = this.el.querySelector(`[data-date="${dateStr}"]`);
    if (cell) {
      cell.classList.add('cal-selected');
      cell.setAttribute('aria-pressed', 'true');
    }

    this._showBanner(dateStr);

    if (typeof this.opts.onSelect === 'function') {
      this.opts.onSelect(dateStr);
    }
  }

  _showBanner(dateStr) {
    const banner  = this.el.querySelector('#cal-banner');
    const label   = this.el.querySelector('#cal-banner-date');
    const cta     = this.el.querySelector('#cal-banner-cta');
    if (!banner) return;

    if (label) label.textContent = this._longDate(dateStr) + ' is available!';
    if (cta)   cta.href = `${this.opts.requestPage}?date=${encodeURIComponent(dateStr)}`;

    banner.classList.add('visible');
  }

  /* ── Navigation ────────────────────────────────────────────────────────── */

  _bindNav() {
    const prev = this.el.querySelector('#cal-prev');
    const next = this.el.querySelector('#cal-next');

    if (prev) {
      prev.addEventListener('click', () => {
        const candidate = new Date(this.view.getFullYear(), this.view.getMonth() - 1, 1);
        const floor     = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
        if (candidate >= floor) { this.view = candidate; this._render(); }
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        this.view = new Date(this.view.getFullYear(), this.view.getMonth() + 1, 1);
        this._render();
      });
    }
  }
}

// Expose globally so HTML pages can instantiate
window.AvailabilityCalendar = AvailabilityCalendar;
