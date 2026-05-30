/**
 * LITTLE STARS CARE — forms.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the Booking Request Form (request.html) and
 * the Contact / Support Form (support.html).
 *
 * HOW TO ENABLE EMAIL NOTIFICATIONS (Formspree):
 *  1. Create a free account at https://formspree.io
 *  2. Click "New Form", give it a name, and copy the Form ID shown
 *     (looks like:  xpwzdkrv)
 *  3. Replace the placeholder strings below with your real IDs.
 *  4. Formspree will email every submission to your registered address.
 *
 * While the IDs contain "YOUR_", forms run in DEMO MODE — validation
 * works and a success message appears, but nothing is emailed.
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

/* ── ❶  CONFIGURATION ──────────────────────────────────────────────────────── */
const BOOKING_FORM_ID = 'YOUR_BOOKING_FORM_ID'; // ← replace, e.g. 'xpwzdkrv'
const CONTACT_FORM_ID = 'YOUR_CONTACT_FORM_ID'; // ← replace, e.g. 'mqkwjpvn'

/* ── Shared helpers ─────────────────────────────────────────────────────────── */

const _v = s => (s || '').trim();

const _isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const _isPhone = s => /^[\d\s\-+().]{7,}$/.test(s);

function _setErr(el, msg) {
  const g = el && el.closest('.form-group');
  if (!g) return;
  g.classList.add('has-error');
  const fe = g.querySelector('.field-error');
  if (fe) fe.textContent = msg;
}

function _clearErr(el) {
  const g = el && el.closest('.form-group');
  if (g) g.classList.remove('has-error');
}

function _autoClear(form) {
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('input',  () => _clearErr(el));
    el.addEventListener('change', () => _clearErr(el));
  });
}

function _setLoading(btn, on) {
  if (!btn) return;
  btn.disabled    = on;
  btn.textContent = on ? 'Sending…' : (btn.dataset.label || 'Submit');
}

async function _post(id, payload) {
  if (id.startsWith('YOUR_')) {
    // Demo mode — no network request
    return new Promise(res => setTimeout(() => res({ ok: true }), 850));
  }
  return fetch(`https://formspree.io/f/${id}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(payload)
  });
}

function _scrollTo(el) {
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKING REQUEST FORM  (request.html)
   ═══════════════════════════════════════════════════════════════════════════ */
function initBookingForm() {
  const form = document.getElementById('booking-request-form');
  if (!form) return;

  const successEl = document.getElementById('booking-success');
  const errorEl   = document.getElementById('booking-error');
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.dataset.label = submitBtn.textContent.trim();

  /* ── Pre-fill from URL params (?date=YYYY-MM-DD&sitter=Name) ─────────── */
  const params    = new URLSearchParams(window.location.search);
  const urlDate   = params.get('date');
  const urlSitter = params.get('sitter');

  const dateInput = form.querySelector('#req-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
    if (urlDate) {
      dateInput.value = urlDate;
      // Show a confirmation of the pre-filled date
      const hint = form.querySelector('#req-date-hint');
      if (hint && urlDate) {
        const nice = new Date(urlDate + 'T00:00:00')
          .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        hint.textContent = '✅ Pre-filled from calendar: ' + nice;
      }
    }
  }

  /* ── Populate babysitter dropdown ────────────────────────────────────── */
  const sitterSel = form.querySelector('#req-sitter');
  if (sitterSel && window.BABYSITTERS_DATA) {
    window.BABYSITTERS_DATA.forEach(s => {
      const opt = document.createElement('option');
      opt.value       = s.name;
      opt.textContent = s.name + ' (' + s.experience + ' yrs exp)';
      sitterSel.appendChild(opt);
    });
    if (urlSitter && sitterSel.querySelector(`option[value="${CSS.escape(urlSitter)}"]`)) {
      sitterSel.value = urlSitter;
    }
  }

  _autoClear(form);

  /* ── Validate ─────────────────────────────────────────────────────────── */
  function validate() {
    let ok = true;
    [
      { id: '#req-name',  test: v => v.length >= 2,  msg: 'Please enter your full name (at least 2 characters).'  },
      { id: '#req-email', test: _isEmail,             msg: 'Please enter a valid email address.'                    },
      { id: '#req-phone', test: _isPhone,             msg: 'Please enter a valid phone number.'                     },
      { id: '#req-ages',  test: v => v.length >= 1,  msg: 'Please enter your child\'s age(s).'                    },
      { id: '#req-date',  test: v => !!v,             msg: 'Please select a date.'                                  },
      { id: '#req-time',  test: v => !!v,             msg: 'Please select a preferred time.'                        },
    ].forEach(({ id, test, msg }) => {
      const el = form.querySelector(id);
      if (!el) return;
      if (!test(_v(el.value))) { _setErr(el, msg); ok = false; }
    });
    return ok;
  }

  /* ── Submit ──────────────────────────────────────────────────────────── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (successEl) successEl.classList.remove('visible');
    if (errorEl)   errorEl.classList.remove('visible');

    if (!validate()) {
      const first = form.querySelector('.has-error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    _setLoading(submitBtn, true);

    const payload = {
      parent_name      : _v(form.querySelector('#req-name').value),
      email            : _v(form.querySelector('#req-email').value),
      phone            : _v(form.querySelector('#req-phone').value),
      child_ages       : _v(form.querySelector('#req-ages').value),
      requested_date   : _v(dateInput ? dateInput.value : ''),
      preferred_time   : _v(form.querySelector('#req-time').value),
      preferred_sitter : sitterSel ? _v(sitterSel.value) || 'No preference' : 'No preference',
      special_notes    : _v(form.querySelector('#req-instructions') ? form.querySelector('#req-instructions').value : ''),
      _subject         : 'New Babysitting Request — ' + _v(dateInput ? dateInput.value : 'Date TBD')
    };

    try {
      const resp = await _post(BOOKING_FORM_ID, payload);
      if (resp.ok) {
        form.reset();
        if (successEl) { successEl.classList.add('visible'); _scrollTo(successEl); }
      } else {
        const msg = 'Something went wrong. Please try again or email us directly at hello@littlestarscare.com.';
        if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('visible'); }
      }
    } catch {
      if (errorEl) { errorEl.textContent = 'Network error — please check your connection and try again.'; errorEl.classList.add('visible'); }
    } finally {
      _setLoading(submitBtn, false);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT / SUPPORT FORM  (support.html)
   ═══════════════════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successEl = document.getElementById('contact-success');
  const errorEl   = document.getElementById('contact-error');
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.dataset.label = submitBtn.textContent.trim();

  _autoClear(form);

  function validate() {
    let ok = true;
    [
      { id: '#con-name',    test: v => v.length >= 2,   msg: 'Please enter your name.'                               },
      { id: '#con-email',   test: _isEmail,              msg: 'Please enter a valid email address.'                   },
      { id: '#con-subject', test: v => v.length >= 3,   msg: 'Please enter a subject line.'                          },
      { id: '#con-message', test: v => v.length >= 10,  msg: 'Please write a message (at least 10 characters).'     }
    ].forEach(({ id, test, msg }) => {
      const el = form.querySelector(id);
      if (!el) return;
      if (!test(_v(el.value))) { _setErr(el, msg); ok = false; }
    });
    return ok;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (successEl) successEl.classList.remove('visible');
    if (errorEl)   errorEl.classList.remove('visible');
    if (!validate()) return;

    _setLoading(submitBtn, true);

    const payload = {
      name    : _v(form.querySelector('#con-name').value),
      email   : _v(form.querySelector('#con-email').value),
      subject : _v(form.querySelector('#con-subject').value),
      message : _v(form.querySelector('#con-message').value),
      _subject: 'Support Request — ' + _v(form.querySelector('#con-subject').value)
    };

    try {
      const resp = await _post(CONTACT_FORM_ID, payload);
      if (resp.ok) {
        form.reset();
        if (successEl) { successEl.classList.add('visible'); _scrollTo(successEl); }
      } else {
        if (errorEl) { errorEl.textContent = 'Something went wrong. Please try again.'; errorEl.classList.add('visible'); }
      }
    } catch {
      if (errorEl) { errorEl.textContent = 'Network error. Please try again.'; errorEl.classList.add('visible'); }
    } finally {
      _setLoading(submitBtn, false);
    }
  });
}

/* ── Expose ────────────────────────────────────────────────────────────────── */
window.initBookingForm = initBookingForm;
window.initContactForm = initContactForm;
