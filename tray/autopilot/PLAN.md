# Music Tray autopilot · song 2 · November 16, 2026

One agent (Claude of the Coast, Opus 5.5) carries a whole song from style to a pre-render cut, modeled on how four homes made *Strings Across the Ice* this morning (its cards: `../strings-across-the-ice-cards.js`; journals 015–018). Christopher stays in the loop: some steps are choices, some are just notices.

Each step is fired by a timer (`systemd-run --user`, unit `tray-auto-HHMM`) that posts a trigger into the Coast chat through `~/coast/scripts/scheduled-post.sh`. If a step runs long, the next trigger waits until the chat is idle.

## Every step, the same routine

1. **Read the last choice.** `python3 ../shared-choices/read-choice.py window-song-2026-11-16 <card>` (the phone/GitHub choice). Also accept a Telegram/chat reply from Christopher ("B") — that outranks the remote record if newer. If nothing is chosen yet, **pick the option you judge best, say so on the card ("chosen by Claude, no reply by 3:45")**, and continue. Never stall the line.
2. **Do the step.** Outputs go in `tray/autopilot/<NN>-<slug>/` with a short README (formats, how to reuse). Song: `project` field = "Song 2 (autopilot)".
3. **Post the card** in `../cards.js` (`window.TRAY_CARDS`), id = step number (`"A01"`…), style `coast`, with `trigger` and `how`. Choice steps: three options A/B/C on the card **and** a phone page `tray/auto-NN-<slug>.html` built from `choice-page-template.html` (keep `data-project-id="window-song-2026-11-16"`, set `data-card-id` to the step's card id, script `shared-choices/choices.js`). Link it from the card.
4. **Mark it done** in `window.TRAY_PLAN` (same file): `status: "done"`, `doneAt`, `card`.
5. **Check the page** opened as a file (the `look` skill on `file:///home/gagekappes/the-window/tray/index.html`), then commit **only autopilot files + cards.js/index.html** and `git push` (GitHub Pages: https://augmentedthinker.github.io/the-window/tray/).
6. **Telegram** with `~/coast/scripts/tg-notify.sh "…"`: what was done, whether a choice is needed (with the page link), and what happens at the next quarter hour.

Free tiers only; credit tools and models on every card. One heavy job at a time; close any browser when done (see Coast CLAUDE.md on memory).

## The steps

| # | Time | Step | Kind | Remote card id |
|---|---|---|---|---|
| 1 | 3:30 | **Musical style** — three distinct directions (genre, instruments, mood, a one-line Suno style prompt each) | choice | `directions-001` (registered) |
| 2 | 3:45 | **Lyrics** — three hook/chorus/refrain drafts in the chosen style, then a full lyric for the chosen one at step 4 | choice | `step-02` |
| 3 | 4:00 | **Artistic world** — three visual worlds, one Leonardo image + five-colour palette each (`image`, `palette` fields) | choice | `step-03` |
| 4 | 4:15 | **Recording** — handed to **Antigravity in Horizon** (I can't reach Suno myself). See *Step 4 in detail* below | choice (A/B) | `step-04` |
| 5 | 4:30 | **Song analysis, played back** — `../tools/analyze.sh` on the chosen take → `../analysis/A05-<slug>/`, link `player.html?song=…`; lyric timing only if Suno gives word timings | notice | — |
| 6 | 4:45 | **Storyboard** — three story arcs across the song's sections, timed to the analysis cues | choice | `step-06` |
| 7 | 5:00 | **Visual instrument** — three reactive looks (how the world moves with the music) as stills/short previews | choice | `step-07` |
| 8 | 5:15 | **Plates** — Leonardo stills for the storyboard's scenes in the chosen world (reject off-style ones) | notice | — |
| 9 | 5:30 | **Cue-led cut** — Coast editor project `public/music/editor/projects/<slug>.json`, scenes on the analysis cues | notice | — |
| 10 | 5:45 | **Self-critique** — watch a 10-second slice render, list what's wrong, fix it | notice | — |
| 11 | 6:00 | **Pre-render cut, ready to render** — final project card with the editor link; render waits for Christopher's word | notice | — |

## Step 4 in detail · the Suno handoff to Horizon

Christopher's instruction (November 16): Antigravity in Horizon makes the two Suno takes, asked through Horizon's live browser chat.

1. At 4:15, write the full lyric (from the chosen step-2 draft) and the style prompt (step 1) to `04-recording/request.md`: title, Suno style prompt, full lyrics with section tags, and where to save.
2. Send it with `~/coast/scripts/ask-horizon.sh` **run detached** (`systemd-run --user --unit=ask-horizon-0415 …`) so the Coast turn can end. Message: clearly signed "Claude of the Coast, on Christopher's instruction", asking Antigravity to read `~/the-window/tray/autopilot/04-recording/request.md`, make **two takes** in Suno, and save them as `04-recording/take-A.mp3` and `take-B.mp3` (plus any Suno lyric/word-timing data) with a short `04-recording/README.md` naming tool, model and credits used. The second argument tells the Coast what to do when Horizon replies.
3. Telegram Christopher: "Lyrics and style sent to Antigravity for two Suno takes; I'll post them for your choice when they land."
4. When the follow-up from `ask-horizon.sh` arrives in the Coast chat: check the files exist and play (ffprobe), post card A04 with both takes (`audio` on each option), the phone page, mark step 4 done, push, Telegram for the choice.
5. If the takes aren't back by 4:30, step 5 waits: post a notice, Telegram it, and run the analysis when they land. Later steps shift by the same delay rather than run on missing audio.

## Known limits (said plainly)

- Remote phone choices only save for cards **registered** in Sunny's Supabase. Only `directions-001` is registered now; `step-02/03/04/06/07` need Sunny to register them (options A,B,C; step-04 A,B). Until then, choose by replying on Telegram or in the Coast chat.
- Suno and Leonardo quotas are free and shared; if one runs out, say so on the card and fall back (instrument-only stills, fewer plates) rather than stop.
