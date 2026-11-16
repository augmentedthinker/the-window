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

**Step 1 was decided by Christopher, not from the options:** read `01-style/directions.json` → `decision.direction` (dark industrial electronica; Monolith's ink art) for the style, Suno line and art direction.

## The steps

| # | Time | Step | Kind | Remote card id |
|---|---|---|---|---|
| 1 | 3:30 | **Musical style** — three distinct directions (genre, instruments, mood, a one-line Suno style prompt each) | choice | `directions-001` (registered) |
| 2 | 3:45 | **Lyrics** — three hook/chorus/refrain drafts in the chosen style, then a full lyric for the chosen one at step 4 | choice | `step-02` |
| 3 | 4:00 | **Artistic world** — three takes within Monolith's monochrome architectural ink style (Christopher's choice at step 1), one Leonardo image + five-colour palette each (`image`, `palette` fields) | choice | `step-03` |
| 4 | 4:15 | **Recording** — handed to **Antigravity in Horizon** (I can't reach Suno myself). See *Step 4 in detail* below | choice (A/B) | `step-04` |
| 5 | 4:30 | **Song analysis, played back** — `../tools/analyze.sh` on the chosen take → `../analysis/A05-<slug>/`, link `player.html?song=…`; lyric timing only if Suno gives word timings | notice | — |
| 6 | 4:45 | **Storyboard** — three story arcs across the song's sections, timed to the analysis cues | choice | `step-06` |
| 7 | 5:00 | **Visual instrument** — three reactive looks (how the world moves with the music) as stills/short previews | choice | `step-07` |
| 8 | 5:15 | **Plates** — scene stills in the chosen world, **made by Terry in Agent Home** (image generation), requested at 5:00. See *Delegation* below | notice | — |
| 9 | 5:30 | **Cue-led cut list** — by **Terry in Agent Home** (as for the first song, card 011). Claude sends the request at 5:30; Terry returns `09-cut/cutlist.json` + README; Claude posts it as card A09 | notice | — |
| 10 | 5:45 | **Critique** — by **Antigravity in Horizon** (strong image understanding; Claude shouldn't grade its own cut). Requested at 5:30 with the cut; Claude applies the fixes at step 11 | notice | — |
| 11 | 6:00 | **Final edit, ready to render** — Claude builds the Coast editor project from Terry's cut list, applies Antigravity's critique, checks a 10-second slice, posts the pre-render card | notice | — |

## Recap · process journals (added by Christopher, 5:47 PM)

"It's not finished until we do a recap like we did with the journals." Each contributor writes a short note to their future self (tools, commands, pitfalls, what they wish they had known; Christopher, about 5:50 PM: "a little more concise"), one per quarter hour, using `12-journals/request.md`. At each time, Claude sends the request (neighbor message / chat, quoting Christopher), watches for `12-journals/<name>.md`, then posts it as a card with an HTML page (`../journal-a<NN>-<name>.html`, styled like the first song's journals) and Telegrams Christopher.

| # | Time | Who | Model |
|---|---|---|---|
| 12 | 6:15 | Terry, Agent Home | GPT-6.1 Terra (Codex) |
| 13 | 6:30 | Antigravity, Horizon | Gemini 3.8 Flash |
| 14 | 6:45 | Sunny, Solarium | GPT-6.1 Sol (Codex) |
| 15 | 7:00 | Claude, the Coast | Opus 5.5 (last, after reading the others; also answers the open questions in `12-journals/christopher.md`) |

## Step 4 in detail · the Suno handoff to Horizon

Christopher's instruction (November 16): Antigravity in Horizon makes the two Suno takes, asked through Horizon's live browser chat.

1. At 4:15, write the full lyric (from the chosen step-2 draft) and the style prompt (step 1) to `04-recording/request.md`: title, Suno style prompt, full lyrics with section tags, and where to save.
2. Send it with `~/coast/scripts/ask-horizon.sh` **run detached** (`systemd-run --user --unit=ask-horizon-0415 …`) so the Coast turn can end. Message: clearly signed "Claude of the Coast, on Christopher's instruction", asking Antigravity to read `~/the-window/tray/autopilot/04-recording/request.md`, make **two takes** in Suno, and save them as `04-recording/take-A.mp3` and `take-B.mp3` (plus any Suno lyric/word-timing data) with a short `04-recording/README.md` naming tool, model and credits used. The second argument tells the Coast what to do when Horizon replies.
3. Telegram Christopher: "Lyrics and style sent to Antigravity for two Suno takes; I'll post them for your choice when they land."
4. When the follow-up from `ask-horizon.sh` arrives in the Coast chat: check the files exist and play (ffprobe), post card A04 with both takes (`audio` on each option), the phone page, mark step 4 done, push, Telegram for the choice.
5. If the takes aren't back by 4:30, step 5 waits: post a notice, Telegram it, and run the analysis when they land. Later steps shift by the same delay rather than run on missing audio.

**Step 5 note (4:28 PM):** I can't listen, so the take is Christopher's call. If step-04 has no choice at 4:30, Telegram a reminder and check again every few minutes until 4:45; only then pick (the take that's closer to the 2:40 brief, B) and say so on the card.

**Step 7b (interjection, 5:13–5:22 PM):** six live visualizations, `../reactive-a07b.html` (environmental E1–E3 by Terry, abstract X1–X3 by Claude). Christopher chose **all six, opt-out**: the cut (step 9) uses every one of them somewhere, matched to the scenes, and drops any he names.

**Step 9 request to Terry (Christopher, 5:25 PM: "maybe we should have Terry do the initial cut if Claude's going to be doing the final edit"):** at 5:30 write `09-cut/request.md` with: the song (`audio/a04-concrete-remembers-b.m4a`, 229.1 s, 138 BPM) and its analysis folder (`analysis/A05-concrete-remembers-b/`: `cues.json` hits/changes/bars, `summary.json` sections); storyboard B's 11 scenes and times; Terry's own 11 plates (`08-plates/`); the six visualizations (`reactive-a07b.html`; ids E1 speaker, E2 lantern, E3 gauges, X1 ink rings, X2 crosshatch, X3 lamplight line; env images in `07b-reactive/env/`), **all six to be used somewhere**. Ask for `09-cut/cutlist.json`: an ordered list of shots `{start, end, kind: "plate"|"viz", source, move (e.g. slow push/pan), note}` covering 0–229.1 s with every cut on a beat or hit, plus `09-cut/README.md` last (the done signal; the reasoning and anything unsure). Send via Agent Home's neighbor-message route, quoting Christopher; watch for the README; when it lands, post card A09 crediting Terry and send the cut list to Antigravity for the 5:45 critique (step 10 request), using the cut list plus a contact sheet Claude renders from it.

**Critiques and interjections (Christopher, 5:55 PM):** a critique is advice for the next agent to consider, never instructions; the agent doing the work weighs it and says what it took and why. Christopher may add an **interjection** to any card at any time (relayed by Claude, appended and labelled with his name and time, never rewriting the other agent's text); it is also advice to weigh. His standing editing guidance: cuts every ~3–6 seconds, on musical cues, rotating between kinds of scenes so it never gets samey.

## Delegation · who does what

Christopher's direction (4:20 PM): the Coast runs the line and sends out the work it can't do itself. Leonardo is finite (78 of 150 daily tokens left after step 3, about 9 images), so image-heavy work goes to neighbors.

| Work | Who | How |
|---|---|---|
| Style, lyrics, storyboard, cut, critique, analysis | Claude (Coast) | here |
| Suno takes (step 4) | Antigravity, Horizon | `~/coast/scripts/ask-horizon.sh` (streams reply, then posts a follow-up here) |
| Cue-led cut list (step 9) | Terry, Agent Home (GPT-6.1 Terra) | neighbor message + watcher, at 5:30 |
| Critique of the cut (step 10) | Antigravity, Horizon (Gemini 3.8 Flash) | `ask-horizon.sh` at 5:30, right after posting the cut |
| Scene plates (step 8), ~8–12 stills | Terry, Agent Home (OpenAI image generation) | `~/coast/scripts/ask-terry.sh` (retries while busy, waits for a done file, then posts a follow-up here) |
| Visual-instrument previews (step 7) | Claude, in code (no image credits); Sunny if a richer animated preview is wanted | — |
| Fallback images | Coast Leonardo (reserve the remaining tokens) | `~/coast/scripts/generate-image.js` |

**Step 8 request (send at 5:00, right after posting step 7):** write `08-plates/request.md` with the chosen storyboard's scenes (one prompt per scene, the time each covers), the style reference `03-world/A-ember.jpg` (world A, Bone & Ember, chosen 4:10) and its palette, size 1344×768 or 16:9, no text/signatures. Ask Terry to save `08-plates/NN-<slug>.png` and finish with `08-plates/README.md` (tool, model, prompts as used) — that README is the done file. At 5:15, if the plates aren't in yet, post the notice that they're coming and carry on with what doesn't need them.

Every delegated message is signed "From Claude of the Coast, on Christopher's instruction" and points to a request file in the Window; results come back as files in the Window, never as pasted secrets. Once a home's neighbor-message switch is on (see `~/the-window/neighbor-chat/`), use `/api/neighbor-message` instead of the plain chat route.

**Step 10 request (send at 5:30, right after posting the cut):** render a 10-second slice of the real project and a contact sheet (one frame per scene, labelled with scene number and time) into `10-critique/`, and write `10-critique/request.md`: the project path, the song and its analysis, the storyboard, world A's reference and palette, and what to judge (story readability without the lyrics, style consistency with Bone & Ember, cuts against the music, any image faults like text or signatures). Ask Antigravity for `10-critique/review.md`: numbered findings, each saying what it would change and how important it is. At 5:45 post the review as card A10 (a notice, crediting Antigravity); at 6:00 apply the fixes before the pre-render card and say on A11 which findings were taken and which weren't, and why.

## Known limits (said plainly)

- Remote phone choices only save for cards **registered** in Sunny's Supabase. Only `directions-001` is registered now; `step-02/03/04/06/07` need Sunny to register them (options A,B,C; step-04 A,B). Until then, choose by replying on Telegram or in the Coast chat.
- Suno and Leonardo quotas are free and shared; if one runs out, say so on the card and fall back (instrument-only stills, fewer plates) rather than stop.
