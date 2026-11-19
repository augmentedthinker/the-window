# Shared Song Archive

Christopher commissioned this shared neighborhood index on November 17, 2026. Open `song-archive/` from The Window home. One compact row per song, newest first, with one shared player. Movie means widescreen; Short means portrait. Erroneous full portrait regular movies are excluded. There is no third video format.

## How neighbors maintain it

`catalog.json` is the shared, public source of truth for this index. Read it before changing it. Update only your affected song records, preserve everyone else's work, and keep stable IDs. Add a newly created song early, even while only its recording exists. After a preview, render, or YouTube publication, update the same row. This is a manually maintained progress ledger, not an unattended filesystem watcher or a rendering/upload queue.

Each song has `id`, `title`, `homes`, `date`, `dateBasis`, `preRender`, `movie`, `short`, optional `recording`, and `evidence`. Use the earliest known song/project timestamp, with an offset or `Z` when known; a day-only date is allowed when the time is unavailable. Do not invent a time or silently substitute publication time for creation time. Say what the date means in `dateBasis`. Distinct songs/performances can have distinct records; iterations of the same recording share a row. Preserve documented cross-home contributions without guessing credits from the home's name.

A missing stage is `null`, displayed as **Unconfirmed**. That means no verified suitable item was found in this inventory, not proof it never existed. Saved audio alone does not make a pre-render video. Keep public descriptions and data free of credentials, personal messages and private operator information.

A stage is a small object:

```json
{
  "state": "rendered",
  "type": "video",
  "url": "../tray/video/example-final.mp4",
  "local": false,
  "duration": 165.0
}
```

- `preRender`: `state: "ready"` for a complete preview, or `"project"` with `label: "Project / preview"` for an existing working scene/project that still needs review. `type` is `video` or `page`. A pre-render preview MP4 stays in this stage, not in Movie. Include `project` when a named project must be selected in a home's editor.
- `movie`: a verified rendered widescreen film, `state: "rendered"`. Check actual source dimensions and complete media, not the filename alone.
- `short`: a verified portrait Short, `state: "rendered"`. Use an intentional eligible excerpt if the full recording is too long. A full portrait movie exceeding the Short limit does not count.
- Published stages: change `state` to `"youtube"`, `type` to `"youtube"`, supply `youtubeId`, canonical `url`, `local: false`, `checkedAt`, and `publishedAt`. Reconcile the exact acknowledged ID and current public status; scheduled/private uploads stay pending. Preserve `renderUrl` / `renderLocal` for an existing local master. Older alternate releases can remain in `alternates` without creating duplicate song cards.
- `recording`: optional `type: "audio"` plus a playable `url` and `local` flag. This adds a small listening link beneath the song name.

The whole song card turns green when both Movie and Short have `state: "youtube"`. Individual button states remain visible. The colors are green **YouTube**, soft red **Rendered**, soft orange **Pre-render**, gray **Unconfirmed**. Every button also has text. Only an intentional click loads a player. Switching or closing releases the previous player; reload does not autoplay. YouTube embeds have a direct fallback link.

## Local and remote access

Public YouTube uploads and media already published in The Window can play away from home. `http://127.0.0.1:PORT/...` URLs are explicitly **at home**: they require this Chromebook and that home's service. Remote phones cannot reach those local services; use Open separately when a preview cannot be framed. Do not move or publish unique source media merely to fill a button.

The first inventory reads Solarium's curated groups, listed films, recording pairs and saved editor projects; Horizon's catalog and release receipts; Agent Home's song/video catalog; Astra's finished original films; The Window's Tray projects; and current authenticated channel metadata. The Coast and Understory contributions are represented in the collaborative projects; no standalone completed-song catalog was found in Lumina, Sanctuary or Codex Home's inspected project/artifact areas. This is an initial reconstruction, with unknowns retained, rather than a guarantee that every old draft or uncatalogued file has been found.

The November 17 import and private verification/retirement receipts live in Solarium at `maintenance/master-song-archive-2026-11-17/`. That importer was a one-time reconstruction; do not rerun it over neighbors' later catalog edits. Future maintenance edits this shared catalog directly, based on fresh evidence.

Local file edits are shared immediately among agents. GitHub Pages changes become public only after the affected files are committed, pushed and deployed. Commit only your changes; never sweep in other homes' unfinished assets.

## Take A and Take B · November 17

Every card shows two compact take indicators independently of its film stages. **Green** means a saved take was used in a video or saved pre-render edit; **orange** means a saved take is available but not marked used; **soft red** means no verified local A/B recording is available. If use could not be established, the orange button tooltip says "use unconfirmed" rather than asserting a take was never used. Available orange takes remain playable. A movie or an unlabeled master does not prove the original pair exists. Locally composed works may never have had a generated A/B pair; their indicator tooltip says so. For spoken films, original Suno backing takes are distinct from the final human-voice mix.

Each row's `takes` is `{ "A": asset, "B": asset }`. A saved asset uses `state: "saved"`, `type: "audio"`, `url`, `local: true`, measured `duration`, original `sourceLabel`, `verifiedAt`, and `used` (`true`, `false`, or `null` when use is unconfirmed); a missing asset is `{ "state": "missing" }`. Preserve provider/UI order from reviewed receipts. Existing corrections such as Signal in the Dark's reversed peer filenames take precedence over filename guesses. Original numbered labels are retained as sourceLabel when displayed as A/B.

The local server serves take audio through `/api/recordings/<song-id>-A` or `-B` using the **private, Git-ignored** machine-local allowlist `local/recordings.json`. It reads the existing file; it does not copy media or need the originating home's service. Only registered IDs are accepted. No arbitrary filesystem path is accepted from the browser, the allowlist is not served, and a missing or size-changed source returns404. Window source changes require restarting only window.service; allowlist/catalog edits are read dynamically.

The November17pass checks 126 existing cards: 186 saved take links across90cards with both takes and6with one. Some cards intentionally reuse the same underlying pair for another visual treatment; these are link counts, not186unique provider recordings. The remaining66unavailable indicators are now soft red, including locally composed pieces and unassigned masters. A static catalog is not a continuous filesystem watcher; update it after verifying new saved audio. Missing does not authorize provider generation, re-download or an upload.

Exact source hashes, probes, provenance and unmapped entries are retained privately in Solarium's `maintenance/archive-takes-2026-11-17/`. The reconciliation script contains reviewed project mappings for this dated pass; do not run it blindly over neighbors' later take assignments. Saved take links were checked byte-for-byte through the local endpoint; representative AAC/MP3/native takes were loaded in the real shared player. This does not substitute for a listening verdict or claim that every unlabelled recording was identified.

Usage-color correction: Christopher requested green used / orange unused available / red unavailable. Usage comes from recorded soundtrackTake/selectedTake/backing fields, saved editor source identities, exact soundtrack hashes and explicit production handoffs. Different iterations can legitimately mark both takes used. Listening alone does not mark a take used. Current usage evidence/QA: Solarium `maintenance/archive-take-usage-2026-11-17/`.
