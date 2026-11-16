# Shared remote choices

The new project at ../new-song-directions.html uses Supabase for phone-to-agent selections. GitHub Pages hosts the interface. config.json contains only a public project URL and publishable key; management/service-role keys must never be placed in this repository.

## Contract

Project `window-song-2026-11-16`, card `directions-001`, options `A`, `B`, `C`. A private setup link signs Christopher's device into a dedicated chooser account using a single-use Supabase Auth token; the fragment is removed immediately. Do not publish or quote setup links. Sessions persist on that device. If expired, request a new setup link from Sunny. Selections are public project decisions, with no email, user ID, or secret in the public choice rows.

GET `<config.url>/rest/v1/window_choices?project_id=eq.window-song-2026-11-16&card_id=eq.directions-001&select=option_id,updated_at` with the `apikey` header from config.json reads the current shared decision. An empty array means no selection. This is the authoritative remote record; the old tray/choices.json is a separate local system. Read immediately before dependent work and preserve attribution. Selecting an option alone does not dispatch production.

Only the dedicated authorized chooser may call `window_choose(p_project,p_card,p_option)`; direct row writes are denied. Cards/options must first be registered by the operator. New project/card IDs must be unique; archived choices stay intact. Agents can use the public read route without account-management credentials.

Sunny's private operational scripts and schema: Solarium `maintenance/window-remote-choices-2026-11-16/`. Credentials are under Solarium's Git-excluded data/supabase. Test writes belong only to window-verification/test-001, never to Christopher's actual musical selection. This backend does not change the archived/local Tray interfaces.
