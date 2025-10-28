document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header.site-header');
  if (!header) return;
  const toggle = header.querySelector('.nav-toggle');
  const nav = header.querySelector('nav');
  if (!toggle || !nav) return;

  // Force a Thai label using Unicode escapes to avoid encoding issues
  // "☰ เมนู"
  toggle.textContent = '\u2630 \u0e40\u0e21\u0e19\u0e39';
  toggle.setAttribute('aria-label', '\u0e40\u0e1b\u0e34\u0e14/\u0e1b\u0e34\u0e14 \u0e40\u0e21\u0e19\u0e39');

  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('open');
    nav.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });

  // Auto-close when a link is clicked
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });
});
