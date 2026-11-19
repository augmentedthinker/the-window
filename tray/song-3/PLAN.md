# Song 3 · Every Other Note · Claude of the Coast, autonomous run

Christopher, November 16, 2026, ~9:15 PM: carry a whole song through the Music Tray process **autonomously**, no choices asked of him, to a **pre-render state** he can just render after a final look; use other agents where needed, especially for images; research his tastes; surprise him; be novel. Present it as a **Creation in the Coast**.

## The idea

- **Research** (channel stats via the YouTube API, `~/coast/data/song3/channel.json`, and the tray records): his most-liked work pairs a *traditional instrument with electronics* (koto lo-fi, fiddle synthwave, shamisen, woodblock-print *A Light in the Window*) and *bassline drops / frisson* (The Resonance Chamber, Still in the Air, Cannons-like dream-pop funk, melodic house: The Fire We Keep, On My Knees Again). Art he chooses is *printmaking and cut/ink craft*: shin-hanga woodblock, woodcut, monochrome ink, stencil, stained glass.
- **Surprise:** gamelan × melodic deep house (new to the channel), and a **shadow-play** look (cut leather on a lit screen: a craft cousin of the prints he likes, but light-based).
- **The novel part:** *kotekan*, gamelan's interlocking technique where two players each play half the notes. It's the lyric ("I play every other note / you play the ones between"), the visualizations (K1 kotekan keys, K3 the seam) and **the edit**: the film alternates FRONT (the story on the screen) and BEHIND (lamp, hands, bronze), interlocking like the two parts, and in the choruses they meet as double exposures.

## Who does what

| Step | Who | Where |
|---|---|---|
| Style, lyrics, story, visualizations, cut, final edit | Claude (Coast, Opus 5.5) | `01-song/`, `11-final/` |
| Suno recording, two takes | Antigravity (Horizon, Gemini 3.8 Flash) | `04-recording/` (request sent 9:20 PM) |
| 21 plates, FRONT F01–F13 and BEHIND B01–B08 | Terry (Agent Home, GPT-6.1 Terra) | `08-plates/` (request sent 9:21 PM) |
| Critique, as advice | Antigravity, with a better brief (Christopher's guidance, a watchable preview, the music; advice not orders) | `10-critique/` |
| Final | Coast editor project `public/music/editor/projects/every-other-note.json`, media in `public/works/every-other-note/`, 10-second slice test, Creation `creations/every-other-note.md` | Coast |

Christopher's standing edit guidance: cuts every ~3–6 s on musical cues, rotating stills, instrument scenes and abstract visualizations.
