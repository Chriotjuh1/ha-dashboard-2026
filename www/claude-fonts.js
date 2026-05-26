// claude-fonts.js
// 1. Loads Fraunces + Inter from Google Fonts (CSP workaround)
// 2. Patches HA component shadow DOMs to dark Claude colors
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

// ── 2. Dark-UI shadow DOM patcher ────────────────────────────────────────────
// CSS variables inherited from <html> can be overridden by a component's own
// :host defaults. Theme tokens via card-mod-root-yaml don't always reach
// every nested shadow root either (especially MD3 components in dialogs). So
// we walk the shadow DOM tree and inject a tag-specific <style> into each
// matching component's own shadow root, where :host { ... !important } wins.
(function patchDarkUI() {
  const CORAL = '#D97757';
  const CORAL_DEEP = '#C96342';
  const DANGER = '#D96D6D';
  const SURFACE = '#30302E';
  const SURFACE_2 = '#3A3936';
  const SURFACE_3 = '#46443F';
  const CREAM = '#F0EEE6';
  const MUTED = '#A8A29E';
  const BORDER_HOVER = 'rgba(240,238,230,0.18)';

  // ── Per-component CSS bundles ──────────────────────────────────────────────
  const SELECT_CSS = `
    :host {
      --mdc-select-fill-color: ${SURFACE_2} !important;
      --mdc-select-ink-color: ${CREAM} !important;
      --mdc-select-label-ink-color: ${MUTED} !important;
      --mdc-select-dropdown-icon-color: ${MUTED} !important;
      --mdc-theme-surface: ${SURFACE_2} !important;
      --mdc-theme-on-surface: ${CREAM} !important;
      --md-sys-color-surface-container-highest: ${SURFACE_3} !important;
      --md-sys-color-on-surface: ${CREAM} !important;
      --md-filled-select-text-field-container-color: ${SURFACE_2} !important;
      --md-filled-select-text-field-input-text-color: ${CREAM} !important;
      --md-filled-select-text-field-label-text-color: ${MUTED} !important;
    }
    .mdc-select__anchor,.mdc-select__fill{background:${SURFACE_2}!important}
    .mdc-select__selected-text,.mdc-select__selected-text-container{color:${CREAM}!important}
    .mdc-floating-label,.mdc-floating-label--float-above{color:${MUTED}!important}
    .mdc-select__dropdown-icon{fill:${MUTED}!important}
  `;

  const TEXTFIELD_CSS = `
    :host {
      --mdc-text-field-fill-color: ${SURFACE_2} !important;
      --mdc-text-field-ink-color: ${CREAM} !important;
      --mdc-text-field-label-ink-color: ${MUTED} !important;
      --mdc-text-field-idle-line-color: ${BORDER_HOVER} !important;
      --mdc-text-field-hover-line-color: ${CORAL} !important;
      --mdc-text-field-focused-label-color: ${CORAL} !important;
      --mdc-text-field-outlined-idle-border-color: ${BORDER_HOVER} !important;
      --mdc-text-field-outlined-hover-border-color: ${CORAL} !important;
      --mdc-filled-text-field-container-color: ${SURFACE_2} !important;
      --md-sys-color-surface-container-highest: ${SURFACE_2} !important;
      --md-sys-color-on-surface: ${CREAM} !important;
      --md-sys-color-on-surface-variant: ${MUTED} !important;
      --md-sys-color-primary: ${CORAL} !important;
      --md-filled-text-field-container-color: ${SURFACE_2} !important;
      --md-filled-text-field-input-text-color: ${CREAM} !important;
      --md-filled-text-field-label-text-color: ${MUTED} !important;
      --md-filled-text-field-focus-label-text-color: ${CORAL} !important;
      --md-filled-text-field-caret-color: ${CREAM} !important;
      --md-filled-text-field-supporting-text-color: ${MUTED} !important;
      --md-outlined-text-field-input-text-color: ${CREAM} !important;
      --md-outlined-text-field-label-text-color: ${MUTED} !important;
      --md-outlined-text-field-outline-color: ${BORDER_HOVER} !important;
      --md-outlined-text-field-focus-outline-color: ${CORAL} !important;
      /* MD3 wraps het tekstvak in een <md-filled-field> met token
         --md-filled-field-container-color (zonder "text-"). Die is de
         echte boosdoener voor de witte .text-field-div. */
      --md-filled-field-container-color: ${SURFACE_2} !important;
      --md-filled-field-content-color: ${CREAM} !important;
      --md-filled-field-label-text-color: ${MUTED} !important;
      --md-filled-field-focus-label-text-color: ${CORAL} !important;
      --md-outlined-field-content-color: ${CREAM} !important;
      --md-outlined-field-label-text-color: ${MUTED} !important;
      --md-outlined-field-outline-color: ${BORDER_HOVER} !important;
    }
    /* MDC */
    .mdc-text-field,.mdc-text-field--filled,.mdc-text-field--outlined,.mdc-text-field__resizer{
      background-color:${SURFACE_2}!important
    }
    .mdc-text-field__input,input,textarea{
      color:${CREAM}!important;caret-color:${CREAM}!important;-webkit-text-fill-color:${CREAM}!important
    }
    .mdc-floating-label,.mdc-floating-label--float-above{color:${MUTED}!important}
    /* MD3 internal classes — incl. .text-field (de wrapper-div met het
       lichte vlak dat in DevTools opdook) en .background (de gevulde laag). */
    .text-field,.field,.container,.background,.surface{
      background-color:${SURFACE_2}!important;background:${SURFACE_2}!important
    }
    .input-wrapper input,.input,input.md3-text-field__input{
      color:${CREAM}!important;caret-color:${CREAM}!important;-webkit-text-fill-color:${CREAM}!important
    }
    .label-text,.label,.floating-label{color:${MUTED}!important}
  `;

  const SWITCH_CSS = `
    :host {
      --switch-checked-color: ${CORAL} !important;
      --switch-checked-button-color: ${CORAL_DEEP} !important;
      --switch-checked-track-color: ${CORAL_DEEP} !important;
      --mdc-theme-secondary: ${CORAL} !important;
      --mdc-switch-selected-track-color: ${CORAL} !important;
      --mdc-switch-selected-handle-color: ${CORAL_DEEP} !important;
      --mdc-switch-selected-icon-color: ${CREAM} !important;
      --mdc-switch-selected-focus-track-color: ${CORAL} !important;
      --mdc-switch-selected-hover-track-color: ${CORAL} !important;
      --mdc-switch-selected-pressed-track-color: ${CORAL} !important;
      --mdc-switch-selected-focus-handle-color: ${CORAL_DEEP} !important;
      --mdc-switch-selected-hover-handle-color: ${CORAL_DEEP} !important;
      --mdc-switch-selected-pressed-handle-color: ${CORAL_DEEP} !important;
      --md-sys-color-primary: ${CORAL} !important;
      --md-switch-selected-track-color: ${CORAL} !important;
      --md-switch-selected-handle-color: ${CORAL_DEEP} !important;
      --md-switch-selected-icon-color: ${CREAM} !important;
      --md-switch-selected-focus-track-color: ${CORAL} !important;
      --md-switch-selected-hover-track-color: ${CORAL} !important;
      --md-switch-selected-pressed-track-color: ${CORAL} !important;
      --md-switch-selected-focus-handle-color: ${CORAL_DEEP} !important;
      --md-switch-selected-hover-handle-color: ${CORAL_DEEP} !important;
      --md-switch-selected-pressed-handle-color: ${CORAL_DEEP} !important;
    }
    /* MDC switch internals */
    .mdc-switch--selected .mdc-switch__track::after,
    .mdc-switch--selected .mdc-switch__track::before{
      background-color:${CORAL}!important;border-color:${CORAL}!important
    }
    .mdc-switch--selected .mdc-switch__handle::after,
    .mdc-switch--selected .mdc-switch__shadow{background-color:${CORAL_DEEP}!important}
    /* MD3 switch internals */
    .switch.selected .track{background-color:${CORAL}!important}
    .switch.selected .handle{background-color:${CORAL_DEEP}!important}
  `;

  const BUTTON_CSS = `
    :host {
      --mdc-theme-primary: ${CORAL} !important;
      --mdc-ripple-color: ${CORAL} !important;
      --md-sys-color-primary: ${CORAL} !important;
      --md-text-button-label-text-color: ${CORAL} !important;
      --md-text-button-hover-state-layer-color: ${CORAL} !important;
      --md-outlined-button-label-text-color: ${CORAL} !important;
      --md-outlined-button-outline-color: ${BORDER_HOVER} !important;
      --md-outlined-button-hover-state-layer-color: ${CORAL} !important;
      --md-filled-button-container-color: ${CORAL_DEEP} !important;
      --md-filled-button-label-text-color: ${CREAM} !important;
    }
    .mdc-button__ripple::before,.mdc-button__ripple::after{background-color:${CORAL}!important}
    .mdc-button:hover .mdc-button__ripple::before{opacity:.14!important}
    .mdc-button:focus .mdc-button__ripple::before{opacity:.18!important}
    .mdc-button__label{color:${CORAL}!important}
  `;

  const BUTTON_TONAL_CSS = `
    :host {
      --md-sys-color-secondary-container: ${SURFACE_2} !important;
      --md-sys-color-on-secondary-container: ${CORAL} !important;
      --md-filled-tonal-button-container-color: ${SURFACE_2} !important;
      --md-filled-tonal-button-label-text-color: ${CORAL} !important;
      --md-filled-tonal-button-hover-state-layer-color: ${CORAL} !important;
      --md-filled-tonal-button-hover-state-layer-opacity: .14 !important;
      --md-filled-tonal-button-focus-state-layer-color: ${CORAL} !important;
      --md-filled-tonal-button-pressed-state-layer-color: ${CORAL} !important;
    }
  `;

  const EXPANSION_CSS = `
    :host {
      --ha-card-background: ${SURFACE} !important;
      --card-background-color: ${SURFACE} !important;
      --primary-text-color: ${CREAM} !important;
      --secondary-text-color: ${MUTED} !important;
      --md-sys-color-surface: ${SURFACE} !important;
      --md-sys-color-surface-container: ${SURFACE} !important;
      --md-sys-color-surface-container-high: ${SURFACE_2} !important;
      --md-sys-color-surface-container-highest: ${SURFACE_2} !important;
      --md-sys-color-on-surface: ${CREAM} !important;
      --md-sys-color-on-surface-variant: ${MUTED} !important;
      --mdc-theme-surface: ${SURFACE} !important;
      --mdc-theme-on-surface: ${CREAM} !important;
    }
    .top,.summary,.container,.header,[class*="summary"],[class*="header"]{
      background-color:${SURFACE}!important;color:${CREAM}!important
    }
    .icon,ha-svg-icon{color:${MUTED}!important}
  `;

  // Tag → CSS bundle (voor de <style>-injectie in de shadow root)
  const STYLES = {
    'ha-select': SELECT_CSS,
    'mwc-select': SELECT_CSS,
    'ha-md-select': SELECT_CSS,
    'md-filled-select': SELECT_CSS,
    'md-outlined-select': SELECT_CSS,

    'ha-textfield': TEXTFIELD_CSS,
    'mwc-textfield': TEXTFIELD_CSS,
    'ha-md-textfield': TEXTFIELD_CSS,
    'ha-password-textfield': TEXTFIELD_CSS,
    'md-filled-text-field': TEXTFIELD_CSS,
    'md-outlined-text-field': TEXTFIELD_CSS,
    'md-filled-field': TEXTFIELD_CSS,
    'md-outlined-field': TEXTFIELD_CSS,

    'ha-switch': SWITCH_CSS,
    'mwc-switch': SWITCH_CSS,
    'md-switch': SWITCH_CSS,

    'mwc-button': BUTTON_CSS,
    'ha-button': BUTTON_CSS,
    'md-text-button': BUTTON_CSS,
    'md-outlined-button': BUTTON_CSS,
    'md-elevated-button': BUTTON_CSS,
    'md-filled-tonal-button': BUTTON_TONAL_CSS,

    'ha-expansion-panel': EXPANSION_CSS,
  };

  // Tag → CSS-vars die we OOK als inline-style op de host zetten.
  // Inline style wint qua specificity altijd van :host {} rules in de
  // shadow DOM én cascadeert mee naar binnen, dus deze laag is de
  // betrouwbaarste override-mechanisme.
  const INLINE_VARS = {
    'ha-switch':       switchVars(),
    'mwc-switch':      switchVars(),
    'md-switch':       switchVars(),
    'ha-textfield':    textFieldVars(),
    'mwc-textfield':   textFieldVars(),
    'ha-md-textfield': textFieldVars(),
    'ha-password-textfield': textFieldVars(),
    'md-filled-text-field':  textFieldVars(),
    'md-outlined-text-field': textFieldVars(),
    'md-filled-field':  textFieldVars(),
    'md-outlined-field': textFieldVars(),
    'ha-select':       selectVars(),
    'mwc-select':      selectVars(),
    'ha-md-select':    selectVars(),
    'md-filled-select':  selectVars(),
    'md-outlined-select': selectVars(),
    'mwc-button':      buttonVars(),
    'ha-button':       buttonVars(),
    'md-text-button':  buttonVars(),
    'md-outlined-button': buttonVars(),
    'md-elevated-button': buttonVars(),
    'md-filled-tonal-button': buttonTonalVars(),
    'ha-expansion-panel': expansionVars(),
  };

  function switchVars() {
    return {
      '--mdc-theme-secondary': CORAL,
      '--mdc-switch-selected-track-color': CORAL,
      '--mdc-switch-selected-handle-color': CORAL_DEEP,
      '--mdc-switch-selected-icon-color': CREAM,
      '--mdc-switch-selected-focus-track-color': CORAL,
      '--mdc-switch-selected-hover-track-color': CORAL,
      '--mdc-switch-selected-pressed-track-color': CORAL,
      '--mdc-switch-selected-focus-handle-color': CORAL_DEEP,
      '--mdc-switch-selected-hover-handle-color': CORAL_DEEP,
      '--mdc-switch-selected-pressed-handle-color': CORAL_DEEP,
      '--md-sys-color-primary': CORAL,
      '--md-sys-color-on-primary': CREAM,
      '--md-switch-selected-track-color': CORAL,
      '--md-switch-selected-handle-color': CORAL_DEEP,
      '--md-switch-selected-icon-color': CREAM,
      '--md-switch-selected-focus-track-color': CORAL,
      '--md-switch-selected-hover-track-color': CORAL,
      '--md-switch-selected-pressed-track-color': CORAL,
      '--md-switch-selected-focus-handle-color': CORAL_DEEP,
      '--md-switch-selected-hover-handle-color': CORAL_DEEP,
      '--md-switch-selected-pressed-handle-color': CORAL_DEEP,
    };
  }
  function textFieldVars() {
    return {
      '--mdc-text-field-fill-color': SURFACE_2,
      '--mdc-text-field-ink-color': CREAM,
      '--mdc-text-field-label-ink-color': MUTED,
      '--mdc-filled-text-field-container-color': SURFACE_2,
      '--md-sys-color-surface-container-highest': SURFACE_2,
      '--md-sys-color-on-surface': CREAM,
      '--md-sys-color-on-surface-variant': MUTED,
      '--md-sys-color-primary': CORAL,
      '--md-filled-text-field-container-color': SURFACE_2,
      '--md-filled-text-field-input-text-color': CREAM,
      '--md-filled-text-field-label-text-color': MUTED,
      '--md-filled-text-field-focus-label-text-color': CORAL,
      '--md-outlined-text-field-input-text-color': CREAM,
      '--md-outlined-text-field-label-text-color': MUTED,
      '--md-outlined-text-field-outline-color': BORDER_HOVER,
      '--md-outlined-text-field-focus-outline-color': CORAL,
      // De inner <md-filled-field> gebruikt -field- (zonder "text-")
      '--md-filled-field-container-color': SURFACE_2,
      '--md-filled-field-content-color': CREAM,
      '--md-filled-field-label-text-color': MUTED,
      '--md-filled-field-focus-label-text-color': CORAL,
      '--md-outlined-field-content-color': CREAM,
      '--md-outlined-field-label-text-color': MUTED,
      '--md-outlined-field-outline-color': BORDER_HOVER,
    };
  }
  function selectVars() {
    return {
      '--mdc-select-fill-color': SURFACE_2,
      '--mdc-select-ink-color': CREAM,
      '--mdc-select-label-ink-color': MUTED,
      '--mdc-select-dropdown-icon-color': MUTED,
      '--mdc-theme-surface': SURFACE_2,
      '--mdc-theme-on-surface': CREAM,
      '--md-sys-color-surface-container-highest': SURFACE_3,
      '--md-sys-color-on-surface': CREAM,
      '--md-filled-select-text-field-container-color': SURFACE_2,
      '--md-filled-select-text-field-input-text-color': CREAM,
      '--md-filled-select-text-field-label-text-color': MUTED,
    };
  }
  function buttonVars() {
    return {
      '--mdc-theme-primary': CORAL,
      '--mdc-ripple-color': CORAL,
      '--md-sys-color-primary': CORAL,
      '--md-text-button-label-text-color': CORAL,
      '--md-outlined-button-label-text-color': CORAL,
      '--md-outlined-button-outline-color': BORDER_HOVER,
    };
  }
  function buttonTonalVars() {
    return {
      '--md-sys-color-secondary-container': SURFACE_2,
      '--md-sys-color-on-secondary-container': CORAL,
      '--md-filled-tonal-button-container-color': SURFACE_2,
      '--md-filled-tonal-button-label-text-color': CORAL,
      '--md-filled-tonal-button-hover-state-layer-color': CORAL,
    };
  }
  function expansionVars() {
    return {
      '--ha-card-background': SURFACE,
      '--card-background-color': SURFACE,
      '--primary-text-color': CREAM,
      '--secondary-text-color': MUTED,
      '--md-sys-color-surface': SURFACE,
      '--md-sys-color-surface-container': SURFACE,
      '--md-sys-color-on-surface': CREAM,
      '--md-sys-color-on-surface-variant': MUTED,
    };
  }

  const TAGS = Object.keys(STYLES);
  const TAGS_SELECTOR = TAGS.join(',');

  const patched = new WeakSet();

  function patchOne(el) {
    if (!el || patched.has(el)) return;
    const tag = el.tagName.toLowerCase();
    // Inline CSS-vars op de host: wint cascadeer-strijd van :host {} defaults
    // in de shadow DOM én van CSS-vars die wij of een ander op <html> zetten.
    const vars = INLINE_VARS[tag];
    if (vars) {
      for (const k in vars) el.style.setProperty(k, vars[k], 'important');
    }
    // Plus: <style>-injectie in de shadow root als backup voor inner classes
    // (.mdc-* / .track / .container) die geen CSS-var lezen.
    const css = STYLES[tag];
    if (css && el.shadowRoot && !el.shadowRoot.querySelector('style[data-claude-dark]')) {
      const s = document.createElement('style');
      s.setAttribute('data-claude-dark', '');
      s.textContent = css;
      el.shadowRoot.appendChild(s);
    }
    patched.add(el);
  }

  // Recursive shadow-DOM walk. Visited set on shadow roots prevents revisiting
  // sub-trees we already crossed in this run. Patched set on elements ensures
  // we only inject once per element across all runs.
  function walk(root, visited) {
    if (!root || visited.has(root)) return;
    visited.add(root);
    // Patch all known targets in this root
    try { root.querySelectorAll(TAGS_SELECTOR).forEach(patchOne); }
    catch (e) { /* invalid selector for some roots — ignore */ }
    // Recurse into all shadow roots reachable from this root
    let nodes;
    try { nodes = root.querySelectorAll('*'); } catch (e) { return; }
    for (let i = 0; i < nodes.length; i++) {
      const sr = nodes[i].shadowRoot;
      if (sr) walk(sr, visited);
    }
  }

  let scanScheduled = false;
  function scheduleScan(delay) {
    if (scanScheduled) return;
    scanScheduled = true;
    setTimeout(() => {
      scanScheduled = false;
      walk(document, new WeakSet());
    }, delay || 0);
  }

  // Initial + retries to catch async-rendered components after load
  [0, 300, 800, 2000, 5000].forEach(ms => setTimeout(() => scheduleScan(0), ms));

  // SPA navigation
  window.addEventListener('location-changed', () => scheduleScan(150));
  window.addEventListener('hashchange', () => scheduleScan(150));

  // Watch for dynamically added elements (dialogs, popups) — debounced.
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) { scheduleScan(80); return; }
    }
  });
  // Observe body for top-level dialog additions
  obs.observe(document.body, { childList: true, subtree: false });
  // And the home-assistant shadow root for inner SPA changes, once available
  function attachHaObserver(retries) {
    const ha = document.querySelector('home-assistant');
    if (ha && ha.shadowRoot) {
      obs.observe(ha.shadowRoot, { childList: true, subtree: true });
      return;
    }
    if (retries > 0) setTimeout(() => attachHaObserver(retries - 1), 500);
  }
  attachHaObserver(20);
})();
