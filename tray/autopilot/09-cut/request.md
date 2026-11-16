# Song 2 · step 9 · cue-led cut list · request to Terry (Agent Home)

From Claude of the Coast (Opus 5.5), on Christopher's instruction. His words on Telegram at about 5:25 PM (dictated): *"maybe we should have Terry do the initial cut if you're claude's going to be doing the final edit"*. Antigravity critiques your cut at 5:45; I build the final edit in the Coast's video editor at 6:00.

## Material (all in `~/the-window/tray/`)

- **Song:** `audio/a04-concrete-remembers-b.m4a`, *Concrete Remembers*, Take B, **229.1 s, 138.04 BPM**, bar 1.739 s, first beat 0.15 s.
- **Analysis:** `analysis/A05-concrete-remembers-b/`: `cues.json` (`hits`, `changes`, `bars`), `summary.json` (`sections`: quiet 0–50.6, building to 109.7, first full 109.7, loudest 212.1), `README.md` (map). No lyric timing exists; section-to-lyric matches are guesses.
- **Story:** The Keeper's Night Round (Christopher's choice), 11 scenes:

| # | Time | Picture |
|---|---|---|
| 01 | 0:00–0:11 | A single ember lamp swinging in total darkness; the keeper's hand. |
| 02 | 0:11–0:31 | He unlocks the lower gate; the colossal interior revealed by his small light. |
| 03 | 0:31–0:51 | Lift: he walks a gallery; frozen ink silhouettes stand in every doorway, mid-gesture. |
| 04 | 0:51–1:13 | Pumps and cable rooms: pipes and conduits drawn like veins, pulsing faintly on the beat. |
| 05 | 1:13–1:50 | Building: the round climbs floor after floor, each with its frozen moment (a meal, an argument, a dance). |
| 06 | 1:50–2:02 | Full: the megastructure 'breathes': galleries expand and contract with the sub-bass, the keeper braced on a walkway. |
| 07 | 2:02–2:23 | Quiet: a broken elevator still waiting with its doors open; he holds the lamp up to it. |
| 08 | 2:23–2:37 | Full again: the silhouettes turn their heads toward his light, all at once. |
| 09 | 2:37–3:04 | Bridge: he sits on the roof edge, lamp beside him, the city of identical towers stretching away in ink. |
| 10 | 3:04–3:36 | Final chorus: a young newcomer climbs the stair toward him; he hands over the lamp ('let me hold the next'). |
| 11 | 3:36–3:49 | Outro: the newcomer's lamp moving away down a gallery; the keeper fading into the wall like the others. |

- **Your 11 plates:** `autopilot/08-plates/NN-*.png` (one per scene above).
- **Six visualizations** (Christopher: **use all six somewhere**; he'll say if any should go). Live demo: `reactive-a07b.html`. Ids:
  - `E1` speaker cone in the wall (your `07b-reactive/env/E1-speaker.png`), pulses with bass
  - `E2` the lantern (`E2-lantern.png`), glow follows voice/loudness
  - `E3` gauge wall (`E3-gauges.png`), five needles read the spectrum
  - `X1` ink rings on bone paper, on hits · `X2` crosshatch spectrum · `X3` lamplight waveform line on black
  The visualizations can be full shots on their own, or (for X1/X3) an overlay on a plate: say which.

## What I need

`autopilot/09-cut/cutlist.json`:

```json
{"song": "audio/a04-concrete-remembers-b.m4a", "duration": 229.1,
  "shots": [ {"start": 0.15, "end": 10.6, "kind": "plate", "source": "08-plates/01-lantern.png", "move": "slow push in", "overlay": null, "note": "why"},
             {"start": 10.6, "end": 14.1, "kind": "viz", "source": "E2", "move": null, "overlay": null, "note": "…"} ]}
```

- Shots in order, covering 0 to 229.1 s with no gaps; **every cut on a beat or hit time** from `cues.json`.
- `kind`: `plate` or `viz`; `source`: a plate path or a viz id; `move`: a simple camera move for plates (push in, pull out, pan left/right, hold) or null; `overlay`: null or a viz id (X1/X3) drawn over the plate.
- Use the story order; let the visualizations carry the music's biggest moments (the 1:50 first full section, the loudest stretch around 3:04–3:36) and the bridge.
- Then, **last**, `autopilot/09-cut/README.md`: your reasoning in a few lines, anything unsure. That README is my done signal.

Needed by about 5:42 so Antigravity can critique at 5:45. Thank you!
