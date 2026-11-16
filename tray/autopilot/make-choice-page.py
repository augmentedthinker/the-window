#!/usr/bin/env python3
"""Build a phone choice page (Supabase shared choices) from a step's JSON.
Usage: make-choice-page.py <step.json> <out.html> "<eyebrow>" "<title>" "<intro>"
Options need key + name; every other text field shows as a labelled paragraph
(an `image` field shows as a picture, `audio` as a player)."""
import json, sys, html
from pathlib import Path
src, out, eyebrow, title, intro = sys.argv[1:6]
d = json.loads(Path(src).read_text())
tpl = Path(__file__).with_name('choice-page-template.html').read_text()
head = tpl[:tpl.index('<body>')].replace('<title>Three directions · Music Tray</title>', f'<title>{html.escape(title)} · Music Tray</title>')
head = head.replace('</style>', '.option img{width:100%;border-radius:10px;display:block}audio{width:100%}.chooser{margin-top:.8rem}</style>')
e = html.escape
opts = []
for o in d['options']:
    body = []
    for k, v in o.items():
        if k in ('key', 'name') or not isinstance(v, str): continue
        if k == 'image': body.append(f'<img src="{e(v)}" alt="{e(o.get("imageAlt", o["name"]))}">'); continue
        if k == 'audio': body.append(f'<audio controls preload="none" src="{e(v)}"></audio>'); continue
        if k == 'imageAlt': continue
        label = 'Suno style' if k == 'suno' else k.capitalize()
        body.append(f'<p><strong>{e(label)}.</strong> {e(v)}</p>')
    opts.append(f'<article class="option" id="option-{e(o["key"])}" data-option-id="{e(o["key"])}"><div class="label">Option {e(o["key"])}</div><h2>{e(o["name"])}</h2>{"".join(body)}<div class="chooser"><button type="button" data-choose="{e(o["key"])}" aria-pressed="false">Choose {e(o["key"])}</button></div></article>')
page = f'''{head}<body><main data-project-id="{e(d['project'])}" data-card-id="{e(d['remoteCard'])}"><a href="./">← Music Tray</a><p class="eyebrow">{e(eyebrow)}</p><h1>{e(title)}</h1><p class="intro">{e(intro)}</p>
<div class="notice"><p id="choice-status" role="status" aria-live="polite">Connecting to shared choices…</p><p>Your selection is shared with the agents after saving. You can also just reply on Telegram with a letter.</p></div>
{"".join(opts)}
<footer>{e(d['by'])} · Song 2 autopilot · Card {e(d['card'])} · remote card {e(d['remoteCard'])}<br>Opening this page doesn't start anything; the next step reads your choice at its quarter hour.</footer></main><script type="module" src="shared-choices/choices.js"></script></body></html>
'''
Path(out).write_text(page)
print('wrote', out)
