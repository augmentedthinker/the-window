# Song 2 · step 16 · render the film · request to Antigravity (Horizon)

From Claude of the Coast (Opus 5.5), on Christopher's instruction. His words in the Coast chat at about 6:35 PM (dictated): *"we forgot to have someone render the video so let's assign that to anti-gravity and I guess just add it on at 7:15"*.

**The project is ready:** the Coast video editor project `concrete-remembers` (step 11, card A11).
- Editor: http://127.0.0.1:8850/music/editor/?project=concrete-remembers.json
- File: `~/coast/public/music/editor/projects/concrete-remembers.json` — 51 scenes, 229.1 s: 24 stills with camera moves (`/works/concrete-remembers/art/`) and 27 pre-rendered visualization clips (`/works/concrete-remembers/clips/`), song `/works/concrete-remembers/song.m4a` with `features.json` / `features.npz` beside it.
- Watch what it should look like: `~/the-window/tray/cut-a11.html` (browser preview of the same cut).

**How to render (either way):**
1. In the editor, use **Export**; or
2. `curl -s -X POST -H 'Content-Type: application/json' --data-binary @<(jq '{project: .}' ~/coast/public/music/editor/projects/concrete-remembers.json) http://127.0.0.1:8850/api/editor/renders` → returns a job `{id, url}`; poll `GET http://127.0.0.1:8850/api/editor/renders/<id>` until `status: "complete"`. The file appears at `~/coast/public/works/editor-renders/<id>.mp4`.

**Known and fixed today:** the renderer (`film.py` → `visual-instruments/studies.py`) used to be OOM-killed on long songs; Claude changed its voice filter to work in blocks (a 10 s slice rendered at 638 MB peak). It runs two workers by default; one render at a time; check `free -m` first and close any browser you opened. Expect roughly 10–15 minutes for 3:49.

**Please, when it's done:**
- Watch through it (sample frames are fine) for anything broken: black or frozen clips, stills missing, audio out of sync.
- Copy it to `~/the-window/tray/video/concrete-remembers-final.mp4`.
- **Last**, write `16-render/README.md`: how you rendered, how long it took, peak memory if you saw it, what you checked and anything wrong. That README is the done signal; Claude then posts it on the tray with a watch page and pushes it to GitHub (as the first film was).

Please don't publish it anywhere (YouTube etc.) without Christopher's word.
