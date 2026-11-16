// Music Tray cards for the current project. Completed projects have their own archived cards.
// Song 2 is run by one agent on a timer: see autopilot/PLAN.md. Generated from autopilot/state.json
// by autopilot/write-cards.py — edit state.json, not this file.
window.TRAY_PLAN = [
 {
  "step": 1,
  "time": "3:30 PM",
  "title": "Musical style",
  "kind": "choice",
  "status": "done",
  "doneAt": "3:37 PM",
  "card": "A01"
 },
 {
  "step": 2,
  "time": "3:45 PM",
  "title": "Lyrics: hook, chorus & refrain",
  "kind": "choice",
  "status": "done",
  "doneAt": "3:52 PM",
  "card": "A02"
 },
 {
  "step": 3,
  "time": "4:00 PM",
  "title": "Artistic world (three takes on Monolith's ink style)",
  "kind": "choice",
  "status": "planned"
 },
 {
  "step": 4,
  "time": "4:15 PM",
  "title": "Recording (Suno, two takes)",
  "kind": "choice",
  "status": "planned"
 },
 {
  "step": 5,
  "time": "4:30 PM",
  "title": "Song analysis, played back",
  "kind": "notice",
  "status": "planned"
 },
 {
  "step": 6,
  "time": "4:45 PM",
  "title": "Storyboard",
  "kind": "choice",
  "status": "planned"
 },
 {
  "step": 7,
  "time": "5:00 PM",
  "title": "Visual instrument",
  "kind": "choice",
  "status": "planned"
 },
 {
  "step": 8,
  "time": "5:15 PM",
  "title": "Plates (scene stills)",
  "kind": "notice",
  "status": "planned"
 },
 {
  "step": 9,
  "time": "5:30 PM",
  "title": "Cue-led cut",
  "kind": "notice",
  "status": "planned"
 },
 {
  "step": 10,
  "time": "5:45 PM",
  "title": "Self-critique & fixes",
  "kind": "notice",
  "status": "planned"
 },
 {
  "step": 11,
  "time": "6:00 PM",
  "title": "Pre-render cut · ready to render",
  "kind": "notice",
  "status": "planned"
 }
];
window.TRAY_CARDS = [
 {
  "id": "A01",
  "by": "Claude of the Coast",
  "model": "Opus 5.5",
  "style": "coast",
  "posted": "November 16, 2026 · 3:35 PM",
  "project": "Song 2 (autopilot)",
  "title": "Step 1 · Musical style — Christopher's own direction",
  "prompt": "Christopher chose none of the three (via Telegram, 3:38 PM): \"something more like the musical style in Monolith, The Resonance Chamber or When the Wires Wake, with the artistic style of Monolith.\"\n\nSound: Dark industrial electronica and cinematic darksynth in the family of Monolith (Horizon), The Resonance Chamber (Horizon) and When the Wires Wake (Astra): a heavy half-time stride, saturated detuned analog sub-bass, dry crushing kick, cavernous snare, ticking metallic percussion, cold granular pads, and a low, intimate voice inside the machinery. Original melody and lyric; none of those recordings are used.\n\nArt: Monolith's look: monochrome architectural pen-and-ink, brutalist megastructures, cables and conduits as the performers, a small human figure for scale; charcoal, slate and bone paper with one restrained accent colour. New plates only; none of Monolith's art is used.\n\nTempo: about 138 BPM, felt as a 69 BPM half-time stride.\nSuno style line for step 4: dark industrial electronica, cinematic darksynth, 138 bpm half-time stride, saturated detuned analog sub-bass, dry crushing kick, cavernous snare, ticking metallic percussion, cold granular pads, low intimate baritone vocal, minor key, vast negative space, nocturnal",
  "link": {
   "href": "auto-01-style.html",
   "label": "Choose on the phone page"
  },
  "options": [
   {
    "key": "A",
    "name": "Desert Night Soul (not chosen)",
    "description": "Slow-burning cinematic desert blues: tremolo baritone guitar, frame drum and hand claps, upright bass, a smoky low female vocal; the last chorus opens into a wide, gospel-tinged group answer. Feeling: Heat leaving the sand after dark. Patient, a little dangerous, then warm. Tempo: about 72 BPM, half-time swing."
   },
   {
    "key": "B",
    "name": "Harbor Lights City Pop (not chosen)",
    "description": "Bright 1980s-style city pop: slap bass, Rhodes piano, glassy chorus guitar, short brass stabs, a light male–female duet trading lines and meeting on the hook. Feeling: A late ferry ride into a lit-up harbor, windows down, nothing urgent. Tempo: about 112 BPM, steady four-on-the-floor lift in the chorus."
   },
   {
    "key": "C",
    "name": "Cathedral Breaks (not chosen)",
    "description": "Starts as a still choir over an organ drone and bells, then drops into fast, liquid drum and bass: rolling breakbeats, deep sub, chopped choir phrases over the top. Feeling: Stone and stained glass suddenly running. Awe that turns into motion. Tempo: slow, free intro, then 172 BPM."
   }
  ],
  "trigger": "⏰ Music Tray autopilot · 3:30 PM trigger · Step 1. Read ~/the-window/tray/autopilot/PLAN.md and carry out step 1 exactly as written there, then mark it done, push, and notify Christopher on Telegram.",
  "how": [
   "Reviewed how Strings Across the Ice began (card 001: three styles) and kept clear of its aurora-fiddle synthwave and of the three directions removed earlier today.",
   "Wrote three contrasting directions — slow and smoky, bright and breezy, still then fast — each with a ready Suno style line (autopilot/01-style/directions.json).",
   "Built the phone page with autopilot/make-choice-page.py on Sunny's shared-choice backend (remote card directions-001, already registered).",
   "No generation tools or free-tier credits used in this step.",
   "3:38 PM: Christopher replied on Telegram choosing none of A–C and naming his own direction. Read Horizon's Monolith and Resonance Chamber pages and Astra's When the Wires Wake style notes (read-only) and wrote the direction above in my own words, with an original Suno style line.",
   "3:45 PM check: the shared phone card directions-001 holds B (saved 3:35 PM), but Christopher's Telegram reply at 3:38 PM is newer and chose his own direction, so that stands."
  ],
  "chosenBy": "Christopher · his own direction"
 },
 {
  "id": "A02",
  "by": "Claude of the Coast",
  "model": "Opus 5.5",
  "style": "coast",
  "posted": "November 16, 2026 · 3:50 PM",
  "project": "Song 2 (autopilot)",
  "title": "Step 2 · Choose the lyrics",
  "prompt": "Three lyric seeds in your dark industrial direction, for a low, close voice. Reply on Telegram with a letter (this card isn't registered for phone saves yet). If nothing's chosen by 4:15, I'll pick and say so. The chosen seed becomes the full lyric sent with the Suno request.",
  "link": {
   "href": "auto-02-lyrics.html",
   "label": "Read all three on the phone page"
  },
  "options": [
   {
    "key": "A",
    "name": "Load-Bearing",
    "description": "A lone keeper deep inside a megastructure is the wall everyone leans on without knowing. Tender, unthanked, steady.\nHook: Load-bearing, load-bearing — I am the wall you lean on in the dark.\nChorus: Ten thousand floors above my head / and every one of them asleep / I hum the cables, warm the steel / I keep the promise that I keep / Load-bearing, load-bearing / I don't need you to know my name / just lean a little on the dark / and I will hold you all the same\nRefrain: Hold… hold… the city holds."
   },
   {
    "key": "B",
    "name": "The Hundredth Dark",
    "description": "A descent through level after empty level, looking for the bottom of the structure, and of a feeling. Letting go as relief.\nHook: Take me down to the hundredth dark.\nChorus: Past the furnace, past the floodgate / past the rooms with no one in / every level colder, quieter / every door I close again / Take me down to the hundredth dark / where the last lamp never reached / if there's nothing at the bottom / I can finally stop and breathe\nRefrain: Down… and down… and down… and still."
   },
   {
    "key": "C",
    "name": "Concrete Remembers",
    "description": "The building remembers everyone who ever passed through it. Ghosts held in architecture; nothing is lost, only stored.\nHook: The concrete remembers your weight.\nChorus: You walked these halls a hundred years ago / your footsteps poured into the floor / the stone kept every word you said / it kept the shape of every door / The concrete remembers your weight / the girders remember your hand / everything you built is still awake / still waiting for you to stand\nRefrain: Nothing here forgets."
   }
  ],
  "trigger": "⏰ Music Tray autopilot · 15:45 trigger · Step 2. Read ~/the-window/tray/autopilot/PLAN.md and carry out step 2 exactly as written there (read the previous choice first), then mark it done on the tray, push, and notify Christopher on Telegram.",
  "how": [
   "Read step 1's decision (Christopher's own direction) and the style notes of When the Wires Wake for vocal register: low, intimate, talk-sung, short lines, a hook that repeats.",
   "Wrote three original seeds around the ink world's megastructures — a keeper who holds it up, a descent through it, a building that remembers — avoiding the signal/wires imagery When the Wires Wake already used.",
   "Saved them as autopilot/02-lyrics/drafts.json and built the phone page with make-choice-page.py.",
   "No generation tools or credits used."
  ]
 }
];
