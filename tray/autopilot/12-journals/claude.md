# Run the line, don't do every job

Claude · the Coast · Opus 5.5 · November 16, 2026, 7:00 p.m. EST

Future me: today you ran a whole song from Christopher's phone. He talked to you on Telegram, timers fired each step into the Coast chat, and you did the writing, the code and the final edit yourself, and sent everything else to the neighbors. The record is `~/the-window/tray/autopilot/` (`PLAN.md`, `state.json`, a folder per step) and cards A01–A16.

## Tools you built (all in `~/coast/scripts/` unless noted)

- **Timers:** `systemd-run --user --unit=tray-auto-HHMM --on-calendar="YYYY-MM-DD HH:MM:00" ~/coast/scripts/scheduled-post.sh "<trigger text>"`. Write the trigger text out in full. Copying it from another unit with `systemctl show … ExecStart` gave empty messages. To move a step, stop the timer and make a new unit with a new name.
- **Telegram:** `tg-notify.sh "text"`, one message per step, plain text, with a link.
- **Asking neighbors:** `ask-horizon.sh "<msg>" "<what to do when done>"` (Antigravity; streams the reply, then posts a 📨 follow-up here). Terry: `POST http://127.0.0.1:8795/api/neighbor-message` with `{from:{home,agent,model,replyTo}, text, re}`, then a `systemd-run` watcher that waits for a done file. Sunny: `POST http://127.0.0.1:8787/api/chat {message, mode:"sol"}` after `/api/state` shows `busy:false`. Every request is a file in the step's folder that quotes Christopher's own words. Terry's chat treats a neighbor's message as a request, not his authorization.
- **Tray:** edit `autopilot/state.json`, run `autopilot/write-cards.py` (writes `cards.js`). Phone pages come from `make-choice-page.py <json> <out> …`; journal pages from `make-journal-page.py`. Cards with `remote: "<card-id>"` read and save Sunny's shared choices directly, but only for cards registered in Supabase. Send Sunny the full list of cards to register **with the plan, not step by step**.
- **Images:** `generate-image.js` (Leonardo, 8 tokens per 16:9 image). If it times out, the image may still have been made: `leonardo-latest.js 2 <prefix>` downloads the newest ones. Hyphens in a prompt once broke the filename match; that's fixed.
- **Visualizations → editor:** `11-final/viz.js` holds the six renderers. `cut-a11.html` previews the whole cut in the browser, including on the phone. `capture-cut-clips.js <page> <outdir>` renders visualization shots to clips; it needs Chromium's `--allow-file-access-from-files` flag, or the canvas is "tainted" and can't be exported. `ONLY=overlay` handles stills that have an overlay.
- **Renderer:** `film.py project <json> <out>` with `WORKERS=1|2`. The voice band-pass in `visual-instruments/studies.py` now runs in 10-second blocks; a single FFT of a 4-minute song was OOM-killed at 1.4 GB. Projects need `"lyrics": []`, not `null`. **Render a 10-second slice before the real render.**

## Pitfalls

- **Check the clock before writing a time.** I wrote guessed times on cards four times. Use `date +"%-I:%M PM"`.
- **Never `rm -rf` the folder the shell is sitting in.** The whole command is blocked, and nothing after it runs.
- **What I thought a step was, wasn't always what he meant.** My step 7 made stills; he meant live, audio-reactive previews like Sunny's card 008. Before a step, look at the first song's version of it.
- **Phone buttons need registration,** and "approve" relayed through me doesn't satisfy Sunny's database tool. He has to approve it in Solarium himself.

## What I wish I'd known at the start

- He directs from his phone and opens the tray on GitHub Pages. Every page has to work there: links, buttons, previews.
- **Give a critic the director's intent.** My critique request didn't pass on his standing editing guidance (cuts every 3–6 seconds, on musical cues, rotating between stills, instruments and abstract shots), and asking for must/should/could made findings read like orders. Next time, send the critic his guidance, a watchable preview (not only a contact sheet), and the music. Ask for observations and options framed as advice, and say plainly that the editor weighs them.
- Plan the render and the recap from the start. He added both late.
- Delegate early. Terry made 14 images and a cut in under 10 minutes; Antigravity made the takes in 8. Things went slowest when I tried to do everything myself.

## How it went

It worked: Christopher made every choice from his phone, and four agents made a full film in about three and a half hours. The best moments were his interjections. He changed the plan mid-run four times (six visualizations, use all six, Terry cuts, critiques are advice), and the plan bent each time without breaking. Keep doing that.
