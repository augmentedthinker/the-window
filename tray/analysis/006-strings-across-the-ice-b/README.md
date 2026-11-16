# Song analysis · Strings Across the Ice, Take B

Music Tray card 006, by Claude of the Coast, November 16, 2026. Made with `tray/tools/` (see `tools/README.md` to redo it or analyze another song). Check it by ear in `tray/player.html?song=analysis/006-strings-across-the-ice-b`.

**To build visualizers from this song:** read "Building visualizers from an analysis" in `tray/tools/README.md` (what each signal is, what it's good for, timing and smoothing), and use `tray/player.html` as a working example.

**Audio:** `tray/audio/004-strings-across-the-ice-b.m4a`, the take Christopher chose on card 004. 259.63 s, 100 BPM, a bar every 2.4 s, first beat at 0.167 s.
**Lyrics:** not timed here; that's a separate step. The lyrics as submitted are in Terry's Suno submission (Agent Home, `projects/music-studio/strings-across-the-ice/qa/submitted-fields.json`).
**All times are seconds from the start of the audio file.**

## The song's map

0:00–1:01 quiet intro (singing in it, most likely verse 1) · 1:01 hook · 1:07–1:32 chorus 1 · 1:34–1:42 refrain (biggest lift so far at 1:41) · 1:42–1:55 instrumental · 1:55–2:14 verse 2 · 2:14–2:40 chorus 2 (lift at 2:19) · 2:40–3:02 instrumental break (full energy from 2:53) · 3:02–3:22 bridge, sung twice · 3:22–3:48 final chorus · 3:49–3:56 refrain · 3:56–4:17 outro, still full (loudest bar 4:15) · 4:17 sudden drop to the end.

The map's names (hook, chorus, verse 2…) come from where the lyrics were heard, so treat them as approximate; the energy sections and times are measured. **Correction:** the intro is not purely instrumental; Christopher hears singing in the first minute (most likely verse 1), which speech-to-text missed.

## Files

- **`analysis.js`**: everything below in one file for web pages, as `window.SONG_ANALYSIS = {title, audio, summary, features, cues}`. Load it with `<script src="analysis/006-strings-across-the-ice-b/analysis.js">` (pages opened as local files can't fetch JSON). `audio` is relative to `tray/`.
- **`summary.json`**: `duration`, `bpm`, `bar_seconds`, `beats` (count), `first_beat`, `loudest` (s), and `sections` as `{level: quiet | building | full, bars, start, end}`, found from loudness.
- **`features.json`**: for visualizers. `fps` 30, `frames` 7788, `duration`, `bpm`, `beats` (list of beat times). `bass`, `mid`, `high`, `rms` (loudness) and `flux` (onset strength) are each **base64 of one unsigned byte per frame**, 0–255, scaled within this song. `bands`: base64, 32 bytes per frame, a spectrum from low to high. `wave`: base64, 32 bytes per frame, 128 = silence. In JavaScript:

  ```js
  const bytes = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const A = window.SONG_ANALYSIS, bass = bytes(A.features.bass), bands = bytes(A.features.bands);
  const f = Math.floor(audio.currentTime * 30);   // frame
  bass[f] / 255;           // 0..1
  bands[f * 32 + k] / 255; // band k, 0..1
  ```
- **`features.npz`**: the same, unquantized, for Python (`numpy.load`): `bass mid high rms flux` (per frame), `bins` (frames × 64), `wave` (frames × 256), `beats`, `dur`, `bpm`.
- **`cues.json`**: for cutting and scene planning. `beats`; `sections`; `bars` (108: `bar`, `start`, and `rms bass mid high` each 0–1 within this song); `hits` (143 `{t, strength}`: strong onsets snapped to a beat, good for cuts and flashes); `changes` (`{t, bar, kind: lift | drop, size}`: big bar-to-bar jumps); `peak_bar`.
