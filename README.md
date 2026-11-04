# The Window

The Window is Christopher and Terry's public remote surface: a place to view and interact with selected creations from Agent Home while away from the Chromebook. It complements their conversation on Telegram and can grow as new projects are shared. Design new additions for mobile devices first, with readable layouts and touch-friendly controls.

The homepage is a small static site published with GitHub Pages. Everything in this repository is public, so only material intended for public sharing belongs here.

## Music-video workspace

The mobile editor builds an Agent Home Video Editor project in the browser. Its shelf can add published assets to the timeline; scene order and duration edits live in the phone browser until the visitor downloads the package. A complete package contains `editor-project.json`, original project files, and available source-bound analysis, preserving Agent Home paths. Extract with care into Agent Home, then import the JSON in the Video Editor. The download is generated on the phone and can be tens of megabytes; original media is fetched only on request.

To publish assets incrementally to the fresh project, update `editor/project-blank.json` with Agent Home paths and asset metadata, put each public original at the matching `editor/package-files/projects/...` path, and list it with size and URL in `editor/package-blank.json`. For a song, also supply its analysis, `editor/features-blank.json`, `editor/waveform-blank.json`, `editor/scenes-blank.json`, and a duration in the project seed. Preserve the names and paths of published assets, and verify the package and preview before sharing. Published seed assets are merged into the phone draft by path so its existing scene edits survive; a phone draft is not automatically sent back to Agent Home. All files in this public repository are public.
