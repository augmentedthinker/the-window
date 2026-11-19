(() => {
  const key = 'window-editor-view';
  const controls = [...document.querySelectorAll('[data-editor-view][aria-pressed]')];
  const preferred = matchMedia('(min-width: 761px) and (pointer: fine)').matches ? 'desktop' : 'phone';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const explicit = new URL(location.href).searchParams.get('view');

  function apply(view) {
    document.body.dataset.editorView = view;
    for (const control of controls) {
      control.setAttribute('aria-pressed', String(control.dataset.editorView === view));
    }
  }

  apply([explicit, saved, preferred].find(view => view === 'phone' || view === 'desktop'));
  for (const control of controls) {
    control.addEventListener('click', () => {
      const view = control.dataset.editorView;
      apply(view);
      try { localStorage.setItem(key, view); } catch {}
      const url = new URL(location.href);
      if (url.searchParams.has('view')) {
        url.searchParams.delete('view');
        history.replaceState(null, '', url);
      }
    });
  }
})();
