// claude-fonts.js
// 1. Loads Fraunces + Inter from Google Fonts (CSP workaround)
// 2. Patches HA profile-page select/dropdown shadow DOMs to dark colors
//
// Install: copy to /config/www/claude-fonts.js
// Add to configuration.yaml:
//   frontend:
//     extra_module_url:
//       - /local/claude-fonts.js

// ── 1. Google Fonts ───────────────────────────────────────────────────────────
(() => {
  if (document.head.querySelector('link[data-claude-fonts]')) return;

  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);

  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2' +
    '?family=Fraunces:opsz,wght@9..144,300..600' +
    '&family=Inter:wght@300..600' +
    '&display=swap';
  link.setAttribute('data-claude-fonts', '');
  document.head.appendChild(link);
})();

// ── 2. Dark-select shadow DOM patcher ─────────────────────────────────────────
// CSS variables inherited from `html` can be overridden by a component's own
// :host rules. The only reliable fix is to inject a <style> directly into each
// component's shadow root, where :host { ... !important } wins.
(function patchDarkSelects() {
  const CSS = [
    ':host {',
    '  --mdc-select-fill-color: #3A3936 !important;',
    '  --mdc-select-ink-color: #F0EEE6 !important;',
    '  --mdc-select-label-ink-color: #A8A29E !important;',
    '  --mdc-select-dropdown-icon-color: #A8A29E !important;',
    '  --mdc-theme-surface: #3A3936 !important;',
    '  --mdc-theme-on-surface: #F0EEE6 !important;',
    '  --md-sys-color-surface-container-highest: #46443F !important;',
    '  --md-sys-color-on-surface: #F0EEE6 !important;',
    '  --md-filled-select-text-field-container-color: #3A3936 !important;',
    '  --md-filled-select-text-field-input-text-color: #F0EEE6 !important;',
    '  --md-filled-select-text-field-label-text-color: #A8A29E !important;',
    '}',
    '.mdc-select__anchor,.mdc-select__fill{background:#3A3936!important}',
    '.mdc-select__selected-text,.mdc-select__selected-text-container{color:#F0EEE6!important}',
    '.mdc-floating-label,.mdc-floating-label--float-above{color:#A8A29E!important}',
    '.mdc-select__dropdown-icon{fill:#A8A29E!important}',
  ].join('\n');

  const SELECTORS = 'ha-select,mwc-select,ha-md-select,md-filled-select,md-outlined-select';
  // Only dive into shadow roots of these HA containers — avoids full-DOM scan
  const CONTAINERS = 'home-assistant,ha-app-layout,ha-drawer,ha-panel-profile,ha-settings-row,hui-root';

  const patched = new WeakSet();

  function patch(el) {
    if (!el.shadowRoot || patched.has(el)) return;
    patched.add(el);
    const s = document.createElement('style');
    s.textContent = CSS;
    el.shadowRoot.appendChild(s);
    // Also patch nested selects inside this shadow root
    el.shadowRoot.querySelectorAll(SELECTORS).forEach(patch);
  }

  function scan(root) {
    if (!root) return;
    root.querySelectorAll(SELECTORS).forEach(patch);
    root.querySelectorAll(CONTAINERS).forEach(function(el) {
      if (el.shadowRoot) scan(el.shadowRoot);
    });
  }

  // Run on load with staggered delays to catch async-rendered components
  [0, 300, 800, 2000, 5000].forEach(function(ms) {
    setTimeout(function() { scan(document); }, ms);
  });

  // Re-scan on SPA navigation (HA fires location-changed)
  window.addEventListener('location-changed', function() {
    setTimeout(function() { scan(document); }, 200);
  });
  window.addEventListener('hashchange', function() {
    setTimeout(function() { scan(document); }, 200);
  });
})();
