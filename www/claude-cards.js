// claude-cards.js
// Custom Lovelace cards die de Claude design taal pixel-precies renderen.
// Elk card heeft een eigen shadow DOM zodat HA's sanitizers en thema's
// het niet aantasten.
//
// Install:
//   1. Plaats dit bestand in /config/www/claude-cards.js
//   2. Voeg toe aan configuration.yaml onder frontend.extra_module_url:
//        - /local/claude-cards.js
//   3. Restart HA en hard-refresh de browser

const SHARED_STYLES = `
  :host {
    display: block;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --claude-bg: #262624;
    --claude-surface: #30302E;
    --claude-surface-2: #3A3936;
    --claude-primary: #C96342;
    --claude-primary-soft: #D97757;
    --claude-cream: #F0EEE6;
    --claude-cream-dim: #D6D2C8;
    --claude-muted: #A8A29E;
    --claude-border: rgba(240, 238, 230, 0.07);
    --claude-border-hover: rgba(240, 238, 230, 0.14);
    --serif: 'Fraunces', Georgia, serif;
    --sans: 'Inter', system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
`;

// Inject Google Fonts once
(() => {
  if (document.head.querySelector('link[data-claude-fonts]')) return;
  const pre1 = document.createElement('link');
  pre1.rel = 'preconnect';
  pre1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(pre1);
  const pre2 = document.createElement('link');
  pre2.rel = 'preconnect';
  pre2.href = 'https://fonts.gstatic.com';
  pre2.crossOrigin = 'anonymous';
  document.head.appendChild(pre2);
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

// ────────────────────────────────────────────────────────────────────────
// Helper: lookup entity state safely
// ────────────────────────────────────────────────────────────────────────
function entityState(hass, entityId) {
  if (!hass || !entityId) return '';
  const s = hass.states[entityId];
  return s ? s.state : '';
}
function entityAttr(hass, entityId, attr) {
  if (!hass || !entityId) return '';
  const s = hass.states[entityId];
  return s && s.attributes ? s.attributes[attr] : '';
}

// ────────────────────────────────────────────────────────────────────────
// 1. claude-hero-card — large serif greeting
// ────────────────────────────────────────────────────────────────────────
class ClaudeHeroCard extends HTMLElement {
  setConfig(config) {
    if (!config) throw new Error('Invalid config');
    this._config = config;
    this._build();
  }
  set hass(hass) { this._hass = hass; this._update(); }
  getCardSize() { return 2; }

  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        ${SHARED_STYLES}
        .hero { padding: 16px 4px 12px; }
        .title {
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(34px, 6vw, 52px);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--claude-cream);
          margin: 0 0 10px 0;
        }
        .subtitle {
          font-family: var(--sans);
          font-size: 14px;
          color: var(--claude-muted);
          line-height: 1.5;
          margin: 0;
        }
        .accent { color: var(--claude-primary); }
      </style>
      <div class="hero">
        <h1 class="title"></h1>
        <p class="subtitle"></p>
      </div>
    `;
    this._titleEl = root.querySelector('.title');
    this._subtitleEl = root.querySelector('.subtitle');
  }

  _update() {
    if (!this._config || !this._hass || !this._titleEl) return;
    const c = this._config;

    let title = c.title || 'Hallo';
    if (c.greeting && c.greeting.user) {
      const h = new Date().getHours();
      const part = h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond';
      title = `${part}, ${c.greeting.user}.`;
    }

    let subtitle = c.subtitle || '';
    if (c.greeting) {
      const date = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
      const weather = c.greeting.weather_entity ? entityState(this._hass, c.greeting.weather_entity) : '';
      const temp = c.greeting.weather_entity ? entityAttr(this._hass, c.greeting.weather_entity, c.greeting.temperature_attr || 'temperature') : '';
      const parts = [date];
      if (weather) parts.push(`<span class="accent">${weather}</span>`);
      if (temp !== '') parts.push(`${temp}°C`);
      subtitle = parts.join(' · ');
    }

    this._titleEl.textContent = title;
    this._subtitleEl.innerHTML = subtitle;
  }
}
customElements.define('claude-hero-card', ClaudeHeroCard);

// ────────────────────────────────────────────────────────────────────────
// 2. claude-section-card — kleinere serif title
// ────────────────────────────────────────────────────────────────────────
class ClaudeSectionCard extends HTMLElement {
  setConfig(config) { this._config = config; this._build(); }
  set hass(hass) { this._hass = hass; this._update(); }
  getCardSize() { return 1; }

  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        ${SHARED_STYLES}
        .title {
          font-family: var(--serif);
          font-weight: 400;
          font-size: 26px;
          letter-spacing: -0.01em;
          color: var(--claude-cream);
          margin: 12px 4px 4px;
        }
        .label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--claude-muted);
          margin: 12px 4px 4px;
        }
      </style>
      <div class="el"></div>
    `;
    this._el = root.querySelector('.el');
  }

  _update() {
    if (!this._config || !this._el) return;
    const isLabel = this._config.style === 'label';
    this._el.className = isLabel ? 'label' : 'title';
    this._el.textContent = this._config.title || '';
  }
}
customElements.define('claude-section-card', ClaudeSectionCard);

// ────────────────────────────────────────────────────────────────────────
// 3. claude-stat-card — uppercase label, big serif figure, coral delta
// ────────────────────────────────────────────────────────────────────────
class ClaudeStatCard extends HTMLElement {
  setConfig(config) { this._config = config; this._build(); }
  set hass(hass) { this._hass = hass; this._update(); }
  getCardSize() { return 2; }

  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        ${SHARED_STYLES}
        .stat {
          background: var(--claude-surface);
          border: 1px solid var(--claude-border);
          border-radius: 16px;
          padding: 18px 18px 16px;
          transition: border-color 200ms ease, background 200ms ease;
          height: 100%;
        }
        .stat:hover {
          border-color: var(--claude-border-hover);
          background: var(--claude-surface-2);
        }
        .label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--claude-muted);
          margin-bottom: 10px;
        }
        .figure-row { display: flex; align-items: baseline; }
        .figure {
          font-family: var(--serif);
          font-weight: 400;
          font-size: 30px;
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--claude-cream);
        }
        .figure.small { font-size: 22px; }
        .unit {
          font-size: 13px;
          color: var(--claude-muted);
          margin-left: 4px;
        }
        .delta {
          font-size: 12px;
          color: var(--claude-primary);
          margin-top: 6px;
        }
        .delta.muted { color: var(--claude-muted); }
        .delta.cream { color: var(--claude-cream-dim); }
      </style>
      <div class="stat">
        <div class="label"></div>
        <div class="figure-row">
          <span class="figure"></span>
          <span class="unit"></span>
        </div>
        <div class="delta"></div>
      </div>
    `;
    this._labelEl = root.querySelector('.label');
    this._figureEl = root.querySelector('.figure');
    this._unitEl = root.querySelector('.unit');
    this._deltaEl = root.querySelector('.delta');
  }

  _update() {
    if (!this._config || !this._hass || !this._labelEl) return;
    const c = this._config;

    this._labelEl.textContent = c.label || '';

    let figure = c.figure || '';
    if (c.figure_entity) {
      figure = entityState(this._hass, c.figure_entity);
    }
    if (c.figure_template === 'count_on') {
      figure = (c.figure_entities || []).filter(e => entityState(this._hass, e) === 'on').length;
    }
    this._figureEl.textContent = figure;
    this._figureEl.className = `figure ${c.figure_size === 'small' ? 'small' : ''}`;

    this._unitEl.textContent = c.unit || '';

    let delta = c.delta || '';
    if (c.delta_entity) {
      delta = entityState(this._hass, c.delta_entity);
      if (c.delta_suffix) delta += c.delta_suffix;
    }
    this._deltaEl.textContent = delta;
    this._deltaEl.className = `delta ${c.delta_color || ''}`;
    this._deltaEl.style.display = delta ? '' : 'none';
  }
}
customElements.define('claude-stat-card', ClaudeStatCard);

// ────────────────────────────────────────────────────────────────────────
// 4. claude-person-card — colored gradient circle with initials
// ────────────────────────────────────────────────────────────────────────
class ClaudePersonCard extends HTMLElement {
  setConfig(config) { this._config = config; this._build(); }
  set hass(hass) { this._hass = hass; this._update(); }
  getCardSize() { return 2; }

  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        ${SHARED_STYLES}
        .person {
          background: var(--claude-surface);
          border: 1px solid var(--claude-border);
          border-radius: 16px;
          padding: 18px 12px;
          text-align: center;
          cursor: pointer;
          transition: border-color 200ms ease;
          height: 100%;
        }
        .person:hover { border-color: var(--claude-border-hover); }
        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif);
          font-weight: 400;
          font-size: 22px;
          color: var(--claude-cream);
        }
        .name {
          font-family: var(--serif);
          font-weight: 400;
          font-size: 16px;
          color: var(--claude-cream);
        }
        .state {
          font-size: 11px;
          color: var(--claude-muted);
          margin-top: 2px;
        }
      </style>
      <div class="person">
        <div class="avatar"></div>
        <div class="name"></div>
        <div class="state"></div>
      </div>
    `;
    this._personEl = root.querySelector('.person');
    this._avatarEl = root.querySelector('.avatar');
    this._nameEl = root.querySelector('.name');
    this._stateEl = root.querySelector('.state');
    this._personEl.addEventListener('click', () => this._handleClick());
  }

  _handleClick() {
    if (!this._config.entity) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId: this._config.entity },
      bubbles: true, composed: true,
    }));
  }

  _update() {
    if (!this._config || !this._avatarEl) return;
    const c = this._config;
    this._avatarEl.textContent = c.initials || '?';
    if (c.gradient && c.gradient.length >= 2) {
      this._avatarEl.style.background = `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})`;
    } else {
      this._avatarEl.style.background = 'var(--claude-primary)';
    }
    this._nameEl.textContent = c.name || '';
    let state = '';
    if (c.entity && this._hass) {
      const raw = entityState(this._hass, c.entity);
      const map = c.states || { home: 'Thuis', not_home: 'Onderweg' };
      state = map[raw] || raw;
    } else {
      state = c.state || '';
    }
    this._stateEl.textContent = state;
  }
}
customElements.define('claude-person-card', ClaudePersonCard);

// ────────────────────────────────────────────────────────────────────────
// 5. claude-nav-card — bottom navigation, fixed on mobile
// ────────────────────────────────────────────────────────────────────────
class ClaudeNavCard extends HTMLElement {
  setConfig(config) { this._config = config; this._build(); }
  set hass(hass) { this._hass = hass; }
  getCardSize() { return 2; }

  _build() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const items = (this._config.items || []);
    const activePath = this._config.active || '';
    const dashPath = this._config.dashboard_path || 'claude-dashboard';

    root.innerHTML = `
      <style>
        ${SHARED_STYLES}
        .nav {
          display: grid;
          grid-template-columns: repeat(${items.length}, 1fr);
          gap: 0;
          margin-top: 24px;
          background: rgba(31, 30, 28, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--claude-border);
          border-radius: 22px;
          padding: 4px 6px;
        }
        @media (max-width: 870px) {
          .nav {
            position: fixed;
            bottom: 12px;
            left: 12px;
            right: 12px;
            z-index: 999;
            margin-top: 0;
          }
        }
        .item {
          all: unset;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 4px;
          cursor: pointer;
          color: var(--claude-muted);
          transition: color 150ms ease;
          font-family: var(--sans);
        }
        .item:hover { color: var(--claude-cream); }
        .item.active { color: var(--claude-primary); }
        .item ha-icon, .item .icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
        .item .label {
          font-size: 10px;
          font-weight: 500;
          line-height: 1.2;
        }
      </style>
      <div class="nav">
        ${items.map(it => `
          <button class="item ${it.path === activePath ? 'active' : ''}" data-path="${it.path}">
            <ha-icon icon="${it.icon}"></ha-icon>
            <span class="label">${it.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    root.querySelectorAll('.item').forEach(btn => {
      btn.addEventListener('click', () => {
        const path = btn.dataset.path;
        const url = `/${dashPath}/${path}`;
        history.pushState(null, '', url);
        window.dispatchEvent(new CustomEvent('location-changed'));
      });
    });
  }
}
customElements.define('claude-nav-card', ClaudeNavCard);

// ────────────────────────────────────────────────────────────────────────
// Register cards in HA's customCards registry (for the visual editor)
// ────────────────────────────────────────────────────────────────────────
window.customCards = window.customCards || [];
window.customCards.push(
  { type: 'claude-hero-card', name: 'Claude Hero', description: 'Large serif greeting' },
  { type: 'claude-section-card', name: 'Claude Section', description: 'Section title' },
  { type: 'claude-stat-card', name: 'Claude Stat', description: 'Stat tile with figure' },
  { type: 'claude-person-card', name: 'Claude Person', description: 'Person avatar with initials' },
  { type: 'claude-nav-card', name: 'Claude Nav', description: 'Bottom navigation bar' },
);

console.info('%c CLAUDE-CARDS %c v1.0.0 ', 'color: #F0EEE6; background: #C96342; padding: 2px 4px; border-radius: 3px;', 'color: #C96342; background: #262624; padding: 2px 4px; border-radius: 3px;');
