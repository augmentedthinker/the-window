export const FORMAT = 'window-cut-room-v1';
export const DEFAULT_THEME = { ink: ['#100919', '#321538'], cool: '#ceb0fc', hot: '#ec73bc', warm: '#ffc68c' };
export const KINDS = ['Story', 'Environmental', 'Abstract'];
export const MOTIONS = ['still', 'in', 'out', 'left', 'right'];
export const EFFECTS = {
  Story: { none: 'None' },
  Environmental: { none: 'None', cone: 'Speaker cone', receiver: 'Receiver meter' },
  Abstract: { orbit: 'Orbits', spectrum: 'Spectrum', ribbon: 'Signal ribbons' }
};
const LEGACY = ['agent-home-video-editor-v1', 'horizon-video-editor-v1', 'coast-editor-v1', 'solarium-video-editor-v1'];

export function mediaType(path) {
  if (/\.(png|jpe?g|webp|gif|avif)$/i.test(path)) return 'image';
  if (/\.(mp3|m4a|aac|wav|oga|ogg|flac)$/i.test(path)) return 'audio';
  if (/\.(mp4|m4v|webm|ogv|mov)$/i.test(path)) return 'video';
  return '';
}

export function localPath(value) {
  if (typeof value !== 'string') return '';
  const path = value.replace(/^\/+/, '').replace(/\\/g, '/');
  if (!path || /[:?#%\u0000-\u001f]/.test(path) || path.split('/').some(part => !part || /^\.{1,2}$/.test(part))) return '';
  return path;
}

export function mediaName(path) { return path.split('/').at(-1); }

function name(value, fallback, max) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
}

function bounded(value, min, max, fallback) {
  return Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
}

function inferKind(shot) {
  if (KINDS.includes(shot.kind)) return shot.kind;
  const type = String(shot.kind || shot.visualizer || '').toLowerCase();
  if (/abstract|spectrum|bars|ribbon|waveform|chladni|lissajous/.test(type)) return 'Abstract';
  if (/speaker|woofer|receiver|instrument|boombox|environment|dashboard|vacuumtube/.test(type)) return 'Environmental';
  return 'Story';
}

function sourceShape(input) {
  if (input.format === 'solarium-video-editor-v1') {
    const assets = new Map((input.assets || []).map(asset => [asset.id, asset]));
    const source = id => assets.get(id)?.url;
    return {
      ...input, frame: input.outputFormat === 'portrait' ? 'portrait' : input.frame,
      audio: source(input.audio?.assetId),
      controls: input.controls || source(input.featureAssetId),
      assets: [...assets.values()].map(asset => ({ path: asset.url, type: asset.type, name: asset.name })),
      scenes: input.scenes.map(shot => {
        const asset = assets.get(shot.assetId);
        return { ...shot, [asset?.type === 'video' ? 'video' : 'image']: asset?.url,
          kind: shot.recurringInstrument ? 'Environmental' : 'Story',
          notes: shot.notes || (shot.treatment ? 'Solarium effect · ' + shot.treatment : '') };
      }),
    };
  }
  if (input.format === 'coast-editor-v1') {
    const prints = new Map((input.media?.prints || []).map(asset => [asset.id, asset]));
    const clips = new Map((input.media?.clips || []).map(asset => [asset.id, asset]));
    const instruments = new Map((input.media?.instruments || []).map(asset => [asset.id, asset]));
    return {
      ...input, frame: input.output === 'portrait' ? 'portrait' : input.frame, audio: input.song?.audio,
      controls: input.controls || input.song?.features,
      scenes: input.scenes.map(shot => {
        const asset = (shot.kind === 'clip' ? clips : shot.kind === 'print' ? prints : instruments).get(shot.asset);
        const path = shot.src || asset?.src || asset?.still;
        return { ...shot, name: shot.name || asset?.label || shot.note || shot.asset,
          [shot.kind === 'clip' ? 'video' : 'image']: path, sourceStart: shot.offset,
          kind: shot.kind === 'instrument' ? 'Environmental' : 'Story', notes: shot.note };
      }),
    };
  }
  return input;
}

function legacyEffect(shot, media) {
  const mode = String(shot.visualizer || shot.asset || '').toLowerCase();
  if (media.includes('/abstract-visuals/')) {
    return { kind: 'Abstract', effect: /bars/i.test(media) ? 'spectrum' : /wave/i.test(media) ? 'ribbon' : 'orbit' };
  }
  const type = inferKind(shot);
  if (type === 'Abstract') {
    return { kind: type, effect: /spectrum|bars/.test(mode) ? 'spectrum' : /lissajous|wave/.test(mode) ? 'ribbon' : 'orbit' };
  }
  return { kind: type, effect: 'none' };
}

function point(value, zoom = 1) {
  if (!value || typeof value !== 'object') return undefined;
  if (typeof value.x !== 'number' || typeof value.y !== 'number') return undefined;
  return { x: bounded(value.x, 0, 1, .5), y: bounded(value.y, 0, 1, .5), zoom: bounded(value.zoom, 1, 4, zoom) };
}

export function defaultInstrument(effect) {
  if (effect === 'cone') return [.5, .5, .24, .34];
  if (effect === 'receiver') return [.5, .44, .28, .08];
  return undefined;
}

export function normalize(input) {
  if (!input || !Array.isArray(input.scenes) || ![FORMAT, ...LEGACY].includes(input.format)) {
    throw Error('Choose a Cut Room, Agent Home, Horizon, Solarium, or Coast project JSON or ZIP.');
  }
  if (input.scenes.length > 1000) throw Error('A project can contain up to 1,000 scenes.');
  const legacy = input.format !== FORMAT;
  input = sourceShape(input);
  const sanitizeColor = (candidate, fallback) => /^#[\da-f]{6}$/i.test(candidate) ? candidate : fallback;
  const theme = {
    ink: DEFAULT_THEME.ink.map((color, index) => sanitizeColor(input.theme?.ink?.[index], color)),
    cool: sanitizeColor(input.theme?.cool, DEFAULT_THEME.cool),
    hot: sanitizeColor(input.theme?.hot, DEFAULT_THEME.hot),
    warm: sanitizeColor(input.theme?.warm, DEFAULT_THEME.warm)
  };
  const assets = new Map();
  function addAsset(value, forcedType, label) {
    const path = localPath(value);
    const existing = assets.get(path);
    const type = ['image', 'video', 'audio'].includes(forcedType) ? forcedType : existing?.type || mediaType(path);
    if (path && ['image', 'video', 'audio'].includes(type)) {
      assets.set(path, { path, type, name: name(label, existing?.name || mediaName(path), 100) });
    }
    return type ? path : '';
  }
  for (const asset of Array.isArray(input.assets) ? input.assets : []) addAsset(asset?.path, asset?.type, asset?.name);
  const audio = addAsset(input.audio, 'audio');
  const scenes = input.scenes.map((shot, index) => {
    if (!shot || typeof shot !== 'object') throw Error('Scene ' + (index + 1) + ' has an invalid shape.');
    const video = addAsset(shot.video, 'video');
    const media = video || addAsset(shot.media || shot.image);
    const adapted = legacy ? legacyEffect(shot, media) : null;
    const kind = adapted?.kind || inferKind(shot);
    const motion = MOTIONS.includes(shot.motion) ? shot.motion : 'still';
    const effect = adapted?.effect ||
      (Object.hasOwn(EFFECTS[kind], shot.effect) ? shot.effect : Object.keys(EFFECTS[kind])[0]);
    const duration = bounded(shot.duration, .1, 3600, 4);
    const instrument = Array.isArray(shot.instrument) && shot.instrument.length === 4
      ? shot.instrument.map(value => bounded(value, 0, 1, .5)) : defaultInstrument(effect);
    const from = point(shot.camera?.from);
    const to = point(shot.camera?.to);
    return {
      id: name(shot.id, crypto.randomUUID(), 100), name: name(shot.name, 'Scene ' + (index + 1), 90), kind, duration, media,
      motion, effect, instrument, sourceStart: bounded(shot.sourceStart, 0, 3600, 0),
      fadeIn: bounded(shot.fadeIn, 0, duration, 0), fadeOut: bounded(shot.fadeOut, 0, duration, 0),
      notes: typeof shot.notes === 'string' ? shot.notes.slice(0, 450) : '',
      camera: from && to ? { from, to } : undefined,
      focus: point(typeof shot.focus === 'number' ? { x: shot.focus, y: .5 } : shot.focus),
    };
  });
  return {
    format: FORMAT, title: name(input.title, 'Untitled project', 100), frame: input.frame === 'portrait' ? 'portrait' : 'landscape',
    bpm: bounded(input.bpm, 0, 320, 0), theme, audio, controls: localPath(input.controls),
    assets: [...assets.values()], scenes,
    cues: Array.isArray(input.cues) ? input.cues.slice(0, 500)
      .filter(cue => cue && Number.isFinite(cue.time) && cue.time >= 0)
      .map(cue => ({ time: cue.time, label: name(cue.label || cue.name, 'Cue', 100) }))
      .sort((a, b) => a.time - b.time) : []
  };
}

export function assetLocations(project) {
  return [...new Set([...project.assets.map(asset => asset.path), project.controls].filter(Boolean))];
}
