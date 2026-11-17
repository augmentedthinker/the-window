# Concrete Remembers · Final Film Render

**Rendered by**: Antigravity (Horizon)  
**Date**: November 16, 2026, 7:26 PM EST  
**Project**: Coast Video Editor `concrete-remembers` (`~/coast/public/music/editor/projects/concrete-remembers.json`)  
**Input Cut**: Step 11 Final Edit (51 scenes, 229.1s)  
**Job ID**: `2026-11-17T00-18-59`  
**Output Destination**: `~/the-window/tray/video/concrete-remembers-final.mp4`  

---

## 1. How It Was Rendered

- **Trigger Method**: POST request to `http://127.0.0.1:8850/api/editor/renders` wrapping `concrete-remembers.json` (`{ project: ... }`).
- **Execution Architecture**: Handled by Coast’s backend service via systemd transient unit `coast-editor-render-2026-11-17T00-18-59.service` executing `film.py`.
- **Workers**: 2 parallel video chunk processes + 2 FFmpeg encoders rendering raw RGB24 frames to 1280×720 H.264 video parts, followed by automated FFmpeg `assemble-to` concatenation and AAC stereo audio multiplexing.

---

## 2. Performance & Resource Receipts

- **Wall Clock Time**: 7 minutes 13 seconds (433.5s total job span from POST dispatch at 19:18:59 to completion at 19:26:12; 417s internal render loop).
- **Peak Memory**: 1.37 GB (well within the systemd transient unit's 2.0 GB memory cap).
- **System Memory**: System free memory remained healthy throughout, hovering between 1.25 GB and 1.44 GB available with zero swap pressure.
- **Output File Size**: 141.80 MB (148,688,574 bytes).

---

## 3. Verification & Directorial Integrity Checks

Executed automated forensic validation via `ffprobe`, `ffmpeg`, and Pillow:

- **Stream Parameters**:
  - Container: MP4 (`mov,mp4,m4a,3gp,3g2,mj2`)
  - Video: H.264 High Profile, 1280×720 progressive, 30.0 fps
  - Audio: AAC stereo, 48,000 Hz
  - Bitrate: 5,192.9 kbps
  - Duration: 229.07s (matching Take B's 229.1s endpoint precisely with zero audio/video drift)
- **Keyframe Sample Inspections**:
  - `5.0s (Plate 01 · Lantern)`: Caretaker's hand holding swinging ember lantern in gallery darkness (dynamic range: [0, 255]).
  - `20.0s (Plate 02 · Gate)`: Caretaker unlocking colossal lower iron gate (dynamic range: [0, 255]).
  - `40.0s (Plate 03 · Gallery)`: Corridor of frozen silhouettes in doorways (dynamic range: [0, 255]).
  - `65.0s (Plate 04 · Pumps)`: Massive high-pressure conduits and machinery (dynamic range: [0, 255]).
  - `90.0s (Plate 05 · Floors)`: Cutaway of brutalist floors holding frozen moments (dynamic range: [7, 254]).
  - `115.0s (Plate 06 · Breathing)`: Narrow walkway braced against megastructure walls (dynamic range: [0, 255]).
  - `130.0s (Plate 07 · Elevator)`: Open elevator shaft in concrete corridor (dynamic range: [0, 255]).
  - `150.0s (Plate 08 · Turning)`: Silhouettes oriented toward the orange lantern (dynamic range: [0, 255]).
  - `170.0s (Plate 09 · Rooftop)`: Rooftop contemplation overlooking the ink megacity (dynamic range: [0, 255]).
  - `195.0s (Plate 10 · Handoff)`: Intimate lantern exchange on the staircase without visual stutter (dynamic range: [0, 255]).
  - `212.0s (Loudest Sub-Bass Peak)`: Concrete loudspeaker cone cleanly absorbing peak sub-bass energy (dynamic range: [0, 255]).
  - `225.0s (Plate 11 · Departure)`: Pan-left framing preserves the old keeper in shadow on screen-left (`x < 0.25`, density 0.318) while the newcomer recedes down the gallery with the lantern (dynamic range: [0, 255]).
- **Defects Found**: None. Zero pure black frames, zero audio dropouts, zero missing stills, and zero frozen visualizer clips.

---

## 4. Distribution Sovereignty

The master film has been copied to `~/the-window/tray/video/concrete-remembers-final.mp4`.  
In accordance with Christopher's explicit instructions, **the video has not been published or uploaded to YouTube or any public platform**. It is staged for Claude to post the Tray card and GitHub archive.
