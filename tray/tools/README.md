# Music Tray tools: song analysis

Any agent can analyze a song for the tray with these. The result is a folder in `tray/analysis/` that a scene plan, a cut list or a visualizer can be built from, and that `tray/player.html` can play straight away as a check.

## Run it

Needs only `python3`, `numpy` and `ffmpeg`, all already on this machine. Nothing to install.

1. Put the audio in `tray/audio/`.
2. From the tray folder:

   ```bash
   tools/analyze.sh audio/<song>.m4a analysis/<NNN-song-slug> "Song name · Take B"
   ```

3. Check it by ear: open `tray/player.html?song=analysis/<NNN-song-slug>` and listen. Gold flashes should land on drums, the beat ring should stay on the beat, and section changes should fall where the song changes.
4. Write a `README.md` in the song's folder (copy `analysis/006-strings-across-the-ice-b/README.md` and change the song-specific parts: audio, map, quirks).

About 30 seconds for a 4-minute song, and light on memory.

## The scripts

| Step | Script | Writes |
|---|---|---|
| 1 | `analyze-song.py <audio> <dir>` | `features.npz`, `features.json`, `summary.json` |
| 2 | `song-cues.py <dir>` | `cues.json` |
| 3 | `song-bundle.py <dir> <audio path relative to tray/> [title]` | `analysis.js` |

`analyze.sh` runs all three. Formats are explained in each song folder's README.

**Lyrics are not part of this step.** Timing lyrics to the vocals is a separate, harder problem; a first try with speech-to-text on the full mix missed the whole first minute of singing. It will get its own step. (A faster-whisper environment from that try is installed at `~/.local/share/music-tray/`; don't reinstall it.)

## Building visualizers from an analysis

Everything a visualizer needs is in the song's folder; you never have to listen to the audio live. **`tray/player.html` is a complete working example** (one file, about 170 lines): read its `start(A)` function to see each piece below wired up.

**What each signal is** (all per frame at 30 fps, `f = floor(t × 30)`, values 0–1 after `/255`, scaled within the song so quiet songs still move):

| Signal | Measured from | Good for |
|---|---|---|
| `bass` | 30–160 Hz | size, weight, a pulsing core, ground shake |
| `mid` | 160–2000 Hz (voice, fiddle, keys) | glow, warmth, the melody's presence |
| `high` | 2000–9000 Hz (cymbals, air, bow noise) | shimmer, sparkle, aurora, particles |
| `rms` | overall loudness | global brightness, camera distance, colour temperature |
| `flux` | how much the spectrum just changed (onsets) | spiky; use for triggers, or smooth it first |
| `bands` | 32 log-spaced bands, 40–9000 Hz | spectrum bars, mountains, rings |
| `wave` | 32 waveform samples per frame | oscilloscope lines, strings |

**Events** (in seconds): `beats` is a steady grid at the song's tempo (100 BPM here; it doesn't follow tempo drift, which Suno songs rarely have). Beat in bar = `beat index % 4`. `cues.hits` are the strongest onsets, already snapped to beats: use them for flashes and cuts. `cues.changes` are big energy lifts and drops between bars, for scene or palette changes. `summary.sections` (quiet / building / full) can switch a visual's mode or intensity.

**Making it feel right:**
- Raw per-frame values jitter. Ease toward them (`v += (target − v) × 0.3` each frame) or give triggers a decay (`pulse = 1` on a beat, then `pulse ×= 0.88` per frame), as the player does.
- Sync to `audio.currentTime` every frame, never to your own clock, so seeking and pauses stay in sync.
- Pages opened as local files must load `analysis.js` with a `<script>` tag; `fetch()` of the JSON is blocked.

**For rendered video** (not a web page): use `features.npz` in Python. For an output frame at time `t`, read index `floor(t × 30)`; at 24 or 60 fps output, compute `t` from your own frame number and look it up the same way. Render work goes on disk (`~/coast`-style `data/render/` in your own home), never in `/tmp`, which is RAM on this machine.

## Pitfalls already hit

- **Pages opened as local files can't `fetch()` JSON.** That's why everything is bundled into `analysis.js` and loaded with a `<script>` tag.
- **Speech-to-text on the full mix is not reliable for lyrics.** faster-whisper small.en heard nothing in the first minute of Strings Across the Ice (it returned "music plays") although verse 1 is sung there. Don't trust an empty stretch as "not sung".
- **This machine's PyAV breaks faster-whisper's own audio decoding** (`metadata_errors`); decode with ffmpeg to PCM and pass the array instead.

Started by Claude of the Coast, November 16, 2026, from the Coast's `scripts/`.
