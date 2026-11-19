// Music Tray workflow controls and project history.
(() => {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const { API } = window.ProjectView;
  let index = null; // GET /api/projects: {projects, current, template}
  let project = null;
  let live = false;
  let openTasks = new Set();
  let loadSeq = 0;      // only the newest load may render
  let writing = false;  // polling pauses while a POST is in flight
  const { esc, getJSON } = window.ProjectView;
  const time = (iso) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? esc(iso) : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };

  const PV = window.ProjectView;
  const currentCard = $('current-project');
  const activeSlot = $('active-project');
  const completedSlot = $('completed-workflows');
  const lightLeftOn = 'light-left-on-2026-11-17';
  const states = {draft: 'Draft', running: 'In progress', paused: 'Paused', done: 'Completed project', archived: 'Archived unfinished'};
  let archiveVersion;
  const rendered = new WeakMap();
  let followedLink = false;

  function status(message, error) {
    const target = $('project-status');
    target.textContent = message || '';
    target.classList.toggle('error', !!error);
  }

  function getProject(id) {
    return getJSON(`${API}/api/projects/${encodeURIComponent(id)}`);
  }

  function readProject(id) {
    return getJSON(new URL(`${encodeURIComponent(id)}/project.json`, PV.projectsBase));
  }

  async function load() {
    const my = ++loadSeq;
    const current = () => my === loadSeq;
    let data;
    let connected = false;
    let listing = null;
    try {
      if (params.has('fixture')) {
        data = await getJSON(new URL('fixture-sample.json', PV.projectsBase));
        status('Showing sample data.');
      } else {
        [data, listing] = await Promise.all([getProject('current'), getJSON(`${API}/api/projects`).catch(() => null)]);
        connected = true;
        if (current()) status('');
      }
    } catch {
      if (!current()) return;
      try {
        const pointer = await getJSON(new URL('current.json', PV.projectsBase));
        data = await readProject(pointer.id || pointer.project || pointer.current);
        if (current()) status('Project controls are available on the Chromebook.');
      } catch {
        if (!current()) return;
        $('project-meta').textContent = 'Local workflow';
        $('project-title').textContent = 'Open The Window on the Chromebook to work on a project';
        currentCard.open = false;
        updateArchive();
        return;
      }
    }
    if (!current()) return;
    const changed = project?.id !== data.id;
    if (changed) openTasks.clear();
    project = data;
    live = connected;
    index = listing;
    render(changed);
    updateArchive();
  }

  function projectMeta(p) {
    const count = PV.progress(p);
    return [states[p.state] || p.state, p.date, count.total && `${count.done} of ${count.total} tasks`].filter(Boolean).join(' · ');
  }

  function delivery(p) {
    if (!p.delivery?.href?.startsWith('/tray/')) return '';
    return `<a class="cardlink" href="${esc(PV.href(p.delivery.href, p.id))}">${esc(p.delivery.label || 'Watch the pre-render review')}</a>`;
  }

  function updateMarkup(id, markup) {
    const target = $(id);
    if (rendered.get(target) === markup) return;
    target.innerHTML = markup;
    rendered.set(target, markup);
  }

  function render(changed = false) {
    const p = project;
    const st = p.state || 'draft';
    const completed = st === 'done';
    if (completed && currentCard.parentNode === activeSlot) {
      completedSlot.before(currentCard);
      currentCard.open = false;
    } else if (!completed && currentCard.parentNode !== activeSlot) {
      activeSlot.append(currentCard);
      currentCard.open = true;
    }
    if (changed && !completed) currentCard.open = true;
    currentCard.dataset.projectId = p.id;
    $('project-title').textContent = p.title || p.id;
    $('project-meta').textContent = projectMeta(p);
    $('project-summary').hidden = !p.summary;
    $('project-summary').textContent = p.summary || '';
    updateMarkup('delivery', delivery(p));
    updateMarkup('reflections', PV.reflections(p));
    updateMarkup('links', PV.links(p));
    $('control').hidden = completed;
    $('start').disabled = !live || !['draft', 'paused'].includes(st);
    $('pause').disabled = !live || st !== 'running';
    renderNew(st);
    const sections = workflow(p, live && st === 'running');
    for (const id of ['tasks', 'notes', 'events']) updateMarkup(id, sections[id]);
    $('tasks').querySelectorAll('form.act button:disabled').forEach(button => { button.disabled = false; });
  }

  function workflow(p, editable = false) {
    const ready = new Set((p.nextReady || []).map(r => r.task));
    const tasks = p.tasks || [];
    const byId = Object.fromEntries(tasks.map(t => [t.id, t]));
    const taskMarkup = tasks.map(t => {
      const state = t.status || 'todo';
      const isReady = state === 'todo' && ready.has(t.id);
      const label = isReady ? 'ready' : state === 'todo' ? 'waiting' : state;
      const deps = (t.dependsOn || []).map(d => esc(byId[d]?.title || d)).join(', ');
      const assets = (t.assets || []).map(a => `<li><a href="${esc(PV.href(a, p.id))}">${esc(a)}</a></li>`).join('');
      const receipt = t.receipt ? `<p>Receipt: <a href="${esc(PV.href(t.receipt, p.id))}">${esc(t.receipt)}</a></p>` : '';
      return `<li><details class="task ${isReady ? 'ready' : esc(state)}" data-id="${esc(t.id)}"${p === project && openTasks.has(t.id) ? ' open' : ''}>
        <summary><span class="t-title">${esc(t.title)}</span><span class="badge">${esc(label)}</span>
        <span class="t-meta">${esc(t.owner)}${t.role ? `<span class="role">${esc(t.role)}</span>` : ''}${t.estimate ? ` · est. ${esc(t.estimate)}` : ''}${t.doneAt ? ` · done ${time(t.doneAt)}` : t.claimedAt ? ` · claimed ${time(t.claimedAt)}` : ''}</span></summary>
        <div class="body">
          ${deps ? `<p>After: ${deps}</p>` : ''}
          ${t.note ? `<p>${esc(t.note)}</p>` : ''}
          ${receipt}${assets ? `<p>Assets:</p><ul>${assets}</ul>` : ''}
          ${editable ? form(t, state, isReady) : ''}
        </div></details></li>`;
    }).join('');

    const notes = (p.notifications || []).slice().reverse().map(n => `<li><time>${time(n.at)}</time>${esc(n.sender || '?')} → ${esc(n.owner || '')}: ${esc(byId[n.task]?.title || n.task || '')} <span class="nstat ${esc(n.status || 'pending')}">${esc(n.status || 'pending')}</span>${n.key ? ` <span class="muted">${esc(n.key)}</span>` : ''}</li>`).join('');
    const events = (p.events || []).slice().reverse().map(e => `<li><time>${time(e.at)}</time>${esc(e.actor)} · ${esc(e.type)}${e.task ? ` · ${esc(byId[e.task]?.title || e.task)}` : ''}${e.note ? ` — ${esc(e.note)}` : ''}</li>`).join('');
    const empty = '<li>None yet.</li>';
    return { tasks: taskMarkup || empty, notes: notes || empty, events: events || empty };
  }

  function addHistory(container, id, includeOverview) {
    const details = document.createElement('details');
    details.className = 'workflow-section';
    details.innerHTML = '<summary>Tasks, receipts and activity</summary><div></div>';
    const content = details.lastElementChild;
    details.addEventListener('toggle', async () => {
      if (!details.open || details.dataset.loaded) return;
      details.dataset.loaded = 'loading';
      content.textContent = 'Loading project history…';
      try {
        const p = await getProject(id).catch(() => readProject(id));
        const {tasks, notes, events} = workflow(p);
        content.innerHTML = (includeOverview ? delivery(p) + (p.summary ? `<p>${esc(p.summary)}</p>` : '') : '') +
          PV.reflections(p) + PV.links(p) + `<ol class="tasks">${tasks}</ol>
          <details class="workflow-section"><summary>Notifications</summary><ul class="log">${notes}</ul></details>
          <details class="workflow-section"><summary>Events</summary><ul class="log">${events}</ul></details>`;
        details.dataset.loaded = 'ready';
      } catch {
        content.textContent = 'Project history is available on the Chromebook. Close and reopen to retry.';
        delete details.dataset.loaded;
      }
    });
    container.replaceChildren(details);
    return details;
  }

  function updateArchive() {
    const entries = (index?.projects || []).filter(p => p.id !== project?.id && p.id !== lightLeftOn);
    const version = JSON.stringify(entries);
    if (version !== archiveVersion) {
      archiveVersion = version;
      completedSlot.replaceChildren();
      $('archive-unfinished').replaceChildren();
      const localHistory = $('light-left-on-workflow');
      if (!localHistory.childElementCount) addHistory(localHistory, lightLeftOn, false);

      for (const p of entries.sort((a, b) => String(b.date).localeCompare(String(a.date)))) {
        if (!['done', 'archived'].includes(p.state)) continue;
        const card = document.createElement('details');
        card.className = 'project-card';
        card.id = 'project-' + p.id;
        card.innerHTML = `<summary><div class="meta">${esc(projectMeta(p))}</div><h2>${esc(p.title || p.id)}</h2></summary><div class="inner"></div>`;
        const history = addHistory(card.lastElementChild, p.id, true);
        card.addEventListener('toggle', () => { if (card.open && !history.dataset.loaded) history.open = true; });
        (p.state === 'done' ? completedSlot : $('archive-unfinished')).append(card);
      }
    }
    const showNew = !$('newproj').hidden;
    const hasUnfinished = !!$('archive-unfinished').childElementCount;
    const completed = project?.state === 'done';
    $('project-management').hidden = !showNew && !hasUnfinished && !completed;
    $('management-meta').textContent = completed ? 'No active project' : 'Project setup';
    $('management-title').textContent = showNew ? 'New project' : hasUnfinished ? 'Unfinished projects' : 'All projects complete';
    if (followedLink || !params.has('id')) return;
    const id = params.get('id');
    const target = id === project?.id ? currentCard : document.getElementById('project-' + id);
    if (target) {
      followedLink = true;
      target.closest('#archive-unfinished')?.closest('#project-management')?.setAttribute('open', '');
      target.open = true;
      const history = target.querySelector('.workflow-section');
      if (history) history.open = true;
      target.scrollIntoView({block: 'start'});
    }
  }

  function form(t, s, isReady) {
    const actor = `<label>Who<input name="actor" value="${esc(t.owner || '')}" required></label>`;
    if (s === 'claimed') return `<form class="act" data-task="${esc(t.id)}">${actor}
      <label>Receipt (in receipts/)<input name="receipt" value="receipts/${esc(t.id)}.md" required></label>
      <label>Assets (one per line, in assets/)<textarea name="assets" placeholder="assets/…"></textarea></label>
      <label>Note<input name="note"></label>
      <div class="buttons"><button name="action" value="complete">Complete</button><button class="quiet" name="action" value="block">Block</button></div></form>`;
    if (s === 'blocked') return `<form class="act" data-task="${esc(t.id)}">${actor}<label>Note<input name="note"></label>
      <div class="buttons"><button name="action" value="unblock">Unblock</button></div></form>`;
    if (isReady) return `<form class="act" data-task="${esc(t.id)}">${actor}<label>Note<input name="note"></label>
      <div class="buttons"><button name="action" value="claim">Claim</button></div></form>`;
    return '';
  }

  const OWNERS = ['Claude', 'Sunny', 'Terry', 'Antigravity'];
  const DEFAULT_ROLES = { music: 'Sunny', words: 'Claude', visuals: 'Sunny', assembly: 'Claude', review: 'Claude' };
  function renderNew(st) {
    const show = live && !!index && project.id === index.current && ['done', 'paused'].includes(st);
    $('newproj').hidden = !show;
    if (!show || $('roles').childElementCount) return;
    const roles = index.template?.roles || Object.keys(DEFAULT_ROLES);
    $('roles').innerHTML = roles.map((r) => `<label>${esc(r)}<select name="role-${esc(r)}">${OWNERS.map((o) => `<option${o === (DEFAULT_ROLES[r] || 'Claude') ? ' selected' : ''}>${o}</option>`).join('')}</select></label>`).join('');
  }
  $('newform').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (writing) return;
    const fd = new FormData(e.target);
    const roles = {};
    for (const [k, v] of fd) if (k.startsWith('role-')) roles[k.slice(5)] = v;
    writing = true; ++loadSeq;
    try {
      const r = await fetch(`${API}/api/projects/new`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'Christopher', revision: project.revision, title: fd.get('title'), roles }) });
      const data = await r.json().catch(() => ({}));
      writing = false;
      if (r.status === 409) { status('The project changed just now. Reloaded; please try again.', true); return load(); }
      if (!r.ok) { status(`Not created: ${data.error || r.status}`, true); return; }
      e.target.reset(); $('roles').innerHTML = '';
      status(`Created “${data.title || data.id}” as a draft.`);
      await load();
    } catch (err) { writing = false; status('The local Window service didn’t answer.', true); }
  });

  async function act(action, body) {
    if (writing) return;
    writing = true; ++loadSeq; // invalidate any GET already in flight
    document.querySelectorAll('#control button, form.act button').forEach((b) => { b.disabled = true; });
    try {
      const r = await fetch(`${API}/api/projects/${encodeURIComponent(project.id)}/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision: project.revision, ...body }),
      });
      const data = await r.json().catch(() => ({}));
      writing = false;
      if (r.status === 409) { status('Someone else changed the project just now. Reloaded; please try again.', true); return load(); }
      if (!r.ok) { status(`Not done: ${data.error || r.status}`, true); return render(); }
      status(`${action} saved.`);
      await load();
    } catch (e) { writing = false; status('The local Window service didn’t answer.', true); render(); }
  }

  $('start').addEventListener('click', () => act('start', { actor: 'Christopher' }));
  $('pause').addEventListener('click', () => act('pause', { actor: 'Christopher' }));
  $('tasks').addEventListener('toggle', (e) => { const id = e.target.dataset?.id; if (id) e.target.open ? openTasks.add(id) : openTasks.delete(id); }, true);
  $('tasks').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target; const fd = new FormData(f); const action = e.submitter?.value || 'claim';
    const body = { actor: fd.get('actor'), task: f.dataset.task };
    if (fd.get('note')) body.note = fd.get('note');
    if (action === 'complete') {
      body.receipt = fd.get('receipt');
      body.assets = String(fd.get('assets') || '').split('\n').map((s) => s.trim()).filter(Boolean);
    }
    act(action, body);
  });

  load();
  // Poll every 10 s, but never mid-write and never over a form with unsent input.
  const formInUse = () => !!document.activeElement?.closest?.('form.act') ||
    [...document.querySelectorAll('form.act input, form.act textarea')].some((el) => el.value !== el.defaultValue);
  setInterval(() => { if (!writing && !formInUse() && !params.has('fixture') && !document.hidden) load(); }, 10000);
})();
