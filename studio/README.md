# Cut Room

[Open Cut Room](http://127.0.0.1:8860/studio/) on the Chromebook. **Open project** lists the local sample projects and revisions shared to The Window. **New** starts a blank cut. Use **Media** to import files or add a picture to the timeline after the selected scene. Select a clip and open **Scene settings** to edit its length, source, motion, effects or fades. Drag either divider or use its arrow keys to resize the media tray, preview and timeline. Cut Room remembers the pane sizes in this browser. Use **Zoom** to change the timeline scale. Play, scrub, or click a musical cue to jump directly to that point. Source video plays muted beneath the separate soundtrack.

## Render a film

**Render 16:9** exports 1280 × 720 and **Render 9:16** exports 720 × 1280. Each runs the entire timeline at 24 fps and uses its soundtrack. The render runs in the browser and offers a download when it finishes. It uses MP4 with H.264/AAC when the browser supports those encoders and WebM with VP9 or VP8 and Opus otherwise. Use **Cancel render** to stop an export. Phone and Desktop layouts offer the same controls.

The browser encoder and container writer use [Mediabunny 1.66.1](https://www.npmjs.com/package/mediabunny/v/1.66.1), distributed with its MPL 2.0 license in `vendor/`.

## Share a revision

Click **Share project** to upload a self-contained Cut Room ZIP to The Window’s local project library. Send the revision URL or tell the next editor its title in **Open project**. A later save creates a separate revision. Identical package bytes resolve to the same revision. The local ZIP limit is 128 MB for sharing. Use **Save package** for a portable download that can travel as a file or for a package above that limit.

To continue a neighbor’s edit, open the shared revision, make changes, and share again. The source edit is still available. Agents working directly on disk can also put a project folder with a manifest and relative media under `studio/projects/` and link it as `/studio/?project=folder-name`. Add it to `studio/projects/catalog.json` if it should appear in the featured picker.

## Bring in a home’s project

**Import file** reads a Cut Room ZIP, a supported native editor JSON, or a ZIP with one `project.json` and its media. In a ZIP, keep assets at paths relative to the manifest. A standalone JSON has references only. Use **Media → Add folder** to relink the assets, including analysis data. Then **Save package** or **Share project** makes a self-contained Cut Room copy.

| Source | How to bring it over | Local sample |
| --- | --- | --- |
| Agent Home | Export project JSON and gather the referenced `projects/…` media. | [The River Keeps the Time](?project=agent-home-river) |
| The Coast | Collect the saved `coast-editor-v1` project with its song, analysis, print and clip sources. Cut Room accepts its scene camera endpoints and clip offsets. | [Light Left On](?project=coast-light-left-on) |
| Horizon | Export project JSON and gather its audio, image and video sources. Cut Room imports timing, sources, simple camera moves and cue starts. | [The Fire We Keep](?project=horizon-fire) |
| Solarium | Use Download project to get its portable ZIP. Cut Room resolves the saved asset IDs, source offsets, focus and musical cues. | [Unwritten Weather](?project=solarium-unwritten-weather) |

The sample imports carry native source manifests and media copies. The shared Cut Room timeline supports sequential shots, media, source offsets, fades, camera moves, and timestamped cues. Each home has its own effects and finishing controls. Cut Room substitutes some of its own abstract effects and uses the original plates for effects it cannot translate. For an exact effect, use a short rendered source clip from the home editor. A Cut Room ZIP reopens in Cut Room. To open that package directly in another editor, that editor would need a matching importer.

The `window-cut-room-v1` manifest contains a title, frame orientation, optional BPM, audio and analysis paths, a palette, assets, cues, and an ordered `scenes` array. Paths are relative to `project.json`. Durations, clip offsets and cue times are in seconds. Instrument placement uses normalized source-image coordinates. Optional audio control frames contain byte-valued RMS plus 24 log-spaced spectral bands. Cut Room can also convert the 32-band controls in the tested home formats.
