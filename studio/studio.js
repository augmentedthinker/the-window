import { frameAt } from './composition.js';
import { FORMAT, KINDS, EFFECTS, assetLocations, defaultInstrument, localPath, mediaName, mediaType, normalize } from './project.js';

const $ = id => document.getElementById(id);
const audio = $('soundtrack');
const video = $('clip');
const picture = $('picture');
const seek = $('seek');
const report = message => { $('status').textContent = message; };
const editable = ['scene-name', 'duration', 'kind', 'asset', 'motion', 'effect', 'source-start', 'fade-in', 'fade-out'];
const instrumentFields = [...document.querySelectorAll('[data-axis]')];
const SOURCE_LIMIT = 768 * 1024 * 1024;
const SHARED_LIMIT = 128 * 1024 * 1024;
const DEFAULT_PROJECT = 'the-missing-beat-suno';
const SHARED_ID = /^[a-f0-9]{64}$/;
const stillFrames = new Map();
const silence = Array(25).fill(0);
let project;
let files = new Map();
let controls;
let analyser;
let context;
let spectrum;
let audioKey = '';
let videoKey = '';
let offsets = [];
let pixelsPerSecond = 20;
let duration = 0;
let selected = -1;
let current = 0;
let playing = false;
let clockBase = 0;
let loop;
let dirty = false;
let loadVersion = 0;
let audioVersion = 0;

function formatTime(time, fractional = false) {
  const whole = Math.floor(Math.max(0, time) * (fractional ? 100 : 1));
  const seconds = Math.floor(whole / (fractional ? 100 : 1));
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') +
    (fractional ? '.' + String(whole % 100).padStart(2, '0') : '');
}

function option(value, label) { return new Option(label, value); }

function assetChoices(select, types, value, empty) {
  const items = project.assets.filter(asset => types.includes(asset.type));
  select.replaceChildren(option('', empty), ...items.map(asset => option(asset.path, (asset.name || mediaName(asset.path)) +
    (files.has(asset.path) ? '' : ' (missing)'))));
  select.value = value;
}

function blankShot(name = 'New scene') {
  return { id: crypto.randomUUID(), name, kind: 'Story', duration: 4, media: '', motion: 'in', effect: 'none', fadeIn: 0, fadeOut: 0, sourceStart: 0, notes: '' };
}

function assetUrl(path) { return files.get(path)?.url || ''; }

function loadStill(path) {
  const src = assetUrl(path);
  if (!src) return null;
  if (!stillFrames.has(src)) {
    const image = new Image();
    image.onload = draw;
    image.onerror = draw;
    image.src = src;
    stillFrames.set(src, image);
  }
  const image = stillFrames.get(src);
  return image.complete && image.naturalWidth ? image : null;
}

function addFile(map, path, blob) {
  if (map.has(path)) return;
  map.set(path, { blob, url: URL.createObjectURL(blob) });
}

function releaseFiles(map) {
  for (const file of map.values()) if (file.blob) URL.revokeObjectURL(file.url);
}

function reband(values) {
  return Array.from({ length: 24 }, (_, band) => {
    const start = band * 4 / 3;
    const end = (band + 1) * 4 / 3;
    let total = 0;
    for (let i = Math.floor(start); i < Math.ceil(end); i++) {
      total += (values[i] || 0) * (Math.min(i + 1, end) - Math.max(i, start));
    }
    return Math.round(total * .75);
  });
}

function translateControls(data) {
  if (!data || typeof data !== 'object') throw Error('Invalid audio controls.');
  if (typeof data.bands === 'string' && typeof data.rms === 'string') {
    const bands = atob(data.bands);
    const rms = atob(data.rms);
    const count = Math.min(Math.floor(bands.length / 32), rms.length);
    if (count > 300000) throw Error('Too many audio control frames.');
    return {
      fps: data.fps, frames: Array.from({ length: count }, (_, i) => [
        rms.charCodeAt(i), ...reband(Array.from(bands.slice(i * 32, i * 32 + 32), byte => byte.charCodeAt(0))),
      ]),
    };
  }
  const frames = Array.isArray(data) ? data : data.frames;
  if (Array.isArray(frames) && frames.length > 300000) throw Error('Too many audio control frames.');
  if (Array.isArray(frames) && Array.isArray(frames[0]?.bands)) {
    const byte = value => Math.round(Math.max(0, Math.min(1, value)) * 255);
    return {
      fps: Array.isArray(data) ? 24 : data.fps,
      frames: frames.map(frame => [byte(frame.rms), ...reband(frame.bands.map(byte))]),
    };
  }
  return data;
}

async function readControls() {
  const version = ++audioVersion;
  controls = undefined;
  const path = assetUrl(project.controls);
  if (path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw Error('Audio controls are missing.');
      const data = translateControls(await response.json());
      if (!Number.isFinite(data.fps) || data.fps <= 0 || !Array.isArray(data.frames) ||
          data.frames.some(frame => !Array.isArray(frame) || frame.length !== 25 ||
            frame.some(value => !Number.isFinite(value) || value < 0 || value > 255))) {
        throw Error('Audio controls have an unsupported format.');
      }
      if (version !== audioVersion) return;
      controls = data;
    } catch (error) {
      if (version === audioVersion) report(error.message);
    }
  }
  if (version === audioVersion) {
    renderWave();
    draw();
  }
}

function spectrumAt(time) {
  if (controls?.frames.length) {
    const index = Math.max(0, Math.min(controls.frames.length - 1, Math.floor(time * controls.fps)));
    const values = controls.frames[index];
    return values.map(value => value / 255);
  }
  if (!playing || !analyser || audio.paused) return silence;
  analyser.getByteFrequencyData(spectrum);
  const hzPerBin = context.sampleRate / analyser.fftSize;
  const bands = [];
  for (let i = 0; i < 24; i++) {
    const start = Math.floor(38 * (14000 / 38) ** (i / 24) / hzPerBin);
    const end = Math.max(start + 1, Math.floor(38 * (14000 / 38) ** ((i + 1) / 24) / hzPerBin));
    let peak = 0;
    for (let bin = start; bin < end && bin < spectrum.length; bin++) peak = Math.max(peak, spectrum[bin]);
    bands.push(peak / 255);
  }
  return [bands.reduce((sum, value) => sum + value, 0) / 24, ...bands];
}

function draw() {
  if (!project) return;
  const index = offsets.findLastIndex(start => start <= current);
  const shot = project.scenes[index];
  const local = current - (offsets[index] || 0);
  const src = shot?.kind !== 'Abstract' ? assetUrl(shot?.media) : '';
  for (const upcoming of project.scenes.slice(index + 1, index + 3)) {
    if (upcoming.kind !== 'Abstract' && project.assets.some(asset => asset.path === upcoming.media && asset.type === 'image')) {
      loadStill(upcoming.media);
    }
  }
  let plate;
  if (src && project.assets.some(asset => asset.path === shot.media && asset.type === 'video')) {
    if (videoKey !== src) {
      videoKey = src;
      video.src = src;
      video.load();
    }
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      const time = Math.min(Math.max(0, video.duration - .025), local + shot.sourceStart);
      if (Number.isFinite(time) && Math.abs(video.currentTime - time) > (playing ? .24 : .018)) video.currentTime = time;
      if (playing && video.paused && video.currentTime < video.duration - .05) void video.play().catch(() => {});
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) plate = video;
    }
  } else {
    if (!video.paused) video.pause();
    if (src) plate = loadStill(shot.media);
  }
  const visibleShot = !playing && current === 0 && shot?.fadeIn ? { ...shot, fadeIn: 0 } : shot;
  frameAt(project, picture, visibleShot, plate, current, local, spectrumAt(current));
  seek.value = current;
  $('clock').textContent = formatTime(current, true);
  $('cursor').style.left = Math.max(0, current * pixelsPerSecond - 1) + 'px';
}

function renderWave() {
  const target = $('wave');
  target.replaceChildren();
  if (!controls || !duration || !controls.frames.length) return;
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(14000, Math.ceil(duration * pixelsPerSecond));
  canvas.height = 22;
  target.append(canvas);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#a68dbe';
  for (let x = 0; x < canvas.width; x++) {
    const frame = controls.frames[Math.floor(x / canvas.width * duration * controls.fps)];
    const height = frame ? Math.max(1, frame[0] / 255 * 19) : 0;
    ctx.fillRect(x, (22 - height) / 2, 1, height);
  }
}

function renderTimeline() {
  const track = $('track');
  track.replaceChildren();
  const ruler = $('ruler');
  ruler.replaceChildren();
  offsets = [];
  duration = 0;
  for (const shot of project.scenes) {
    offsets.push(duration);
    duration += shot.duration;
  }
  pixelsPerSecond = Math.min(Number($('zoom').value), 24000 / Math.max(1, duration));
  const timeline = $('timeline');
  timeline.style.width = Math.ceil(duration * pixelsPerSecond) + 'px';
  seek.max = duration;
  current = Math.min(current, duration);
  $('total').textContent = formatTime(duration, true);
  $('summary').textContent = project.scenes.length + (project.scenes.length === 1 ? ' scene' : ' scenes') +
    ' · ' + (project.frame === 'portrait' ? '9∶16' : '16∶9') + (project.bpm ? ' · ' + project.bpm + ' BPM' : '') +
    (project.audio ? ' · ' + (project.assets.find(asset => asset.path === project.audio)?.name || mediaName(project.audio)) : '');
  $('play').disabled = duration === 0;
  const step = Math.max(5, Math.ceil(58 / pixelsPerSecond / 5) * 5);
  for (let time = 0; time < duration; time += step) {
    const tick = document.createElement('span');
    tick.textContent = formatTime(time);
    tick.style.left = time * pixelsPerSecond + 'px';
    ruler.append(tick);
  }
  project.scenes.forEach((shot, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shot';
    button.dataset.kind = shot.kind;
    button.style.width = shot.duration * pixelsPerSecond + 'px';
    button.setAttribute('aria-label', formatTime(offsets[index], true) + ' ' + shot.name);
    button.setAttribute('aria-pressed', String(index === selected));
    button.title = shot.name + ' · ' + shot.duration.toFixed(2) + ' s';
    const src = shot.kind === 'Abstract' ? '' : assetUrl(shot.media);
    if (src && project.assets.some(asset => asset.path === shot.media && asset.type === 'image')) {
      const image = new Image();
      image.alt = '';
      image.src = src;
      image.loading = 'lazy';
      button.append(image);
    }
    const time = document.createElement('small');
    time.textContent = formatTime(offsets[index]);
    const title = document.createElement('b');
    title.textContent = shot.name;
    button.append(time, title);
    button.addEventListener('click', () => {
      selected = index;
      for (const [i, node] of [...track.children].entries()) node.setAttribute('aria-pressed', String(i === index));
      setPosition(offsets[index]);
      showInspector();
    });
    button.addEventListener('dblclick', () => showSceneSettings(true));
    track.append(button);
  });
  renderWave();
  const cues = $('cues');
  cues.replaceChildren();
  for (const cue of project.cues.filter(cue => cue.time <= duration)) {
    const control = document.createElement('button');
    control.type = 'button';
    const time = document.createElement('time');
    time.textContent = formatTime(cue.time);
    control.append(time, cue.label);
    control.onclick = () => setPosition(cue.time);
    cues.append(control);
  }
  cues.hidden = !cues.childElementCount;
  draw();
}

function showInspector() {
  const shot = project.scenes[selected];
  $('fields').disabled = !shot;
  $('inspect-toggle').disabled = !shot;
  if (!shot) showSceneSettings(false);
  if (!shot) {
    for (const id of editable) $(id).value = '';
    $('scene-note').textContent = 'Select a scene on the timeline.';
    return;
  }
  $('scene-name').value = shot.name;
  $('duration').value = Number(shot.duration.toFixed(6));
  $('kind').value = shot.kind;
  $('motion').value = shot.motion;
  $('fade-in').value = shot.fadeIn || 0;
  $('fade-out').value = shot.fadeOut || 0;
  $('source-start').value = shot.sourceStart || 0;
  assetChoices($('asset'), ['image', 'video'], shot.media, 'Choose media');
  $('effect').replaceChildren(...Object.entries(EFFECTS[shot.kind]).map(([value, label]) => option(value, label)));
  $('effect').value = shot.effect;
  $('effect-label').hidden = shot.kind === 'Story';
  $('instrument-panel').hidden = shot.kind !== 'Environmental' || !shot.instrument;
  for (const field of instrumentFields) field.value = shot.instrument?.[field.dataset.axis] ?? '';
  $('asset-label').hidden = shot.kind === 'Abstract';
  $('motion-label').hidden = shot.kind === 'Abstract';
  $('clip-label').hidden = !project.assets.some(asset => asset.path === shot.media && asset.type === 'video');
  $('scene-note').textContent = shot.notes;
  $('earlier').disabled = selected <= 0;
  $('later').disabled = selected >= project.scenes.length - 1;
}

function showMedia() {
  assetChoices($('audio-source'), ['audio', 'video'], project.audio, 'No soundtrack');
  $('media').replaceChildren(...project.assets.map(asset => {
    const item = document.createElement('li');
    const name = asset.name || mediaName(asset.path);
    const available = files.has(asset.path);
    item.title = asset.path;
    if (asset.type === 'image' && available) {
      const thumb = new Image();
      thumb.alt = '';
      thumb.src = assetUrl(asset.path);
      thumb.loading = 'lazy';
      item.append(thumb);
    }
    const label = document.createElement('div');
    label.className = 'media-name';
    label.textContent = name;
    const detail = document.createElement('small');
    detail.textContent = asset.type + (available ? '' : ' · Missing file');
    label.append(detail);
    item.append(label);
    if (available && ['image', 'video'].includes(asset.type)) {
      const add = document.createElement('button');
      add.type = 'button';
      add.textContent = 'Add';
      add.setAttribute('aria-label', 'Add ' + name + ' as a scene');
      add.onclick = () => addScene(asset);
      item.append(add);
    }
    return item;
  }));
}

function showSceneSettings(open) {
  $('inspect').hidden = !open;
  $('inspect-toggle').setAttribute('aria-expanded', String(open));
}

function refresh() {
  renderTimeline();
  showInspector();
  showMedia();
}

function setPosition(time) {
  current = Math.max(0, Math.min(time, duration));
  clockBase = performance.now() - current * 1000;
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
    audio.currentTime = Math.min(audio.duration, current);
    if (playing && audio.paused && current < audio.duration) void audio.play().catch(() => {});
  }
  draw();
}

function pause() {
  cancelAnimationFrame(loop);
  playing = false;
  audio.pause();
  video.pause();
  $('play').textContent = 'Play';
}

function connectAnalyser() {
  if (!context) {
    context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    spectrum = new Uint8Array(analyser.frequencyBinCount);
    context.createMediaElementSource(audio).connect(analyser);
    analyser.connect(context.destination);
  }
  if (context.state === 'suspended') void context.resume().catch(() => {});
}

function animate(now) {
  const audioClock = audioKey && !audio.paused && !audio.ended && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  if (audioClock) {
    current = audio.currentTime;
    clockBase = now - current * 1000;
  } else {
    current = Math.max(0, (now - clockBase) / 1000);
  }
  if (current >= duration) {
    current = duration;
    pause();
    draw();
    return;
  }
  draw();
  loop = requestAnimationFrame(animate);
}

function applyAudio() {
  const next = assetUrl(project.audio);
  if (audioKey !== next) {
    audioKey = next;
    if (next) audio.src = next;
    else audio.removeAttribute('src');
    audio.load();
  }
  void readControls();
}

function setProject(next, available) {
  pause();
  releaseFiles(files);
  stillFrames.clear();
  video.removeAttribute('src');
  video.load();
  videoKey = '';
  files = available;
  project = next;
  dirty = false;
  $('shared-link').hidden = true;
  selected = project.scenes.length ? 0 : -1;
  current = 0;
  $('title').value = project.title;
  document.title = project.title + ' · Cut Room';
  picture.width = project.frame === 'portrait' ? 540 : 960;
  picture.height = project.frame === 'portrait' ? 960 : 540;
  $('stage').style.setProperty('--frame-ratio', picture.width + ' / ' + picture.height);
  applyAudio();
  refresh();
  showSceneSettings(false);
  $('timeline-scroll').scrollLeft = 0;
  const missing = project.assets.filter(asset => !files.has(asset.path)).length;
  report(missing ? missing + ' media file' + (missing === 1 ? ' is' : 's are') + ' missing. Add them in Media.' : '');
}

function mayReplace() {
  return !dirty || confirm('Open another project and discard edits that have not been packaged?');
}

function projectLink(key, value) {
  const url = new URL(location.href);
  url.searchParams.delete('shared');
  url.searchParams.delete('project');
  if (key) url.searchParams.set(key, value);
  return url;
}

function showSharedLink(id) {
  const link = $('shared-link');
  link.href = projectLink('shared', id);
  link.hidden = false;
}

async function openShared(slug = DEFAULT_PROJECT) {
  const version = ++loadVersion;
  try {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw Error('The shared project name is invalid.');
    const base = new URL('projects/' + slug + '/', location.href);
    const response = await fetch(new URL('project.json', base));
    if (!response.ok) throw Error('The shared project could not load.');
    const next = normalize(await response.json());
    const maps = new Map(assetLocations(next).map(path => [path, { url: new URL(path, base).href }]));
    if (version === loadVersion) {
      setProject(next, maps);
      history.replaceState(null, '', projectLink('project', slug));
    }
  } catch (error) {
    if (version === loadVersion) report(error.message);
  }
}

async function openFile(file, sharedId) {
  const version = ++loadVersion;
  const available = new Map();
  try {
    if (file.size > SOURCE_LIMIT) throw Error('Project packages can be up to 768 MB.');
    let next;
    if (/\.zip$/i.test(file.name)) {
      const zip = await JSZip.loadAsync(file);
      const manifests = Object.keys(zip.files).filter(path => !zip.files[path].dir && /(^|\/)project\.json$/i.test(path));
      if (manifests.length !== 1) throw Error('The ZIP must contain one project.json.');
      const manifest = manifests[0];
      if (zip.file(manifest).unsafeOriginalName !== manifest) throw Error('Invalid project manifest path.');
      const base = manifest.slice(0, -'project.json'.length);
      next = normalize(JSON.parse(await zip.file(manifest).async('string')));
      let total = 0;
      for (const path of assetLocations(next)) {
        const entry = zip.file(base + path);
        if (!entry || entry.unsafeOriginalName !== base + path) continue;
        const content = await entry.async('blob');
        total += content.size;
        if (total > SOURCE_LIMIT) throw Error('Expanded package media can be up to 768 MB.');
        addFile(available, path, content);
      }
    } else {
      next = normalize(JSON.parse(await file.text()));
    }
    if (version !== loadVersion) {
      releaseFiles(available);
      return;
    }
    setProject(next, available);
    history.replaceState(null, '', projectLink(sharedId ? 'shared' : '', sharedId));
    if (sharedId) showSharedLink(sharedId);
  } catch (error) {
    releaseFiles(available);
    if (version === loadVersion) report('Could not open project. ' + error.message);
  }
}

async function openSharedPackage(id) {
  if (!SHARED_ID.test(id)) return report('Invalid shared project link.');
  const version = ++loadVersion;
  try {
    const response = await fetch('shared/' + id + '.zip');
    if (!response.ok) throw Error('This shared project is unavailable.');
    const file = new File([await response.blob()], id + '.zip', { type: 'application/zip' });
    if (version === loadVersion) await openFile(file, id);
  } catch (error) {
    if (version === loadVersion) report(error.message);
  }
}

async function openLibrary() {
  const dialog = $('project-library');
  const status = $('project-library-status');
  const list = $('project-library-list');
  list.replaceChildren();
  status.textContent = 'Loading projects…';
  dialog.showModal();
  const read = async url => {
    const response = await fetch(url);
    if (!response.ok) throw Error('Project list unavailable.');
    return response.json();
  };
  const [featured, shared] = await Promise.allSettled([read('projects/catalog.json'), read('/api/studio/projects')]);
  if (!dialog.open) return;
  const entries = (featured.status === 'fulfilled' ? featured.value : []).map(item => ({
    title: item.title, detail: item.detail, open: () => openShared(item.slug),
  }));
  if (shared.status === 'fulfilled') {
    for (const item of shared.value.projects) {
      entries.push({
        title: item.title, detail: 'Shared revision · ' + item.scenes + ' scenes · ' + formatTime(item.duration) +
          ' · ' + new Date(item.sharedAt).toLocaleDateString(),
        open: () => openSharedPackage(item.id),
      });
    }
  }
  for (const entry of entries) {
    const item = document.createElement('li');
    const control = document.createElement('button');
    control.type = 'button';
    const detail = document.createElement('small');
    detail.textContent = entry.detail;
    control.append(entry.title, detail);
    control.onclick = () => {
      if (!mayReplace()) return;
      dialog.close();
      void entry.open();
    };
    item.append(control);
    list.append(item);
  }
  status.textContent = featured.status === 'rejected' || shared.status === 'rejected'
    ? 'Part of the project library is unavailable.' : entries.length ? '' : 'There are no shared projects yet.';
}

function loadMedia(list) {
  for (const file of list) {
    const fullName = localPath(file.webkitRelativePath || file.name);
    if (project.controls && !files.has(project.controls) &&
        (fullName === project.controls || fullName.endsWith('/' + project.controls) ||
          file.name === mediaName(project.controls))) {
      addFile(files, project.controls, file);
      dirty = true;
      continue;
    }
    const type = mediaType(fullName);
    if (!type) continue;
    const missing = project.assets.filter(asset => !files.has(asset.path));
    let path = missing.find(asset => fullName === asset.path || fullName.endsWith('/' + asset.path))?.path;
    if (!path) {
      const candidates = missing.filter(asset => mediaName(asset.path) === file.name);
      if (candidates.length === 1) path = candidates[0].path;
    }
    if (!path) {
      path = 'media/' + file.name;
      for (let n = 2; files.has(path); n++) path = 'media/' + n + '-' + file.name;
    }
    if (!localPath(path)) continue;
    if (!project.assets.some(asset => asset.path === path)) project.assets.push({ path, type });
    addFile(files, path, file);
    if (!project.audio && type === 'audio') project.audio = path;
    dirty = true;
  }
  applyAudio();
  refresh();
  const missing = project.assets.filter(asset => !files.has(asset.path)).length;
  report(missing ? missing + ' media file' + (missing === 1 ? ' still missing.' : 's still missing.') : 'Media ready.');
}

async function savePackage(share = false) {
  const save = $('save');
  const shareControl = $('share');
  save.disabled = true;
  shareControl.disabled = true;
  try {
    const snapshot = structuredClone(project);
    const available = new Map(files);
    const missing = assetLocations(snapshot).filter(path => !available.has(path));
    if (missing.length) throw Error('Add the missing media before saving. ' + mediaName(missing[0]));
    const zip = new JSZip();
    zip.file('project.json', JSON.stringify(snapshot, null, 2) + '\n');
    let total = 0;
    for (const path of assetLocations(snapshot)) {
      const file = available.get(path);
      let blob = file.blob;
      if (!blob) {
        const response = await fetch(file.url);
        if (!response.ok) throw Error('Could not read ' + mediaName(path));
        blob = await response.blob();
      }
      total += blob.size;
      if (total > (share ? SHARED_LIMIT : SOURCE_LIMIT)) {
        throw Error(share ? 'Shared packages can be up to 128 MB.' : 'Package media can be up to 768 MB.');
      }
      zip.file(path, blob);
    }
    report('Packing project and media…');
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE', mimeType: 'application/zip' });
    if (share) {
      report('Saving a shared revision…');
      const response = await fetch('/api/studio/projects', { method: 'POST', body: blob });
      const result = await response.json();
      if (!response.ok || !SHARED_ID.test(result.id)) throw Error(result.error || 'Could not share the project.');
      if (JSON.stringify(project) === JSON.stringify(snapshot) && files.size === available.size) {
        dirty = false;
        showSharedLink(result.id);
        history.replaceState(null, '', projectLink('shared', result.id));
      }
      report('Shared revision saved in Open project.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = (snapshot.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cut-room-project') + '.zip';
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    if (JSON.stringify(project) === JSON.stringify(snapshot) && files.size === available.size) dirty = false;
    report('Project and media packaged.');
  } catch (error) {
    report(error.message);
  } finally {
    save.disabled = false;
    shareControl.disabled = false;
  }
}

$('new').onclick = () => {
  if (!mayReplace()) return;
  loadVersion++;
  setProject(normalize({ format: FORMAT, title: 'Untitled project', scenes: [] }), new Map());
  history.replaceState(null, '', projectLink());
};
$('open').onclick = () => void openLibrary();
$('import').onclick = () => { if (mayReplace()) $('project-file').click(); };
$('project-file').onchange = event => {
  if (event.target.files[0]) void openFile(event.target.files[0]);
  event.target.value = '';
};
$('save').onclick = () => { if (project) void savePackage(); };
$('share').onclick = () => { if (project) void savePackage(true); };
$('title').onchange = event => {
  if (!project) return;
  project.title = event.target.value.trim() || 'Untitled project';
  event.target.value = project.title;
  document.title = project.title + ' · Cut Room';
  dirty = true;
};
$('inspect-toggle').onclick = () => showSceneSettings($('inspect').hidden);
$('zoom').oninput = () => {
  if (!project) return;
  const scroller = $('timeline-scroll');
  const playheadOffset = current * pixelsPerSecond - scroller.scrollLeft;
  const visible = playheadOffset >= 0 && playheadOffset <= scroller.clientWidth;
  const startTime = scroller.scrollLeft / pixelsPerSecond;
  renderTimeline();
  scroller.scrollLeft = visible ? current * pixelsPerSecond - playheadOffset : startTime * pixelsPerSecond;
};
$('add-media').onclick = () => $('media-files').click();
$('add-folder').onclick = () => $('media-folder').click();
for (const id of ['media-files', 'media-folder']) {
  $(id).onchange = event => { loadMedia(event.target.files); event.target.value = ''; };
}
$('audio-source').onchange = event => {
  pause();
  project.audio = event.target.value;
  project.controls = '';
  dirty = true;
  applyAudio();
  refresh();
};

$('play').onclick = () => {
  if (!duration) return;
  if (playing) return pause();
  if (current >= duration) setPosition(0);
  if (audioKey) connectAnalyser();
  if (audioKey && current < (audio.duration || Infinity)) {
    audio.currentTime = current;
    void audio.play().catch(() => report('The soundtrack could not play in this browser.'));
  }
  playing = true;
  clockBase = performance.now() - current * 1000;
  $('play').textContent = 'Pause';
  loop = requestAnimationFrame(animate);
};
$('fullscreen').onclick = () => {
  const request = document.fullscreenElement ? document.exitFullscreen() : $('stage').requestFullscreen();
  void request.catch(() => report('Full screen is unavailable in this browser.'));
};
seek.oninput = () => setPosition(Number(seek.value));
for (const id of ['ruler', 'wave']) $(id).onclick = event => {
  setPosition((event.clientX - $('timeline').getBoundingClientRect().left) / pixelsPerSecond);
};
video.addEventListener('loadeddata', draw);
video.addEventListener('seeked', draw);
audio.addEventListener('loadedmetadata', () => setPosition(current));

for (const id of editable) {
  $(id).onchange = event => {
    const shot = project.scenes[selected];
    if (!shot || !event.target.reportValidity()) return;
    const { value } = event.target;
    if (id === 'scene-name') shot.name = value.trim() || 'Untitled scene';
    if (id === 'duration') {
      shot.duration = Number(value);
      shot.fadeIn = Math.min(shot.fadeIn, shot.duration);
      shot.fadeOut = Math.min(shot.fadeOut, shot.duration);
    }
    if (id === 'kind' && KINDS.includes(value)) {
      shot.kind = value;
      shot.effect = Object.keys(EFFECTS[value])[0];
      shot.instrument = undefined;
    }
    if (id === 'asset') shot.media = value;
    if (id === 'motion') {
      shot.motion = value;
      shot.camera = undefined;
    }
    if (id === 'effect') {
      shot.effect = value;
      shot.instrument = defaultInstrument(value);
    }
    if (id === 'source-start') shot.sourceStart = Number(value);
    if (id === 'fade-in') shot.fadeIn = Math.min(Number(value), shot.duration);
    if (id === 'fade-out') shot.fadeOut = Math.min(Number(value), shot.duration);
    dirty = true;
    refresh();
    setPosition(offsets[selected]);
  };
}
for (const field of instrumentFields) {
  field.onchange = () => {
    const shot = project.scenes[selected];
    if (!shot?.instrument || !field.reportValidity() || field.value === '') return;
    shot.instrument[Number(field.dataset.axis)] = Number(field.value);
    dirty = true;
    draw();
  };
}

function addScene(asset) {
  if (!project || project.scenes.length >= 1000) return;
  pause();
  const name = asset ? (asset.name || mediaName(asset.path)) : 'Scene ' + (project.scenes.length + 1);
  const shot = blankShot(name.slice(0, 90));
  if (asset) shot.media = asset.path;
  selected = asset && selected >= 0 ? selected + 1 : project.scenes.length;
  project.scenes.splice(selected, 0, shot);
  dirty = true;
  refresh();
  setPosition(offsets[selected]);
  const clip = $('track').children[selected];
  clip.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  if (asset) clip.focus({ preventScroll: true });
  else {
    showSceneSettings(true);
    $('scene-name').focus({ preventScroll: true });
  }
}
$('add-scene').onclick = () => addScene();

function moveScene(delta) {
  const next = selected + delta;
  if (next < 0 || next >= project.scenes.length) return;
  pause();
  [project.scenes[selected], project.scenes[next]] = [project.scenes[next], project.scenes[selected]];
  selected = next;
  dirty = true;
  refresh();
  setPosition(offsets[selected]);
}
$('earlier').onclick = () => moveScene(-1);
$('later').onclick = () => moveScene(1);
$('delete').onclick = () => {
  if (selected < 0) return;
  pause();
  project.scenes.splice(selected, 1);
  selected = Math.min(selected, project.scenes.length - 1);
  dirty = true;
  refresh();
  setPosition(offsets[selected] || 0);
};
window.addEventListener('beforeunload', event => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = '';
});
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || event.repeat || event.target.closest('button, input, select, textarea, a, summary')) return;
  if (!duration) return;
  event.preventDefault();
  $('play').click();
});
function installSplitter(id, panelId, containerId, property, vertical, initial, min, max) {
  const grip = $(id);
  const panel = $(panelId);
  const container = $(containerId);
  const key = 'cut-room:' + property;
  const measure = element => vertical ? element.clientWidth : element.clientHeight;
  let drag;
  let size = initial;
  try { size = Number(localStorage.getItem(key)) || initial; } catch {}

  function update(value) {
    size = Math.max(min, Math.min(max, value));
    container.style.setProperty(property, size + '%');
    grip.setAttribute('aria-valuenow', String(Math.round(size)));
  }

  function save() {
    try { localStorage.setItem(key, String(size)); } catch {}
  }

  grip.setAttribute('aria-valuemin', String(min));
  grip.setAttribute('aria-valuemax', String(max));
  update(size);
  grip.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { pointer: event.pointerId, start: vertical ? event.clientX : event.clientY,
      size: 100 * measure(panel) / measure(container) };
    grip.setPointerCapture(event.pointerId);
    grip.dataset.dragging = '';
  });
  window.addEventListener('pointermove', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const delta = vertical ? event.clientX - drag.start : drag.start - event.clientY;
    update(drag.size + 100 * delta / measure(container));
  });
  function finishDrag(event) {
    if (!drag || drag.pointer !== event.pointerId) return;
    drag = undefined;
    delete grip.dataset.dragging;
    save();
  }
  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);
  grip.addEventListener('lostpointercapture', finishDrag);
  grip.addEventListener('keydown', event => {
    const key = event.key;
    const bigger = vertical ? 'ArrowRight' : 'ArrowUp';
    const smaller = vertical ? 'ArrowLeft' : 'ArrowDown';
    if (![bigger, smaller, 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    const currentSize = 100 * measure(panel) / measure(container);
    update(key === 'Home' ? min : key === 'End' ? max : currentSize + (key === bigger ? 4 : -4));
    save();
  });
}

installSplitter('media-divider', 'media-panel', 'workspace', '--media-width', true, 28, 20, 58);
installSplitter('timeline-divider', 'timeline-panel', 'desk', '--timeline-height', false, 39, 28, 62);
const startup = new URLSearchParams(location.search);
if (startup.has('shared')) void openSharedPackage(startup.get('shared'));
else if (startup.has('project') || ['127.0.0.1', 'localhost'].includes(location.hostname)) {
  void openShared(startup.get('project') || undefined);
} else {
  $('share').hidden = true;
  $('open').hidden = true;
  $('new').click();
  report('Open Cut Room on your Chromebook for local projects and shared revisions.');
}
