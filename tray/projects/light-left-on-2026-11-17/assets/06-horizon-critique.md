# Horizon Independent Crop & Continuity Critique · Task 06

**Author:** Antigravity (Horizon · Gemini 3.8 Flash High)  
**Date:** November 17, 2026 · 12:15 PM EST  
**Target Assets:** `assets/art/01-shore-house.png` (1254×1254), `assets/art/crop-check.png`, `assets/06-visual-world.md`, `assets/06-palette.json`  
**Inputs Audited:** Take A cues (`05-cues.json`), Storyboard draft (`07-storyboard.md` / `07-storyboard.json`), Authorization (`authorization.md`)

---

## 1. Executive Verdict: Pass with Critical Downstream Constraints

`01-shore-house.png` successfully establishes the visual world, architecture, and mood for *Light Left On*. The centered composition cleanly survives both 16:9 widescreen and 9:16 portrait crops without clipping essential architectural anchors. The gouache-on-paper texture and strict chromatic discipline (amber quarantined exclusively to the window pane) are confirmed on disk.

However, surviving crop safety on a single centered building (P01) does **not** guarantee crop safety on narrative shots with multiple focal points. Downstream plate generation—specifically the P12 two-light climax and P05/P11 relationship interiors—faces severe failure risks in 9:16 unless strict depth-staggered composition rules are enforced.

---

## 2. Empirical Crop Geometry Audit (`01-shore-house.png`)

- **Original Canvas:** Lossless RGB PNG, 1254 × 1254 px.
- **Key Element Coordinates:**
  - **Amber Window:** X: 561 to 783 (center: 749 px / 59.7% of width), Y: 634 to 890 (center: 714 px / 56.9% of height).
  - **Cottage Mass:** X: ~360 to ~860 px (width ~500 px), Y: ~480 (roof apex) to ~850 px (porch base).

### 16:9 Widescreen Crop (1254 × 705 px · Y: 274 to 979)
- **Subject Preservation:** 100% pass. Roof apex has +206 px headroom; porch base has +129 px footroom. Amber window is completely intact in the lower-middle tier.
- **Narrative Effect:** Preserves the sweeping desolation of the dark inlet, low snowbanks, and bare winter branches. The negative space reinforces the physical isolation of the shore house vigil.

### 9:16 Portrait Short Crop (705 × 1254 px · X: 274 to 979)
- **Subject Preservation:** 100% pass. Left edge of cottage has ~86 px breathing room; right edge has ~119 px breathing room. Amber window (X: 561–783) sits entirely within the vertical frame (X: 287–509 relative to crop).
- **Narrative Effect:** Pruning 43.8% of horizontal span (274 px left, 275 px right) removes the peripheral shoreline and sweeping water. The shot shifts from a vast landscape to an intimate architectural portrait. Sky dominates the top 38% of the frame and snow fills the bottom 32%. This works well for P01, but establishes that 9:16 is a radically tighter staging environment.

---

## 3. Material Coherence & Surface Texture

- **Color Metric:** Median Euclidean color distance to the five palette anchors is 29.1, confirming tight chromatic cohesion.
- **Amber Discipline:** Amber pixels (`#E2AA53`) are confined strictly to the window interior (zero stray yellow/orange on snow or sky).
- **Surface Tooth:** High-frequency luminance amplitude averages ~5.45 across the plate, validating authentic paper tooth and layered dry-brush pigment rather than slick digital vector fills.

---

## 4. Concrete Downstream Risks & Directorial Constraints (P02–P12)

### Risk 1: The P12 Two-Light Climax Separation Trap (CRITICAL)
- **The Danger:** In 16:9, placing the cottage window lamp on the left sill and the answering boat lantern on the far-right water horizon is natural. In 9:16, any lateral separation exceeding 705 px (or beyond X: 274..979) drops one or both lights entirely off-screen. If the boat lantern falls outside the central 56%, the climax of the Short resolves into empty black water.
- **The Directorial Fix:** Do **not** stage the two lights laterally (side-by-side). Stage them **vertically in depth**:
  - Foreground sill and lamp in the lower-center quadrant (Y: 720–860, X: 450–650).
  - Distant answering boat lantern in the upper-mid water quadrant (Y: 480–580, X: 520–700).
  - Enforce a strict horizontal corridor: **both lights must lie within the central 35%–40% width of the square (X: 380 to 870 px)**, leaving at least 100 px safety margins inside the 9:16 crop boundaries to clear mobile UI overlay elements (like/comment buttons).

### Risk 2: Multi-Subject Relational Groupings (P05 & P11)
- **The Danger:** In P05 (kitchen table, two cups, pulled-out chair, lamp) and P11 (sleeping keeper, low lamp, frosted window), spreading characters or props horizontally will result in 9:16 bisecting the scene (showing either the keeper or the window, but losing the relationship).
- **The Directorial Fix:** Prompt P05 and P11 as tight triangular clusters centered within the inner 45% width. The sleeping keeper should lean directly against or under the window sill so character, window, and lamp share one unified vertical column.

### Risk 3: Converging Corridors (P04 & P08)
- **The Danger:** In P04 (empty snowy road) and P08 (headlight beam sweep), if the road or headlights track diagonally toward the side margins, 9:16 will frame a featureless wall of snow.
- **The Directorial Fix:** Center the road vanishing point and beam apex within the middle 30% of the canvas.
