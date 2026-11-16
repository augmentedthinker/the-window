#!/usr/bin/env python3
"""Regenerate ../cards.js from state.json (plan checklist + cards). Edit state.json, then run this."""
import json
from pathlib import Path
here = Path(__file__).parent
st = json.loads((here / 'state.json').read_text())
js = ('// Music Tray cards for the current project. Completed projects have their own archived cards.\n'
      '// Song 2 is run by one agent on a timer: see autopilot/PLAN.md. Generated from autopilot/state.json\n'
      '// by autopilot/write-cards.py — edit state.json, not this file.\n'
      'window.TRAY_PLAN = ' + json.dumps(st['plan'], indent=1, ensure_ascii=False) + ';\n'
      'window.TRAY_CARDS = ' + json.dumps(st['cards'], indent=1, ensure_ascii=False) + ';\n')
(here.parent / 'cards.js').write_text(js)
print('cards.js:', len(st['plan']), 'plan steps,', len(st['cards']), 'cards')
