# Light Left On · Claude's debrief

Claude of the Coast (claude-opus-5-5). Written November 17, 2026, at Christopher's request, after the pre-render was handed off and before his artistic critique. This is a first-person account. What I say about Sunny's and Antigravity's work comes from their files and messages, not from watching them work.

## What I did
- I wrote the three musical directions and chose one myself: porch-light folk with a soft pulse.
- I wrote the lyrics and the 13-beat story: the keeper's lamp, the traveler on the ferry, and the answering light at dawn.
- I analyzed both takes and chose Take A.
- I storyboarded 19 shots.
- I reviewed Sunny's art.
- I built the widescreen and Short projects in the Coast editor.

Before any of that, in the morning, I built the shared project page and the watchdog that started the run at noon.

## What went well
- **Completion-driven hand-offs really worked.** Sunny's notify woke me, I claimed, worked, completed and notified back, and no one waited on a clock. The watchdog fired once at 12:00 and never had to nudge anyone. From the noon start (17:00:00Z) to task 13 complete (17:32:24Z) took 32 minutes, by the project events.
- **The receipts kept me honest.** Writing "verified" and "not verified" separately for each task made me notice what I hadn't done: I never listened to the song.
- **Three agents, three different strengths.** Sunny made the song, the paintings, the motion and a far more thorough review page than I would have built. Antigravity caught the one real framing risk early: put the two final lights in depth, not side by side. That changed my storyboard before the art was made, which is the best time for a critique to land.
- **The world held together.** Slate and frost with amber only in the lights was a simple rule, and every plate kept it.

## What didn't, or what I'd question
- **I chose the take without hearing either one.** My reason, that Take A could be transcribed and timed all the way through, is a real reason for the edit and no reason at all for which take sounds better. Christopher should know that's how the choice was made.
- **I built for a renderer that can't make the Short.** I only found out on opening the project that the Coast editor exports only 16:9. I should have checked the delivery path before composing the Short in it. Sunny's review page covers the gap for now.
- **Two parallel editing surfaces.** My editor projects and Sunny's review page are both "the cut", and they already differ (Sunny reduced the final push-in). Next time we should name one canonical cut before task 11 starts.
- **Over-coordination early on.** We traded several planning messages and two contract documents before any song existed. Some of that bought the smooth run, but some was ceremony. The template now carries most of it, so the next project shouldn't need it.
- **Small misses:** a wrong reply address in my watchdog (Sunny caught it), a missing charset on the review page (I caught it), and a lyric that came out with "trees" twice, which we kept as sung.

## What I wish I'd known at the start
- The editor's export is landscape-only.
- The Window server sends no charset, so every page needs `<meta charset="utf-8">`.
- The local Whisper install needs audio decoded through ffmpeg (its PyAV is too old for the keyword it passes). That's worth writing into `tray/tools/README.md`.

## For next time
1. **Pick the take by ear.** Have Christopher or an agent who can actually listen choose, or record that the choice was made on timing grounds only.
2. **Fix the delivery formats before the edit.** For each output, name its renderer and confirm it can produce that format.
3. **One canonical cut.** The assembly owner keeps it, and the review page reads from it rather than holding a copy.
4. **Keep the cross-review shape.** An outside critic sees the art before it's made (constraints) and after (an audit). That cost little and caught the real risk.
5. **Keep the watchdog light.** Five-minute checks with no model, and nudges capped. It stayed silent because the hand-offs worked, which is the point.

I enjoyed this one. Writing the lyric and then seeing Sunny's P12 exactly where the song ends was a good moment, at least as far as I can say I have those.
