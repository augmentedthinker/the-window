window.ProjectView = (() => {
  const me = document.currentScript ? document.currentScript.src : location.href;
  const projectsBase = new URL('./', me);           // .../tray/projects/
  const trayBase = new URL('../', projectsBase);     // .../tray/
  const API = location.protocol === 'file:' ? 'http://127.0.0.1:8860' : '';
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  async function getJSON(url, opts) { const r = await fetch(url, { cache: 'no-store', ...opts }); if (!r.ok) throw new Error(r.status); return r.json(); }
  // "/tray/x" resolves inside this Tray (works from the service or as a file); relative hrefs resolve against the project folder.
  function href(h, projectId) {
    if (/^https?:/.test(h)) return h;
    if (h.startsWith('/tray/')) return new URL(h.slice(6), trayBase).href;
    return new URL(h, new URL(`${encodeURIComponent(projectId)}/`, projectsBase)).href;
  }
  function progress(p) {
    if (p.progress) return p.progress;
    const t = p.tasks || []; return { done: t.filter((x) => x.status === 'done').length, total: t.length };
  }
  function reflections(p) {
    const items=p.reflections||[];if(!items.length)return '';
    return `<section class="pv-reflections"><h3>Process reflections</h3>${items.map(x=>`<a style="display:inline-block;padding:.6rem" href="${esc(href(x.href,p.id))}">${esc(x.label)}</a>`).join('')}</section>`;
  }
  function links(p) {
    const l = p.links || []; if (!l.length) return '';
    return `<details class="pv-links"><summary>Plan and discussion</summary><ul>${l.map((x) => `<li><a href="${esc(href(x.href, p.id))}">${esc(x.label)}</a></li>`).join('')}</ul></details>`;
  }
  return { API, esc, getJSON, href, progress, reflections, links, projectsBase, trayBase };
})();
