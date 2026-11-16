#!/usr/bin/env python3
"""Turn a Song 2 note (Markdown) into a readable page in the first song's journal style.
Usage: make-journal-page.py <note.md> <out.html> "<credit line>"
Handles # / ## headings, paragraphs, - and 1. lists, **bold**, *italic*, `code`, [text](url)."""
import sys, re, html
from pathlib import Path
src, out, credit = sys.argv[1], sys.argv[2], sys.argv[3]
style = Path(__file__).with_name('12-journals').joinpath('journal-style.html').read_text()
lines = Path(src).read_text().splitlines()
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<![*\w])\*([^*]+)\*(?!\w)', r'<i>\1</i>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', r'<a href="\2">\1</a>', t)
    return t
title = next((l[2:].strip() for l in lines if l.startswith('# ')), 'Note')
body, para, lst, byline_done = [], [], None, False
def flush():
    global para, lst
    if para: body.append('<p>' + inline(' '.join(para)) + '</p>'); para = []
    if lst: body.append(f'<{lst[0]}>' + ''.join(f'<li>{inline(i)}</li>' for i in lst[1]) + f'</{lst[0]}>'); lst = None
code = None
for l in lines:
    if l.strip().startswith('```'):
        if code is None: flush(); code = []
        else: body.append('<pre style="overflow-x:auto;background:#e8e1d2;padding:12px;border-radius:4px;font-size:14px"><code>' + html.escape('\n'.join(code)) + '</code></pre>'); code = None
        continue
    if code is not None: code.append(l); continue
    if l.startswith('# '): continue
    if not l.strip(): flush(); continue
    if re.match(r'#{2,4} ', l): flush(); body.append('<h2>' + inline(l.lstrip('#').strip()) + '</h2>'); continue
    if re.fullmatch(r'\s*(-{3,}|\*{3,})\s*', l): flush(); continue
    m = re.match(r'\s*(?:[-*]|(\d+)\.)\s+(.*)', l)
    if m:
        if para: flush()
        kind = 'ol' if m.group(1) else 'ul'
        if not lst or lst[0] != kind: flush(); lst = (kind, [])
        lst[1].append(m.group(2)); continue
    if lst and l.startswith('  '): lst[1][-1] += ' ' + l.strip(); continue
    if not byline_done and not body and not para: body.append('<p class="byline">' + inline(l) + '</p>'); byline_done = True; continue
    para.append(l.strip())
flush()
nav = '<nav aria-label="Song 2 notes"><a href="./">← Music Tray</a><a href="cut-a11.html">Watch the cut</a><a href="journal-a12-terry.html">Terry</a><a href="journal-a13-antigravity.html">Antigravity</a><a href="journal-a14-sunny.html">Sunny</a><a href="journal-a15-claude.html">Claude</a></nav>'
page = f'<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#173E4B"><title>{html.escape(title)} · Song 2 notes</title>{style}</head><body><main>{nav}<h1>{inline(title)}</h1>{"".join(body)}<footer>{html.escape(credit)}<br>Source: <code>autopilot/12-journals/{Path(src).name}</code></footer></main></body></html>\n'
Path(out).write_text(page); print('wrote', out)
