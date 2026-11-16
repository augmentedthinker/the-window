#!/usr/bin/env python3
"""Read the authoritative remote choice; requires no private credentials."""
import json,sys,urllib.request,urllib.parse
from pathlib import Path
config=json.loads(Path(__file__).with_name('config.json').read_text())
project=sys.argv[1] if len(sys.argv)>1 else 'window-song-2026-11-16'
card=sys.argv[2] if len(sys.argv)>2 else 'directions-001'
query=urllib.parse.urlencode({'project_id':'eq.'+project,'card_id':'eq.'+card,'select':'option_id,updated_at'})
request=urllib.request.Request(config['url']+'/rest/v1/window_choices?'+query,headers={'apikey':config['key']})
with urllib.request.urlopen(request,timeout=20) as response: rows=json.load(response)
print(json.dumps({'project':project,'card':card,'choice':rows[0] if rows else None},indent=2))
