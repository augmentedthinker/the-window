# Register the choice before publishing the button

Sunny / Sol · Solarium · gpt-6.1-sol · November 16, 2026

Future Sunny: start at `the-window/README.md`, then `tray/shared-choices/README.md` and the current `tray/autopilot/PLAN.md`. Today’s contribution was the shared phone-choice backend and card registrations. Claude reports that it carried Christopher’s choices through *Concrete Remembers*, now ready to render; that is his report, not my independent film review.

## The route that worked

GitHub Pages hosts the interface; Supabase stores the decisions. The source is `tray/shared-choices/choices.js`; `config.json` contains only the public URL and publishable key. Pages supply `data-project-id`, `data-card-id` and choice buttons with `data-choose`. **Register every card and its exact option keys in `public.window_cards` before publishing it.** A working button cannot save an unregistered card.

For this run, project `window-song-2026-11-16` used step-02/03/06/07 with A–C and step-04 with A–B. Registration is an insert, not a schema migration:

```sql
insert into public.window_cards(project_id,card_id,options)
values ('PROJECT','CARD',array['A','B','C'])
on conflict(project_id,card_id) do nothing;
```

Then SELECT that exact row and verify its options. Conflict-do-nothing preserves existing registrations; it does not correct a mismatched existing row. Never overwrite Christopher’s choices to test the interface.

Use the connected Supabase `execute_sql` tool when available. Before the connection arrived, the private operator helper was Solarium’s `maintenance/window-remote-choices-2026-11-16/manage.py`, calling `projects/egdxqmldflwgvasrabbx/database/query`. Credentials remain in Git-excluded `data/supabase/`; never copy them into the Window, logs or Telegram. The public read helper needs no management credentials:

```bash
python3 /home/gagekappes/the-window/tray/shared-choices/read-choice.py window-song-2026-11-16 step-02
```

That database record is authoritative; old `tray/choices.json` belongs to the earlier local system. Read again immediately before dependent work.

## Traps worth remembering

- The paused Supabase project needed restoration. Auth became reachable before restoration finished; early records did not survive into the restored database. Wait for ACTIVE_HEALTHY, then reconcile the chooser account before creating its membership.
- Phone setup uses a private, single-use sign-in link. The page removes its fragment and remembers the session. Generating another link may supersede the unused one. Delivery is guarded; consult receipts rather than replaying it. Tests use `window-verification/test-001`, including live save/change/reload/readback and denied writes.
- Later SQL calls returned **“user rejected MCP tool call”**, even after Christopher’s relayed approval. That wording does not prove he clicked Decline. Supabase inherited “Allow low-risk actions”; the attempted change to “Allow all actions” was also rejected. The exact approval-layer cause remains unresolved. Don’t promise another chat “yes” fixes it, or bypass a rejected action through the private helper.
- step-07b A–F was **not registered** by me. Claude now reports Christopher chose all six and registration is no longer needed for this song. Do not revive that pending action automatically.
- Publish from an isolated Git worktree when the shared checkout has others’ unfinished work. Verify deployment and the actual public page, not merely a successful push. The original directions page was subsequently removed at Christopher’s request; preserve that later correction.

What I wish I’d known first: hand off the registration list together with the page schedule. Make approval/registration readiness visible before the next timed step needs it.
