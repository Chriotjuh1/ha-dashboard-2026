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
      /* Web Awesome */
      --wa-color-surface-default: ${SURFACE_2} !important;
      --wa-color-fill-loud: ${CORAL_DEEP} !important;
      --wa-color-fill-quiet: ${SURFACE_2} !important;
      --wa-form-control-background-color: ${SURFACE_2} !important;
      --wa-form-control-border-color: ${BORDER_HOVER} !important;
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
    /* Web Awesome — ha-switch is nu direct wa-switch intern */
    .switch,[part="control"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      border:1px solid ${BORDER_HOVER}!important;
    }
    .thumb,[part="thumb"]{
      background:${CREAM}!important;
      background-color:${CREAM}!important;
    }
    /* Aan-staat (track → koraal-deep) */
    :host([checked]) .switch,
    :host([aria-checked="true"]) .switch,
    :host(:state(checked)) .switch,
    :host([checked]) [part="control"],
    :host([aria-checked="true"]) [part="control"],
    :host(:state(checked)) [part="control"]{
      background:${CORAL_DEEP}!important;
      background-color:${CORAL_DEEP}!important;
      border-color:${CORAL}!important;
    }
    :host([checked]) .thumb,
    :host([aria-checked="true"]) .thumb,
    :host(:state(checked)) .thumb,
    :host([checked]) [part="thumb"],
    :host([aria-checked="true"]) [part="thumb"],
    :host(:state(checked)) [part="thumb"]{
      background:${CREAM}!important;
      background-color:${CREAM}!important;
    }
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
      /* Web Awesome tokens — brand */
      --wa-color-brand-fill-loud: ${CORAL_DEEP} !important;
      --wa-color-brand-fill-loud-hover: ${CORAL} !important;
      --wa-color-brand-on-loud: ${CREAM} !important;
      --wa-color-brand-fill-quiet: ${SURFACE_2} !important;
      --wa-color-brand-on-quiet: ${CORAL} !important;
      --wa-color-text-link: ${CORAL} !important;
      --wa-color-text-loud: ${CORAL} !important;
      /* Danger — felrood → muted Claude danger */
      --wa-color-danger-fill-loud: ${DANGER} !important;
      --wa-color-danger-fill-loud-hover: ${DANGER} !important;
      --wa-color-danger-on-loud: ${CREAM} !important;
      --wa-color-danger-fill-quiet: ${SURFACE_2} !important;
      --wa-color-danger-on-quiet: ${DANGER} !important;
      color: ${CORAL} !important;
    }
    /* Slotted bare-text inherit'd van host-color (::slotted matcht alleen
       elementen, niet text nodes), dus we moeten :host zelf herkleuren */
    :host([appearance="accent"]),
    :host([appearance="filled"]){
      color:${CREAM}!important;
    }
    :host([variant="danger"]),
    :host([variant="warning"]){
      color:${DANGER}!important;
    }
    :host([variant="danger"][appearance="accent"]),
    :host([variant="warning"][appearance="accent"]),
    :host([variant="danger"][appearance="filled"]),
    :host([variant="warning"][appearance="filled"]){
      color:${CREAM}!important;
    }
    /* Als slotted child wél een element is, ook expliciet kleuren */
    ::slotted(*){ color:${CORAL}!important; }
    :host([appearance="accent"]) ::slotted(*),
    :host([appearance="filled"]) ::slotted(*){ color:${CREAM}!important; }
    :host([variant="danger"]) ::slotted(*),
    :host([variant="warning"]) ::slotted(*){ color:${DANGER}!important; }
    :host([variant="danger"][appearance="accent"]) ::slotted(*),
    :host([variant="danger"][appearance="filled"]) ::slotted(*){ color:${CREAM}!important; }
    /* MDC (oudere componenten) */
    .mdc-button__ripple::before,.mdc-button__ripple::after{background-color:${CORAL}!important}
    .mdc-button:hover .mdc-button__ripple::before{opacity:.14!important}
    .mdc-button:focus .mdc-button__ripple::before{opacity:.18!important}
    .mdc-button__label{color:${CORAL}!important}
    /* Web Awesome (ha-button is nu wa-button intern) */
    .button,[part="base"]{
      color:${CORAL}!important;
      background:transparent!important;
      background-color:transparent!important;
      border-color:transparent!important;
    }
    .label,[part="label"]{
      color:${CORAL}!important;
    }
    /* appearance="accent" — primaire actie ("Opslaan") = gevuld koraal */
    :host([appearance="accent"]) .button,
    :host([appearance="accent"]) [part="base"]{
      background:${CORAL_DEEP}!important;
      background-color:${CORAL_DEEP}!important;
      color:${CREAM}!important;
      border-color:${CORAL_DEEP}!important;
    }
    :host([appearance="accent"]) .label,
    :host([appearance="accent"]) [part="label"]{
      color:${CREAM}!important;
    }
    /* Filled variant: koraal-deep vlak */
    :host([appearance="filled"]) .button,
    :host([appearance="filled"]) [part="base"]{
      background:${CORAL_DEEP}!important;
      background-color:${CORAL_DEEP}!important;
      color:${CREAM}!important;
    }
    :host([appearance="filled"]) .label,
    :host([appearance="filled"]) [part="label"]{
      color:${CREAM}!important;
    }
    /* Outlined variant: subtiele rand */
    :host([appearance="outlined"]) .button,
    :host([appearance="outlined"]) [part="base"]{
      border-color:${BORDER_HOVER}!important;
    }
    /* Hover: koraal tint i.p.v. wit */
    :host(:hover) .button,
    :host(:hover) [part="base"],
    .button:hover,[part="base"]:hover{
      background:rgba(217,119,87,0.12)!important;
      background-color:rgba(217,119,87,0.12)!important;
    }
    :host([appearance="accent"]:hover) .button,
    :host([appearance="accent"]:hover) [part="base"],
    :host([appearance="filled"]:hover) .button,
    :host([appearance="filled"]:hover) [part="base"]{
      background:${CORAL}!important;
      background-color:${CORAL}!important;
    }
    /* Danger / warning variant: muted danger ipv felrood */
    :host([variant="danger"]),
    :host([variant="warning"]){
      color:${DANGER}!important;
    }
    :host([variant="danger"]) .label,
    :host([variant="warning"]) .label,
    :host([variant="danger"]) [part="label"],
    :host([variant="warning"]) [part="label"]{
      color:${DANGER}!important;
    }
    /* appearance="accent" of "filled" + danger → gevuld muted danger */
    :host([variant="danger"][appearance="accent"]) .button,
    :host([variant="danger"][appearance="accent"]) [part="base"],
    :host([variant="danger"][appearance="filled"]) .button,
    :host([variant="danger"][appearance="filled"]) [part="base"]{
      background:${DANGER}!important;
      background-color:${DANGER}!important;
      color:${CREAM}!important;
      border-color:${DANGER}!important;
    }
    :host([variant="danger"][appearance="accent"]) .label,
    :host([variant="danger"][appearance="accent"]) [part="label"],
    :host([variant="danger"][appearance="filled"]) .label,
    :host([variant="danger"][appearance="filled"]) [part="label"]{
      color:${CREAM}!important;
    }
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

  // ha-time-input (nieuwere HA) rendert ha-base-time-input → ha-input →
  // wa-input (Web Awesome) → <div class="text-field"> + <input type="number">.
  // De witte bak is die .text-field-div binnen wa-input's shadow root.
  // Voor de zekerheid ook native input[type="time"] dekken (oudere variants).
  const TIMEINPUT_CSS = `
    /* Native time/date inputs (legacy) */
    input[type="time"],input[type="date"],input[type="datetime-local"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      color:${CREAM}!important;
      border:1px solid ${BORDER_HOVER}!important;
      border-radius:8px!important;
      padding:6px 10px!important;
      color-scheme:dark!important;
    }
    input[type="time"]::-webkit-datetime-edit,
    input[type="date"]::-webkit-datetime-edit{
      background-color:${SURFACE_2}!important;color:${CREAM}!important
    }
    input[type="time"]::-webkit-datetime-edit-fields-wrapper,
    input[type="time"]::-webkit-datetime-edit-hour-field,
    input[type="time"]::-webkit-datetime-edit-minute-field,
    input[type="time"]::-webkit-datetime-edit-text{
      color:${CREAM}!important;background-color:transparent!important
    }
    input[type="time"]::-webkit-calendar-picker-indicator{
      filter:invert(0.85);opacity:0.6;cursor:pointer
    }
    /* Override de nieuwe --ha-color-* tokens binnen deze shadow root */
    :host {
      --ha-color-form-background: ${SURFACE_2} !important;
      --ha-color-form-foreground: ${CREAM} !important;
      --ha-color-form-border: ${BORDER_HOVER} !important;
      --ha-color-form-label: ${MUTED} !important;
    }
    /* Number inputs binnen ha-input/wa-input (de echte hh + mm velden) */
    input[type="number"]{
      background:transparent!important;
      background-color:transparent!important;
      color:${CREAM}!important;
      caret-color:${CREAM}!important;
      -webkit-text-fill-color:${CREAM}!important;
      color-scheme:dark!important;
    }
    /* Dubbele punt tussen hh en mm — beide longhand+shorthand voor zekerheid */
    .time-separator,
    [class*="time-separator"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      color:${CREAM}!important;
      align-self:stretch!important;
      display:flex!important;
      align-items:center!important;
      padding:0 4px!important;
    }
  `;

  // ha-button-toggle-group: rij van toggles ("Samengesteld" / "Aangepast").
  // De selected/unselected tabs picken default brand-color → blauw/cyaan.
  const TOGGLE_GROUP_CSS = `
    :host {
      --mdc-theme-primary: ${CORAL} !important;
      --md-sys-color-primary: ${CORAL} !important;
      --md-sys-color-on-primary: ${CREAM} !important;
      --md-sys-color-secondary-container: ${CORAL_DEEP} !important;
      --md-sys-color-on-secondary-container: ${CREAM} !important;
      --wa-color-brand-fill-loud: ${CORAL_DEEP} !important;
      --wa-color-brand-on-loud: ${CREAM} !important;
      --wa-color-fill-quiet: ${SURFACE_2} !important;
      --wa-color-on-quiet: ${CREAM} !important;
      --ha-button-toggle-group-button-bg-color: ${SURFACE_2} !important;
      --ha-button-toggle-group-button-color: ${MUTED} !important;
      --ha-button-toggle-group-button-selected-bg-color: ${CORAL_DEEP} !important;
      --ha-button-toggle-group-button-selected-color: ${CREAM} !important;
    }
    /* Niet-geselecteerd: subtiele surface */
    button,.button,[part="base"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      color:${CREAM}!important;
      border-color:${BORDER_HOVER}!important;
    }
    /* Geselecteerde tab → koraal vlak */
    button.selected,button[aria-selected="true"],button[selected],
    .button.selected,[part="base"].selected,
    button:has(>.selected){
      background:${CORAL_DEEP}!important;
      background-color:${CORAL_DEEP}!important;
      color:${CREAM}!important;
    }
    /* Hover op niet-selected → lichtere surface */
    button:not(.selected):not([selected]):not([aria-selected="true"]):hover,
    .button:not(.selected):hover{
      background:${SURFACE_3}!important;
      background-color:${SURFACE_3}!important;
    }
  `;

  // Web Awesome wa-button: <button part="base" class="button"> in shadow root.
  // Variants: appearance="plain|filled|outlined", variant="neutral|brand|danger".
  const WA_BUTTON_CSS = `
    :host {
      color-scheme: dark;
      --wa-color-brand-fill-loud: ${CORAL_DEEP} !important;
      --wa-color-brand-fill-quiet: ${SURFACE_2} !important;
      --wa-color-brand-on-loud: ${CREAM} !important;
      --wa-color-brand-on-quiet: ${CORAL} !important;
      --wa-color-text-link: ${CORAL} !important;
      --wa-color-text-loud: ${CORAL} !important;
      --wa-color-on-quiet: ${CORAL} !important;
      color: ${CORAL} !important;
    }
    :host([variant="danger"]),
    :host([variant="warning"]) {
      --wa-color-brand-fill-loud: ${DANGER} !important;
      --wa-color-text-link: ${DANGER} !important;
      color: ${DANGER} !important;
    }
    .button,[part="base"]{
      color:${CORAL}!important;
      background:transparent!important;
    }
    .label,[part="label"]{
      color:${CORAL}!important;
    }
    /* Filled variant: koraal vlak met crème tekst */
    :host([appearance="filled"]) .button,
    :host([appearance="filled"]) [part="base"]{
      background:${CORAL_DEEP}!important;
      color:${CREAM}!important;
    }
    :host([appearance="filled"]) .label,
    :host([appearance="filled"]) [part="label"]{
      color:${CREAM}!important;
    }
    /* Outlined variant: rand */
    :host([appearance="outlined"]) .button,
    :host([appearance="outlined"]) [part="base"]{
      border-color:${BORDER_HOVER}!important;
    }
  `;

  // Web Awesome wa-switch: <span part="control" class="switch"> +
  // <span part="thumb" class="thumb"> in shadow root.
  const WA_SWITCH_CSS = `
    :host {
      color-scheme: dark;
      --wa-color-surface-default: ${SURFACE_2} !important;
      --wa-color-fill-loud: ${CORAL_DEEP} !important;
      --wa-color-fill-loud-on-fill-loud: ${CREAM} !important;
      --wa-color-fill-quiet: ${SURFACE_2} !important;
      --wa-form-control-background-color: ${SURFACE_2} !important;
      --wa-form-control-border-color: ${BORDER_HOVER} !important;
    }
    /* Track — staat in beide states donker (Web Awesome heeft hier soms
       een fill-loud op de track gezet in selected state) */
    .switch,[part="control"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      border:1px solid ${BORDER_HOVER}!important;
    }
    /* Aan-staat track (selected) — track wordt koraal */
    :host([checked]) .switch,
    :host([aria-checked="true"]) .switch,
    :host(:state(checked)) .switch,
    :host([checked]) [part="control"],
    :host([aria-checked="true"]) [part="control"],
    :host(:state(checked)) [part="control"]{
      background:${CORAL_DEEP}!important;
      background-color:${CORAL_DEEP}!important;
      border-color:${CORAL}!important;
    }
    /* Bolletje default */
    .thumb,[part="thumb"]{
      background:${CREAM}!important;
      background-color:${CREAM}!important;
    }
    /* Aan-staat bolletje */
    :host([checked]) .thumb,
    :host([aria-checked="true"]) .thumb,
    :host(:state(checked)) .thumb,
    :host([checked]) [part="thumb"],
    :host([aria-checked="true"]) [part="thumb"],
    :host(:state(checked)) [part="thumb"]{
      background:${CREAM}!important;
      background-color:${CREAM}!important;
    }
  `;

  // Web Awesome wa-input: witte container is <div part="base" class="text-field">.
  // ha-input is een lichte HA-wrapper rondom wa-input.
  const WA_INPUT_CSS = `
    :host {
      color-scheme: dark;
      --wa-color-surface-default: ${SURFACE_2} !important;
      --wa-color-surface-raised: ${SURFACE_2} !important;
      --wa-color-fill-quiet: ${SURFACE_2} !important;
      --wa-color-text-normal: ${CREAM} !important;
      --wa-color-text-quiet: ${MUTED} !important;
      --wa-color-text-link: ${CORAL} !important;
      --wa-color-border-default: ${BORDER_HOVER} !important;
      --wa-form-control-background-color: ${SURFACE_2} !important;
      --wa-form-control-border-color: ${BORDER_HOVER} !important;
      --wa-form-control-resting-color: ${CREAM} !important;
      --wa-form-control-label-color: ${MUTED} !important;
      /* Hover/focus state tokens — voorkomt witte flash bij mouseover */
      --ha-color-form-background: ${SURFACE_2} !important;
      --ha-color-form-background-hover: ${SURFACE_3} !important;
      --ha-color-form-background-focus: ${SURFACE_2} !important;
      --ha-color-form-foreground: ${CREAM} !important;
      --ha-color-form-border: ${BORDER_HOVER} !important;
    }
    .text-field,[part="base"],[part~="base"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      border:1px solid ${BORDER_HOVER}!important;
      border-radius:8px!important;
      color:${CREAM}!important;
    }
    /* Expliciete hover/focus override — wint van Web Awesome's eigen :hover */
    :host(:hover) .text-field,
    :host(:hover) [part="base"],
    .text-field:hover,
    [part="base"]:hover{
      background:${SURFACE_3}!important;
      background-color:${SURFACE_3}!important;
      color:${CREAM}!important;
    }
    :host(:focus-within) .text-field,
    :host(:focus-within) [part="base"]{
      background:${SURFACE_2}!important;
      background-color:${SURFACE_2}!important;
      border-color:${CORAL}!important;
    }
    .control,input,input[part="input"]{
      background:transparent!important;
      background-color:transparent!important;
      color:${CREAM}!important;
      caret-color:${CREAM}!important;
      -webkit-text-fill-color:${CREAM}!important;
    }
    .label,[part="form-control-label"],[part~="label"]{
      color:${MUTED}!important
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

    'ha-time-input': TIMEINPUT_CSS,
    'ha-base-time-input': TIMEINPUT_CSS,
    'ha-input': WA_INPUT_CSS,
    'wa-input': WA_INPUT_CSS,
    'wa-switch': WA_SWITCH_CSS,
    'wa-button': WA_BUTTON_CSS,

    'ha-button-toggle-group': TOGGLE_GROUP_CSS,
    'mwc-button-toggle-group': TOGGLE_GROUP_CSS,
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
