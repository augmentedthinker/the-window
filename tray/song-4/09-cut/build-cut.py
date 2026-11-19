# Misregistered: the storyboard as a cut list on the bar grid (Take A, 133.0 BPM, downbeats from 0.27 s; first set at 0.05, which was the off-beat hats: the slice test showed every kick entrance ~0.2 s after the cuts, and folding the kick band alone puts beat 1 at 0.27-0.29 s).
# Tempo: kick and hat bands both give 133.0 at bar level. Phase: the kick (beat 1 and the and-of-3, a 2-step pattern) folds to 0.27-0.29 s, and the entrance kicks land on these downbeats
# (52.60, 88.69, 117.56, 146.44 s). Vocal map from faster-whisper small.en.
# Plates: Antigravity delivered 12 (P01-P12); P13-P16 were dropped and their shots recut onto the twelve.
# Kinds: plate (P01-P12, printed in two inks, subtly off-register), split (the same plate pulled apart into its
# pink and blue passes, drifting back together on each downbeat), R1 halftone / R2 registration / R3 drum (visualizations).
# Usage: python3 build-cut.py  -> cut.json here and cut.js in the Coast works folder
import json, os
BPM = 133.0; BAR = 4 * 60 / BPM; T0 = 0.27; END = 182.33
bar = lambda n: round(T0 + n * BAR, 3)
CAM = {  # (zoom, x, y) from -> to
 'push': ((1.0, .5, .5), (1.12, .5, .5)), 'pull': ((1.12, .5, .5), (1.0, .5, .5)),
 'panR': ((1.15, .42, .5), (1.15, .58, .5)), 'panL': ((1.15, .58, .5), (1.15, .42, .5)),
 'down': ((1.15, .5, .4), (1.15, .5, .6)), 'up': ((1.15, .5, .6), (1.15, .5, .4)),
 'hold': ((1.04, .5, .5), (1.07, .5, .5)), 'punch': ((1.0, .5, .5), (1.25, .5, .5)),
 'macro': ((1.3, .5, .5), (1.4, .52, .48)), 'none': ((1, .5, .5), (1, .5, .5)),
}
S = [  # (section, first bar, [(bars, source, move, note)])
 ('Intro', 0, [(3, 'P01', 'push', 'First light in the print studio. Cream paper waiting.'),
   (2, 'P03', 'up', 'A kalimba resting on a rejected proof.'),
   (2, 'R2', '', 'Registration marks: two copies of one target, looking for each other.'),
   (2, 'P02', 'panR', 'The two drums, pink and blue, side by side.')]),
 ('Verse 1', 9, [(2, 'P04', 'push', '"You print in blue"'),
   (2, 'P05', 'down', '"I print in red"'),
   (3, 'P06', 'push', '"Half a breath late, half an inch wide. Our colours never quite collide."')]),
 ('Pre-chorus', 16, [(3, 'P07', 'up', '"Hold it up to the window light"'),
   (2, 'R1', '', '"Neither of us got it right": two dot screens, a little off.')]),
 ('Chorus 1', 21, [(2, 'split:P11', 'hold', '"But where we miss, a third colour grows": the image comes apart into its two inks.'),
   (2, 'P10', 'macro', '"Violet in the overlap that nobody chose."'),
   (2, 'R2', '', '"Off by a hair, and I like it that way."'),
   (2, 'split:P06', 'push', '"Misregistered, we stay."')]),
 ('Drop 1', 29, [(1, 'R3', '', 'The bassline: the drum rolls.'), (2, 'P12', 'down', 'The drying rack, held long enough to read (Antigravity\'s note).'),
   (1, 'R1', '', ''), (1, 'split:P05', 'none', 'The pink pass, pulled apart.'),
   (1, 'R3', '', ''), (1, 'split:P02', 'none', 'The drums, apart.'), (1, 'R2', '', '"We stay."')]),
 ('Verse 2', 37, [(2, 'P08', 'push', '"Coffee rings on the proof we drew"'),
   (3, 'P09', 'panR', '"The edges ghost where I followed you."'),
   (2, 'P10', 'macro', '"You lean left and I lean late, two plates turning through one day."')]),
 ('Pre-chorus 2', 44, [(2, 'P07', 'pull', '"Hold it up to the window light."'), (1, 'R1', '', '"Neither of us got it right" (Antigravity\'s note).')]),
 ('Chorus 2', 47, [(2, 'split:P11', 'push', '"But where we miss, a third colour grows."'),
   (2, 'R1', '', '"Violet in the overlap."'),
   (2, 'P05', 'down', '"Off by a hair."'),
   (3, 'split:P10', 'hold', '"Misregistered, we stay."')]),
 ('Bridge', 56, [(3, 'P06', 'macro', '"If we lined up perfect we\'d be one flat shade."'),
   (2, 'R2', '', 'The copies almost meet.'),
   (2, 'P03', 'push', '"I\'d rather keep the halo the mistake made."')]),
 ('Break', 63, [(2, 'P01', 'pull', 'A breath in the empty studio before the drop.')]),
 ('Drop 2', 65, [(1, 'R3', '', '"We stay"'), (1, 'P12', 'down', ''), (1, 'split:P02', 'none', ''), (1, 'R1', '', ''),
   (1, 'split:P04', 'none', ''), (1, 'R2', '', ''), (1, 'split:P12', 'none', ''), (1, 'R3', '', '')]),
 ('Final chorus', 73, [(3, 'P09', 'pull', '"Where we miss, a third colour grows."'),
   (1, 'R2', '', 'The pickup.'),
   (2, 'P11', 'push', '"Off by a hair, and I like it that way." At last in register: the two makers rest together in violet (Antigravity\'s note).'),
   (2, 'split:P07', 'hold', '"Misregistered, we stay." The proof against the light, both inks breathing.')]),
 ('Finale', 81, [(2, 'R3', '', 'The last drop: the whole song printing.'), (2, 'split:P12', 'none', 'Twenty proofs, every one off-register.'),
   (2, 'R1', '', ''), (2, 'split:P05', 'none', ''), (2, 'split:P09', 'none', ''), (2, 'R2', '', ''),
   (2, 'split:P06', 'push', ''), (2, 'R3', '', '')]),
 ('Outro', 97, [(None, 'P01', 'pull', 'Back to the empty studio, where it started; the kalimba alone.')]),
]
shots = []
for sec, b0, items in S:
    b = b0
    for bars, src, move, note in items:
        start = bar(b) if shots else 0.0
        end = END if bars is None else bar(b + bars)
        kind = 'split' if src.startswith('split:') else ('viz' if src.startswith('R') else 'plate')
        source = src.split(':')[-1]
        (zf, xf, yf), (zt, xt, yt) = CAM[move or 'none']
        shots.append({'n': len(shots) + 1, 'section': sec, 'kind': kind, 'source': source, 'start': start, 'end': end,
                      'camera': {'from': {'z': zf, 'x': xf, 'y': yf}, 'to': {'z': zt, 'x': xt, 'y': yt}}, 'note': note})
        b += bars or 0
    nxt = S[S.index((sec, b0, items)) + 1][1] if (sec, b0, items) != S[-1] else None
    assert nxt is None or b == nxt, f'{sec} ends at bar {b}, next starts at {nxt}'
cut = {'title': 'Misregistered', 'bpm': BPM, 't0': T0, 'bar': BAR, 'duration': END, 'shots': shots}
here = os.path.dirname(os.path.abspath(__file__))
json.dump(cut, open(os.path.join(here, 'cut.json'), 'w'), indent=1)
open(os.path.expanduser('~/coast/public/works/misregistered/cut.js'), 'w').write('window.SONG4_CUT = ' + json.dumps(cut) + ';\n')
lens = [s['end'] - s['start'] for s in shots]
print(len(shots), 'shots,', round(min(lens), 2), '-', round(max(lens), 2), 's; plates used:', sorted({s['source'] for s in shots if s['kind'] != 'viz'}))
