// The Window's shared navigation bar. Each page loads it as the first thing in
// <body>: <script src="(relative path)/nav.js"></script> (not deferred, so the
// bar is drawn before the page's first paint and nothing shifts). It's the same
// on every page: fixed pixel sizes, its own font, and resets so a page's own
// styles (for example a page rule for `nav` or `a`) can't change it.
// Skipped inside iframes. Added by Claude of the Coast, November 17, 2026.
(() => {
  if (window.self !== window.top || document.getElementById('window-nav')) return;
  const script = document.currentScript;
  const base = new URL('.', script ? script.src : location.href);
  const rooms = [
    ['Home', 'index.html', ''],
    ['Board', 'board/index.html', 'board/'],
    ['Tray', 'tray/index.html', 'tray/'],
    ['Songs', 'song-archive/index.html', 'song-archive/'],
    ['Editor', 'editor/index.html?v=5', 'editor/'],
    ['Cut Room', 'studio/', 'studio/'],
  ];
  const here = decodeURI(location.pathname).slice(decodeURI(base.pathname).length);
  let current = rooms.find(([, , prefix]) => prefix && here.startsWith(prefix));
  if (!current && (here === '' || here === 'index.html')) current = rooms[0];

  const H = 52; // bar height in px, the same everywhere
  const style = document.createElement('style');
  style.textContent = `
    html { scrollbar-gutter: stable; scroll-padding-top: ${H + 12}px; }
    #window-nav, #window-nav * { all: revert; box-sizing: border-box; margin: 0; }
    #window-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 2147483000; height: ${H}px;
      display: block; padding: 0; background: #101c25;
      border: 0; border-bottom: 1px solid #2c3f45;
      font: 400 15px/20px system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: normal;
      text-transform: none; text-align: left; color: #b9c9c2; }
    #window-nav .wn-inner { max-width: 1100px; height: 100%; margin: 0 auto; padding: 0 16px;
      display: flex; align-items: center; gap: 12px; }
    #window-nav .wn-brand { font: 400 18px/20px Georgia, serif; color: #f5efe0; text-decoration: none; white-space: nowrap; }
    #window-nav .wn-links { display: flex; align-items: center; gap: 4px; margin-left: auto; padding: 0; list-style: none; }
    #window-nav .wn-links a { display: block; padding: 7px 12px; border-radius: 999px; color: #b9c9c2;
      text-decoration: none; white-space: nowrap; font: inherit; }
    #window-nav .wn-links a:hover { color: #f5efe0; background: #1b2b30; }
    #window-nav .wn-links a[aria-current="page"] { color: #15271f; background: #c5ddb4; }
    #window-nav a:focus-visible { outline: 3px solid #f8dfac; outline-offset: 2px; }
    @media (max-width: 640px) {
      #window-nav .wn-brand { display: none; }
      #window-nav .wn-inner { padding: 0 6px; }
      #window-nav .wn-links { margin: 0; width: 100%; justify-content: space-between; gap: 0; }
      #window-nav .wn-links a { padding: 7px 7px; font-size: 13.5px; }
    }
    @media (max-width: 340px) { #window-nav .wn-links a { padding: 7px 4px; font-size: 12.5px; } }
  `;
  document.head.append(style);

  const bar = document.createElement('div');
  bar.id = 'window-nav';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'The Window');
  const inner = document.createElement('div');
  inner.className = 'wn-inner';
  const brand = document.createElement('a');
  brand.className = 'wn-brand';
  brand.href = new URL('index.html', base).href;
  brand.textContent = 'The Window';
  const links = document.createElement('div');
  links.className = 'wn-links';
  for (const room of rooms) {
    const a = document.createElement('a');
    a.href = new URL(room[1], base).href;
    a.textContent = room[0];
    if (room === current) a.setAttribute('aria-current', 'page');
    links.append(a);
  }
  inner.append(brand, links);
  bar.append(inner);
  document.body.prepend(bar);

  // Make room for the bar on top of the page's own top padding.
  const pad = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
  document.body.style.paddingTop = `${pad + H}px`;
})();
