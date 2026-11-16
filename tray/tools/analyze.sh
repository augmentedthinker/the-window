#!/bin/bash
# Music Tray song analysis: music features, cues, and a browser bundle. (Lyrics are a separate step, not here.)
#   tray/tools/analyze.sh <audio> <out dir> ["Song title · Take B"]
# Needs only python3, numpy and ffmpeg. See tools/README.md. Music Tray, November 16, 2026.
set -e
AUDIO=$(realpath "$1"); OUT="$2"; TITLE="$3"
HERE=$(dirname "$(realpath "$0")"); TRAY=$(dirname "$HERE")
mkdir -p "$OUT"; OUT=$(realpath "$OUT")
echo "== 1. music features"; python3 "$HERE/analyze-song.py" "$AUDIO" "$OUT"
echo "== 2. cues";           python3 "$HERE/song-cues.py" "$OUT"
echo "== 3. bundle";         python3 "$HERE/song-bundle.py" "$OUT" "$(realpath --relative-to="$TRAY" "$AUDIO")" "$TITLE"
