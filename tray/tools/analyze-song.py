"""Analyse a song for music-video work. numpy + ffmpeg only.

  python3 scripts/analyze-song.py <audio> <outdir>

Writes to outdir:
  features.npz   per-frame (30 fps) bass/mid/high/rms/flux, 64 spectrum bins, waveform, beats, bpm
  features.json  the same, packed small for the browser (the video editor reads it)
  summary.json   duration, tempo, bar length, and sections found by energy
Generalised on Nov 10, 2026 from the first music video's analyze.py.
"""
import sys, os, json, base64, subprocess
import numpy as np

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
SR, FPS = 22050, 30
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32)
dur = len(x) / SR
hop, win = SR // FPS, 2048
n = int(dur * FPS)
pad = np.pad(x, (win // 2, win))
spec = np.empty((n, win // 2 + 1), np.float32)
han = np.hanning(win).astype(np.float32)
for a in range(0, n, 512):                      # in blocks, to keep memory modest
    blk = np.stack([pad[i * hop:i * hop + win] for i in range(a, min(n, a + 512))]) * han
    spec[a:a + len(blk)] = np.abs(np.fft.rfft(blk, axis=1))
freqs = np.fft.rfftfreq(win, 1 / SR)
def band(lo, hi): return spec[:, (freqs >= lo) & (freqs < hi)].mean(1)
def norm(v):
    v = np.log1p(v * 50); lo, hi = np.percentile(v, 3), np.percentile(v, 99.5)
    return np.clip((v - lo) / (hi - lo + 1e-9), 0, 1).astype(np.float32)
bass, mid, high = norm(band(30, 160)), norm(band(160, 2000)), norm(band(2000, 9000))
rms = norm(np.array([np.sqrt((x[i * hop:i * hop + hop] ** 2).mean() + 1e-12) for i in range(n)]))
ls = np.log1p(spec * 20)
flux = np.concatenate([[0], np.maximum(ls[1:] - ls[:-1], 0).sum(1)])
flux = ((flux - flux.mean()) / (flux.std() + 1e-9)).astype(np.float32)
del ls

# tempo: autocorrelation of the onset envelope (70-160 BPM), refined with a comb
env = flux - np.convolve(flux, np.ones(15) / 15, 'same')
ac = np.correlate(env, env, 'full')[len(env) - 1:]
lags = np.arange(len(ac)); bpm_l = 60 * FPS / np.maximum(lags, 1)
ok = (bpm_l > 70) & (bpm_l < 160)
lag = lags[ok][np.argmax(ac[ok])]
best = None
for L in np.arange(lag - 1, lag + 1, 0.01):
    for ph in np.arange(0, L, 0.5):
        idx = np.round(np.arange(ph, n, L)).astype(int); s = env[idx[idx < n]].mean()
        if best is None or s > best[0]: best = (s, L, ph)
_, L, ph = best
beats = np.arange(ph, n, L) / FPS
bpm = 60 * FPS / L

edges = np.geomspace(40, 9000, 65)
ix = np.searchsorted(freqs, edges)              # every bin gets at least one FFT bin (the lowest are
ix = np.maximum(ix, np.arange(len(ix)) + ix[0])  # narrower than the FFT's resolution, and were empty)
bins = np.stack([spec[:, ix[k]:max(ix[k] + 1, ix[k + 1])].mean(1) for k in range(64)], 1)
bins = np.log1p(bins * 30); bins = np.clip(bins / (np.percentile(bins, 99.5, axis=0) + 1e-9), 0, 1).astype(np.float32)
wave = np.stack([x[min(len(x) - 512, i * hop):min(len(x) - 512, i * hop) + 512:2] for i in range(n)]).astype(np.float32)
np.savez_compressed(os.path.join(out, 'features.npz'), bass=bass, mid=mid, high=high, rms=rms, flux=flux,
                    beats=beats, bins=bins, wave=wave, dur=dur, bpm=bpm)

# packed for the browser (same format as scripts/features-json.py)
def q(a):
    a = np.nan_to_num(np.asarray(a, np.float32)); lo, hi = np.percentile(a, 1), np.percentile(a, 99.5)
    return base64.b64encode(np.clip((a - lo) / (hi - lo + 1e-9) * 255, 0, 255).astype(np.uint8).tobytes()).decode()
blo, bhi = np.percentile(bins, 10, 0), np.percentile(bins, 99, 0)
bands = np.clip((bins - blo) / (bhi - blo + 1e-6), 0, 1).reshape(n, 32, 2).mean(2)
w32 = wave[:, ::8]; w32 = w32 / (np.percentile(np.abs(w32), 99.5) + 1e-9)
json.dump(dict(fps=FPS, frames=n, duration=dur, bpm=bpm, beats=[round(float(b), 3) for b in beats],
               bass=q(bass), mid=q(mid), high=q(high), rms=q(rms), flux=q(flux),
               bands=base64.b64encode((bands * 255).astype(np.uint8).tobytes()).decode(),
               wave=base64.b64encode(((np.clip(w32, -1, 1) + 1) * 127.5).astype(np.uint8).tobytes()).decode()),
          open(os.path.join(out, 'features.json'), 'w'))

# sections: energy per bar (4 beats), sorted into three levels, joined into runs
bar = 4 * L / FPS
bar_starts = beats[::4]
energy = []
for i, b in enumerate(bar_starts):
    a, e = int(b * FPS), int(min(dur, b + bar) * FPS)
    energy.append(float(rms[a:e].mean()) if e > a else 0.0)
energy = np.convolve(energy, [0.25, 0.5, 0.25], 'same') if len(energy) > 2 else np.array(energy)
cuts = np.percentile(energy, [33, 70]) if len(energy) else [0, 0]
level = np.digitize(energy, cuts)            # 0 quiet, 1 building, 2 full
names = ['quiet', 'building', 'full']
sections = []
for i, lv in enumerate(level):
    if sections and sections[-1]['level'] == names[lv]: sections[-1]['bars'] += 1
    else: sections.append({'level': names[lv], 'bars': 1, 'start': round(float(bar_starts[i]), 2)})
merged = []                                  # absorb one-bar blips into their neighbour
for s in sections:
    if merged and s['bars'] < 2: merged[-1]['bars'] += s['bars']
    elif merged and merged[-1]['level'] == s['level']: merged[-1]['bars'] += s['bars']
    else: merged.append(dict(s))
for s in merged:
    s['end'] = round(min(dur, s['start'] + s['bars'] * bar), 2)
if merged: merged[0]['start'] = 0.0; merged[-1]['end'] = round(dur, 2)
summary = dict(duration=round(dur, 2), bpm=round(bpm, 2), bar_seconds=round(bar, 3), beats=len(beats),
               first_beat=round(float(beats[0]), 3) if len(beats) else 0, sections=merged,
               loudest=round(float(np.argmax(np.convolve(rms, np.ones(FPS * 4) / (FPS * 4), 'same')) / FPS), 1))
json.dump(summary, open(os.path.join(out, 'summary.json'), 'w'), indent=1)
print(json.dumps({k: v for k, v in summary.items() if k != 'sections'}), len(merged), 'sections')
