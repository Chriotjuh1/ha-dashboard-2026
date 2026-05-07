// claude-fonts.js
// Loads Fraunces (serif) + Inter (sans) from Google Fonts
// for the Claude Dark theme. Required because @import inside
// the theme's card-mod-root-yaml is blocked by HA's CSP in
// most setups.
//
// Install: copy to /config/www/claude-fonts.js
// Then add to configuration.yaml under frontend:
//   extra_module_url:
//     - /local/claude-fonts.js
//
// After restart + hard refresh (Ctrl+Shift+R) the fonts will
// be available globally, including inside Lovelace shadow DOMs.

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
