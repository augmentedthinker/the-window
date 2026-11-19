import { frameAt } from './composition.js';
import {
  AudioBufferSource, BufferTarget, CanvasSource, Mp4OutputFormat, Output, WebMOutputFormat,
  canEncodeAudio, canEncodeVideo,
} from './vendor/mediabunny.js';

const FPS = 24;
const VIDEO_BITRATE = 2_500_000;
const AUDIO_BITRATE = 128_000;
const SILENCE = Array(25).fill(0);

function waitForMedia(media, event, signal, start) {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    function finish(error) {
      clearTimeout(timeout);
      media.removeEventListener(event, ready);
      media.removeEventListener('error', failed);
      signal.removeEventListener('abort', aborted);
      if (error) reject(error);
      else resolve();
    }
    const ready = () => finish();
    const failed = () => finish(new Error('A source clip could not be decoded.'));
    const aborted = () => finish(signal.reason);
    const timeout = setTimeout(failed, 15000);
    media.addEventListener(event, ready);
    media.addEventListener('error', failed);
    signal.addEventListener('abort', aborted, { once: true });
    try { start(); }
    catch (error) { finish(error); }
  });
}

async function readTrack(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('The soundtrack could not be loaded.');
  const context = new OfflineAudioContext(2, 1, 48000);
  try {
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    signal.throwIfAborted();
    return buffer;
  } catch (error) {
    signal.throwIfAborted();
    throw new Error('The soundtrack could not be decoded.', { cause: error });
  }
}

async function outputFormat(canvas, audio) {
  const videoOptions = { width: canvas.width, height: canvas.height, bitrate: VIDEO_BITRATE };
  const audioOptions = audio && {
    numberOfChannels: audio.numberOfChannels, sampleRate: audio.sampleRate, bitrate: AUDIO_BITRATE,
  };
  for (const [extension, codecs] of [
    ['mp4', ['avc', 'aac']], ['webm', ['vp9', 'opus']], ['webm', ['vp8', 'opus']],
  ]) {
    const [video, sound] = codecs;
    if (await canEncodeVideo(video, videoOptions) && (!audio || await canEncodeAudio(sound, audioOptions))) {
      return { extension, video, sound };
    }
  }
  throw new Error('This browser has no supported video export encoder. Try an up-to-date Chromium browser.');
}

async function writeAudio(source, buffer, duration, signal) {
  const end = Math.min(buffer.length, Math.ceil(duration * buffer.sampleRate));
  const block = buffer.sampleRate * 5;
  for (let start = 0; start < end; start += block) {
    signal.throwIfAborted();
    const length = Math.min(block, end - start);
    const segment = new AudioBuffer({
      numberOfChannels: buffer.numberOfChannels, sampleRate: buffer.sampleRate, length,
    });
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      segment.copyToChannel(buffer.getChannelData(channel).subarray(start, start + length), channel);
    }
    await source.add(segment);
  }
  source.close();
}

function soundtrackSpectrum(audio) {
  const size = 2048;
  const channels = Array.from({ length: audio.numberOfChannels }, (_, channel) => audio.getChannelData(channel));
  const real = new Float32Array(size);
  const imaginary = new Float32Array(size);
  const windowWeights = real.map((_, index) => .42 - .5 * Math.cos(2 * Math.PI * index / size) +
    .08 * Math.cos(4 * Math.PI * index / size));
  const cosines = real.map((_, index) => Math.cos(-2 * Math.PI * index / size));
  const sines = real.map((_, index) => Math.sin(-2 * Math.PI * index / size));
  const order = new Uint16Array(size);
  for (let index = 1; index < size; index++) order[index] = (order[index >> 1] >> 1) | ((index & 1) * (size >> 1));
  const bandEdges = Array.from({ length: 25 }, (_, band) =>
    Math.floor(38 * (14000 / 38) ** (band / 24) * size / audio.sampleRate));

  return time => {
    const end = Math.floor(time * audio.sampleRate);
    if (end >= audio.length + size) return SILENCE;
    for (let index = 0; index < size; index++) {
      const sample = end - size + index;
      let value = 0;
      for (const channel of channels) value += channel[sample] ?? 0;
      real[order[index]] = value * windowWeights[index] / channels.length;
    }
    imaginary.fill(0);
    for (let width = 2; width <= size; width *= 2) {
      const half = width / 2;
      for (let start = 0; start < size; start += width) {
        for (let index = 0; index < half; index++) {
          const left = start + index;
          const right = left + half;
          const angle = index * size / width;
          const r = real[right] * cosines[angle] - imaginary[right] * sines[angle];
          const i = real[right] * sines[angle] + imaginary[right] * cosines[angle];
          real[right] = real[left] - r;
          imaginary[right] = imaginary[left] - i;
          real[left] += r;
          imaginary[left] += i;
        }
      }
    }
    const bands = bandEdges.slice(0, -1).map((start, band) => {
      let peak = 0;
      for (let bin = start; bin < Math.max(start + 1, bandEdges[band + 1]); bin++) {
        peak = Math.max(peak, Math.hypot(real[bin], imaginary[bin]) / size);
      }
      const decibels = 20 * Math.log10(peak);
      return Math.min(1, Math.max(0, (decibels + 100) / 70));
    });
    return [bands.reduce((sum, value) => sum + value, 0) / bands.length, ...bands];
  };
}

export async function renderFilm({ project, urls, controls, orientation, progress, signal }) {
  const duration = project.scenes.reduce((sum, shot) => sum + shot.duration, 0);
  if (!duration) throw new Error('Add a scene before rendering.');
  const types = new Map(project.assets.map(asset => [asset.path, asset.type]));
  for (const shot of project.scenes) {
    if (shot.kind !== 'Abstract' && (!shot.media || !urls.has(shot.media))) {
      throw new Error('Choose available media for “' + shot.name + '” before rendering.');
    }
  }
  if (project.audio && !urls.has(project.audio)) throw new Error('Add the missing soundtrack before rendering.');

  const canvas = document.createElement('canvas');
  canvas.width = orientation === 'portrait' ? 720 : 1280;
  canvas.height = orientation === 'portrait' ? 1280 : 720;
  const audio = project.audio ? await readTrack(urls.get(project.audio), signal) : null;
  const { extension, video, sound } = await outputFormat(canvas, audio);
  signal.throwIfAborted();

  const target = new BufferTarget();
  const format = extension === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat();
  const output = new Output({ target, format });
  const picture = new CanvasSource(canvas, { codec: video, bitrate: VIDEO_BITRATE });
  output.addVideoTrack(picture, { frameRate: FPS });
  const soundtrack = audio ? new AudioBufferSource({ codec: sound, bitrate: AUDIO_BITRATE }) : null;
  if (soundtrack) output.addAudioTrack(soundtrack);

  const clip = document.createElement('video');
  clip.muted = true;
  clip.playsInline = true;
  const image = new Image();
  const count = Math.ceil(duration * FPS);
  let shotIndex = 0;
  let start = 0;
  let sourcePath = '';
  let plate;
  let nextUpdate = 0;
  try {
    await output.start();
    if (soundtrack) await writeAudio(soundtrack, audio, duration, signal);
    const spectrum = controls?.frames.length
      ? time => controls.frames[Math.min(controls.frames.length - 1, Math.floor(time * controls.fps))].map(value => value / 255)
      : audio ? soundtrackSpectrum(audio) : () => SILENCE;
    for (let index = 0; index < count; index++) {
      signal.throwIfAborted();
      const time = index / FPS;
      while (shotIndex + 1 < project.scenes.length && time >= start + project.scenes[shotIndex].duration) {
        start += project.scenes[shotIndex++].duration;
      }
      const shot = project.scenes[shotIndex];
      const path = shot.kind === 'Abstract' ? '' : shot.media;
      if (path !== sourcePath) {
        sourcePath = path;
        plate = undefined;
        if (types.get(path) === 'video') {
          await waitForMedia(clip, 'loadeddata', signal, () => { clip.src = urls.get(path); });
          plate = clip;
        } else if (path) {
          await waitForMedia(image, 'load', signal, () => { image.src = urls.get(path); });
          plate = image;
        }
      }
      const local = time - start;
      if (plate === clip) {
        const position = Math.min(Math.max(0, clip.duration - .025), local + shot.sourceStart);
        if (Number.isFinite(position) && Math.abs(position - clip.currentTime) > .001) {
          await waitForMedia(clip, 'seeked', signal, () => { clip.currentTime = position; });
        }
      }
      const sample = shot.kind === 'Abstract' || shot.kind === 'Environmental' ? spectrum(time) : SILENCE;
      frameAt(project, canvas, shot, plate, time, local, sample);
      await picture.add(time, Math.min(1 / FPS, duration - time));
      if (performance.now() >= nextUpdate) {
        progress(index / count, extension);
        nextUpdate = performance.now() + 250;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    picture.close();
    progress(1, extension);
    signal.throwIfAborted();
    await output.finalize();
    signal.throwIfAborted();
    return { blob: new Blob([target.buffer], { type: format.mimeType }), extension };
  } catch (error) {
    if (['started', 'pending'].includes(output.state)) await output.cancel();
    throw error;
  } finally {
    clip.removeAttribute('src');
    clip.load();
    image.removeAttribute('src');
  }
}
