/**
 * Contact form: native constraints plus progressive, non-intrusive error feedback.
 * Errors appear only after interaction (blur/change or a submit attempt) and are
 * cleared as soon as the user fixes the value. Demo only — replace the timeout
 * with a real POST to the form's action endpoint.
 */
export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');
  if (!status || !button) return;

  const fields = [...form.querySelectorAll('input, select, textarea')];
  fields.forEach((el) => el.setAttribute('aria-invalid', 'false'));

  // Reference the error only while it is shown: text in aria-describedby is
  // announced even when hidden, so a static reference would leak it from load.
  const linkError = (el, shown) => {
    const id = el.dataset.error;
    if (!id) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((value) => value && value !== id);
    if (shown) ids.push(id);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  // One polite region for the page; per-field live regions are unreliable.
  const announcer = document.createElement('div');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  document.body.append(announcer);

  let announceTimer;
  const announced = new WeakSet();

  const announceError = (el) => {
    const error = document.getElementById(el.dataset.error || '');
    if (!error) return;
    const label = el.labels?.[0]?.textContent?.replace(/\s+/g, ' ').trim() || '';
    clearTimeout(announceTimer);
    announcer.textContent = '';
    // Let the screen reader finish announcing the field that received focus.
    announceTimer = window.setTimeout(() => {
      announcer.textContent = `${label}: ${error.textContent.trim()}`.trim();
    }, 500);
  };

  const flagged = new WeakSet();

  const syncAria = (el, announce = false) => {
    if (!el.matches?.('input, select, textarea')) return;
    const invalid =
      el.matches(':user-invalid') || el.classList.contains('user-invalid-fallback');

    if (invalid) {
      if (announce && !announced.has(el)) {
        announceError(el);
        announced.add(el);
      }
      el.setAttribute('aria-invalid', 'true');
      linkError(el, true);
      flagged.add(el);
    } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
      el.setAttribute('aria-invalid', 'false');
      linkError(el, false);
      flagged.delete(el);
      announced.delete(el);
    }
  };

  // :user-invalid is Baseline widely available, but keep a tiny dirty-state
  // fallback so older browsers still defer errors until blur or submit.
  if (!CSS.supports('selector(:user-invalid)')) {
    const dirty = new WeakMap();

    form.addEventListener(
      'blur',
      (event) => {
        const el = event.target;
        if (!el.matches?.('input, select, textarea')) return;
        const state = dirty.get(el) || { typed: false, blurred: false };
        state.blurred = true;
        dirty.set(el, state);
        if (state.typed) {
          el.classList.toggle('user-invalid-fallback', !el.validity.valid);
          syncAria(el, true);
        }
      },
      true
    );

    form.addEventListener('input', (event) => {
      const el = event.target;
      if (!el.matches?.('input, select, textarea')) return;
      const state = dirty.get(el) || { typed: false, blurred: false };
      state.typed = true;
      dirty.set(el, state);
      if (state.blurred) {
        el.classList.toggle('user-invalid-fallback', !el.validity.valid);
        syncAria(el);
      }
    });
  }

  form.addEventListener('blur', (event) => syncAria(event.target, true), true);
  form.addEventListener('input', (event) => {
    if (event.target.hasAttribute('aria-invalid')) syncAria(event.target);
  });
  form.addEventListener('change', (event) => {
    const el = event.target;
    if (el.type === 'radio') {
      // Choosing one option makes the whole group valid again.
      form
        .querySelectorAll(`input[type="radio"][name="${el.name}"]`)
        .forEach((radio) => syncAria(radio));
    } else {
      syncAria(el, true);
    }
  });

  // 'invalid' does not bubble; capture it so untouched required fields also sync
  // on a submit attempt. Focus goes to the first invalid field, announcing it.
  form.addEventListener(
    'invalid',
    (event) => {
      announced.add(event.target);
      if (!CSS.supports('selector(:user-invalid)')) {
        event.target.classList.add('user-invalid-fallback');
      }
      syncAria(event.target);
    },
    true
  );

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      fields.forEach((el) => {
        el.classList.remove('user-invalid-fallback');
        syncAria(el);
      });
    }, 0);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const originalMarkup = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.classList.add('hidden');
    status.textContent = '';

    window.setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalMarkup;
      // Reveal the live region before writing so the update is announced.
      status.classList.remove('hidden');
      status.textContent =
        'Thank you — your enquiry is on its way. We’ll reply within 24–48 hours.';
      form.reset();
    }, 700);
  });
}
