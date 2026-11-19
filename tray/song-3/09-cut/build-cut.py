# Every Other Note: the storyboard as a cut list on the bar grid (123.05 BPM, bars from 0.244 s).
# FRONT = the story on the screen, BEHIND = the lamp, hands and bronze, K = visualizations, D = double exposure.
# Usage: python3 build-cut.py  -> cut.json here and cut.js in the Coast works folder
import json
BAR = 4 * 60 / 123.05; T0 = 0.244 - 60 / 123.05;  # downbeats are one beat before the first tracked beat (checked against the kick's return at 144.1 s and the drop at 190.9 s)
END = 259.99
bar = lambda n: round(T0 + n * BAR, 3)
CAM = {  # (zoom, x, y) from -> to
 'push': ((1.0, .5, .5), (1.12, .5, .5)), 'pull': ((1.12, .5, .5), (1.0, .5, .5)),
 'panR': ((1.15, .42, .5), (1.15, .58, .5)), 'panL': ((1.15, .58, .5), (1.15, .42, .5)),
 'hold': ((1.04, .5, .5), (1.07, .5, .5)),
 'lamp': ((1.0, .5, .4), (1.35, .5, .22)), 'herbirds': ((1.3, .6, .45), (1.42, .68, .4)),
 'gong': ((1.1, .55, .5), (1.3, .62, .45)), 'hands': ((1.05, .5, .5), (1.25, .68, .62)),
 'faces': ((1.0, .5, .45), (1.18, .5, .4)), 'cold': ((1.12, .5, .5), (1.0, .5, .5)), 'none': ((1, .5, .5), (1, .5, .5)),
}
S = [  # (section, first bar, [(bars, source, move, note)])
 ('Intro', 0, [(3, 'F01-screen', 'push', 'The screen is lit and empty: one gong hangs in the light.'),
   (2, 'B01-lamp', 'lamp', 'Behind it: the lamp that makes the whole world.'),
   (2, 'K2', '', 'The cut-leather rosette turns; each ring goes the other way from its neighbour.'),
   (2, 'B04-gongs', 'panR', 'The bronze waiting in the dark.'),
   (3, 'F04-wide', 'panR', 'Her on one shore, him on the far edge, the whole sea between.'),
   (2, 'B05-silhouettes', 'push', 'Two players raise their puppets.'),
   (3, 'K1', '', 'Kotekan: her row and his row, each playing every other note; the melody is written in the seam between.')]),
 ('Verse 1', 17, [(2, 'F02-shore', 'gong', '"I strike the bronze, you hold the space."'),
   (2, 'B03-mallet', 'panR', '"You strike it back before it fades."'),
   (2, 'F03-boat', 'push', 'Him, far out, answering.'),
   (3, 'B06-interlock', 'push', '"Together it keeps perfect time": two hands on one row of keys.')]),
 ('Pre-chorus', 26, [(2, 'K3', '', '"Don\'t fill the silence": her colour and his, light in the seam.'),
   (2, 'B02-her-hands', 'hands', 'Her hands move her puppet; the lamp shines through its holes onto her fingers.'),
   (3, 'F05-her-birds', 'herbirds', '"Leave me the gaps and I\'ll come through": her notes fly out as birds.'),
   (2, 'B07-props', 'panL', 'Backstage, the next birds wait on the floor.')]),
 ('Chorus 1', 35, [(2, 'D:F09-profiles:B06-interlock', '', '"I play every other note": the two sides meet, story and makers in one frame.'),
   (2, 'F06-his-birds', 'panL', '"You play the ones between": his birds fly back.'),
   (2, 'K1', '', 'The interlock, made visible.'),
   (2, 'D:F04-wide:B05-silhouettes', '', '"The song is in the seam": the sea, and the two players behind it.'),
   (2, 'F08-bridge', 'pull', 'Her birds and his link wings over the water.'),
   (2, 'B03-mallet', 'panL', 'Bronze answering bronze.'),
   (2, 'F10-overlap', 'hold', '"Let our shadows overlap."'),
   (2, 'K2', '', '"And every other one comes back."')]),
 ('Verse 2', 51, [(2, 'B01-lamp', 'lamp', '"The lamp behind us shakes and sways."'),
   (3, 'F13-huge', 'push', '"And throws us larger than the stage."'),
   (2, 'K3', '', 'The seam widens and narrows with the music.'),
   (2, 'F11-dance', 'panR', 'They dance on the bridge.'),
   (2, 'B05-silhouettes', 'pull', 'The players lean toward each other behind the screen.'),
   (2, 'F09-profiles', 'faces', '"You\'re taller when you lean to me."'),
   (2, 'K1', '', '"I\'m closer when you let me be."')]),
 ('Pre-chorus 2', 66, [(2, 'B02-her-hands', 'push', '"Don\'t fill the silence."'),
   (3, 'F02-shore', 'pull', 'She waits at the gong.'),
   (3, 'K3', '', '"Leave me the gaps and I\'ll come through."')]),
 ('Chorus 2', 74, [(2, 'D:F10-overlap:B06-interlock', '', '"I play every other note": overlap, front and behind.'),
   (2, 'F03-boat', 'panR', 'He rows toward her.'),
   (2, 'K1', '', 'The two rows, one melody.'),
   (2, 'D:F08-bridge:B05-silhouettes', '', 'The bridge of birds with its makers behind it.'),
   (2, 'B04-gongs', 'panL', 'The gongs ring.'),
   (2, 'F06-his-birds', 'push', '"Every other note is mine."'),
   (2, 'K2', '', 'The rosette spins.'),
   (2, 'F09-profiles', 'push', '"And every other one comes back": face to face.')]),
 ('Breakdown', 90, [(3, 'F01-screen', 'pull', '"Between": the screen empties; only the gong is left.'),
   (3, 'K3', '', '"Every other": the seam, almost still.'),
   (2, 'B01-lamp', 'lamp', 'The lamp flares before the drop.')]),
 ('Drop', 98, [(1, 'B03-mallet', 'panR', 'The drop: the mallet strikes on the downbeat (Antigravity\'s note).'),
   (1, 'F07-deep', 'push', 'The sea rises under both of them. Front, behind, front, behind: the edit plays kotekan.'),
   (1, 'B06-interlock', 'push', ''), (1, 'F11-dance', 'push', ''),
   (1, 'B04-gongs', 'panR', ''), (1, 'F08-bridge', 'push', ''),
   (2, 'K1', '', 'Both rows at full speed.')]),
 ('Final chorus', 106, [(2, 'D:F11-dance:B05-silhouettes', '', '"I play every other note."'),
   (2, 'F07-deep', 'pull', '"You play the ones between."'),
   (2, 'K3', '', '"Neither one of us is the song."'),
   (2, 'D:F09-profiles:B02-her-hands', '', '"The song is in the seam."'),
   (2, 'F12-tide-tree', 'pull', 'The tree of the tide: branches becoming waves and birds.'),
   (2, 'B06-interlock', 'hold', 'Two hands, one row.'),
   (2, 'K1', '', 'The last interlock.'),
   (2, 'F10-overlap', 'push', 'Overlapped.'),
   (2, 'B05-silhouettes', 'push', 'The two players lean together before the lamp goes out (Antigravity\'s note: end the chorus on people).')]),
 ('Outro', 124, [(3, 'F13-huge', 'push', 'Their shadows grow huge and soft as the lamp comes close.'),
   (3, 'B08-after', 'hands', 'The lamp is out. Two hands rest together on the gong.'),
   (None, 'F01-screen', 'cold', 'The screen again, the lamp out: cold moonlight on the empty cloth, one gong (Antigravity\'s idea).')]),
]
shots = []; n = 1
for sec, b0, items in S:
    b = b0
    for bars, src, move, note in items:
        start = bar(b); end = END if bars is None else bar(b + bars)
        kind = 'cold' if move == 'cold' else 'viz' if src[0] == 'K' else 'double' if src.startswith('D:') else 'front' if src[0] == 'F' else 'behind'
        sh = {'n': n, 'section': sec, 'start': 0.0 if n == 1 else start, 'end': end, 'kind': kind, 'source': src, 'note': note}
        if move: sh['camera'] = {'from': dict(zip('zxy', CAM[move][0])), 'to': dict(zip('zxy', CAM[move][1]))}
        shots.append(sh); n += 1; b += bars or 0
    nxt = [x[1] for x in S if x[1] > b0]
    if nxt and b != min(nxt): print('WARN', sec, 'ends at bar', b, 'next starts', min(nxt))
for a, c in zip(shots, shots[1:]): assert abs(a['end'] - c['start']) < 1e-6
cut = {'title': 'Every Other Note', 'duration': END, 'bpm': 123.05, 'bar': round(BAR, 4), 'shots': shots}
json.dump(cut, open('/home/gagekappes/the-window/tray/song-3/09-cut/cut.json', 'w'), indent=1)
open('/home/gagekappes/coast/public/works/every-other-note/cut.js', 'w').write('window.SONG3_CUT = ' + json.dumps(cut) + ';\n')
d = [s['end'] - s['start'] for s in shots]
print(len(shots), 'shots; lengths', round(min(d), 2), '-', round(max(d), 2), 'mean', round(sum(d) / len(d), 2))
from collections import Counter; print(Counter(s['kind'] for s in shots), Counter(s['source'] for s in shots).most_common(5))
