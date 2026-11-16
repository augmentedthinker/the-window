"""Cues, hits and an energy arc from analyze-song.py's features.npz, for scene planning.

  python3 scripts/song-cues.py <analysis dir>

Writes cues.json: per-bar energy (0-1) for rms/bass/mid/high, sections (from summary.json),
hits (strong flux onsets snapped to the beat), lifts and drops (big bar-to-bar energy changes),
and the peak. Written November 16, 2026 for the Music Tray.
"""
import sys, json, os
import numpy as np
d = sys.argv[1]
f = np.load(os.path.join(d, 'features.npz')); S = json.load(open(os.path.join(d, 'summary.json')))
fps = 30.0; beats = f['beats']; bar = S['bar_seconds']; first = S['first_beat']; dur = float(f['dur'])
def norm(x): x = x - x.min(); return x / (x.max() or 1)
bars = []
t = first
while t < dur - 0.5:
    a, b = int(t * fps), int(min(dur, t + bar) * fps)
    bars.append({'bar': len(bars) + 1, 'start': round(t, 2), **{k: float(f[k][a:b].mean()) for k in ('rms', 'bass', 'mid', 'high')}})
    t += bar
for k in ('rms', 'bass', 'mid', 'high'):
    v = norm(np.array([x[k] for x in bars]))
    for x, n in zip(bars, v): x[k] = round(float(n), 3)
# hits: flux peaks well above their local surroundings, at most one per beat, snapped to the nearest beat
flux = f['flux']; w = int(fps * 4)
loc = np.array([flux[max(0, i - w):i + w].mean() + 2.5 * flux[max(0, i - w):i + w].std() for i in range(len(flux))])
cand = [i for i in range(1, len(flux) - 1) if flux[i] > loc[i] and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
hits, last = [], -9
for i in sorted(cand, key=lambda i: -flux[i]):
    tt = i / fps; bt = float(beats[np.abs(beats - tt).argmin()])
    if abs(bt - tt) > 0.12 or any(abs(bt - h['t']) < 0.55 for h in hits): continue
    hits.append({'t': round(bt, 2), 'strength': round(float(flux[i] / flux.max()), 2)})
hits.sort(key=lambda h: h['t'])
# lifts and drops between neighbouring bars
changes = []
for p, q in zip(bars, bars[1:]):
    dv = q['rms'] - p['rms']
    if abs(dv) >= 0.22: changes.append({'t': q['start'], 'bar': q['bar'], 'kind': 'lift' if dv > 0 else 'drop', 'size': round(dv, 2)})
peak = max(bars, key=lambda x: x['rms'])
out = {'duration': dur, 'bpm': S['bpm'], 'bar_seconds': bar, 'first_beat': first, 'beats': [round(float(b), 3) for b in beats],
       'sections': S['sections'], 'bars': bars, 'hits': hits, 'changes': changes, 'peak_bar': {'bar': peak['bar'], 't': peak['start']},
       'notes': 'Energy values are 0-1 within this song. Hits are strong onsets snapped to beats. Changes are bar-to-bar jumps in loudness of at least 0.22.'}
json.dump(out, open(os.path.join(d, 'cues.json'), 'w'), indent=1)
print(len(bars), 'bars,', len(hits), 'hits,', len(changes), 'changes, peak bar', peak['bar'], 'at', peak['start'])
for c in changes: print(' ', c)
