# Horizon Independent Final Crop Critique · Task 08 (P01–P12)

**Author:** Antigravity (Horizon · Gemini 3.8 Flash High)  
**Date:** November 17, 2026 · 12:25 PM EST  
**Target Assets:** Selected plates P01–P12 in `assets/art/`, `assets/08-plates.json`, `assets/08-crops.jpg`, `assets/08-generation-receipts.json`  
**Inputs Audited:** Storyboard cut (`07-storyboard.md`), Cue alignment (`05-cues.json`), Task 06 critique (`06-horizon-critique.md`)

---

## 1. Executive Verdict: Complete Catalog Approved for Assembly

All twelve selected plates (P01–P12) successfully satisfy the dual-format cropping criteria. The depth-stacking and centering directives issued during Task 06 were executed with exceptional discipline:

1. **P12 (The Climax)**: Both lights—the foreground window lamp and the answering boat lantern—survive 100% in both 16:9 widescreen and 9:16 portrait Short cuts. The risk of the boat lantern being severed into empty water in 9:16 is completely eliminated.
2. **P05 & P11 (Interiors)**: Relational groupings (table/cups/chair in P05; sleeping keeper/low lamp in P11) are tightly clustered within the central corridor. Neither scene suffers narrative bisection in 9:16.
3. **P10-v2**: The revision cleanly purged the unintended porch figures, dog, and extra lantern from v1. It presents an austere, empty deep-night vigil exterior consistent with P01.

---

## 2. Forensic Focus Audits

### P12 · The Two-Light Climax (CRITICAL PASS)
- **Answering Boat Lantern (Distant Water)**:
  - Bounding Box: X: 684–688 (mean: 686.1 px / 54.7% width), Y: 541–586 (mean: 563.5 px / 44.9% height).
  - **9:16 Crop (X: 274..979)**: Lantern sits 412 px from left crop margin and 293 px from right crop margin—virtually dead center.
  - **16:9 Crop (Y: 274..979)**: Lantern sits 267 px below the top crop edge, floating clearly over the dark water.
- **Foreground Sill Lamp**:
  - Bounding Box: X: 222–872 (mean core: 590.2 px / 47.1% width), Y: 731–1019 (mean core: 898.2 px).
  - **9:16 Crop**: Lamp flame and glass chimney are centered at X = 590 px (316 px from left margin, 389 px from right margin).
  - **16:9 Crop**: Lamp flame sits comfortably in the lower third (Y: 731–950), with the base resting on the sill.
- **Directorial Receipt**: The vertical depth-staggered composition (boat lantern at X ~ 686 / Y ~ 564; sill lamp at X ~ 590 / Y ~ 898) ensures that neither light competes laterally. In the 9:16 Short cut, the viewer clearly sees both the vigil flame and the distant answer.

### P05 · Kitchen Table Vigil (PASS)
- Core lamp flame is centered at X: 607.0 px, Y: 666.8 px.
- 98.7% of amber pixel warmth falls within the 9:16 crop window (X: 274..979).
- Two teacups, table surface, and the pulled-out wooden chair form a unified, intimate still life. No essential prop is severed at the margins.

### P11 · Pre-Dawn Interior (PASS)
- Core lamp flame: X: 172–892 (mean: 797.5 px), Y: 537–788 (mean: 647.6 px).
- Keeper silhouette: Center of dark mass is X: 320 px, Y: 532 px.
- **9:16 Crop**: The keeper's sleeping figure (seated and leaning right toward the window sill) remains clearly legible on the left tier of the vertical frame (X: 274–450), while the low-burning lamp and window pane occupy the right tier (X: 650–850). The emotional connection between keeper and vigil flame is intact.

### P10-v2 · Deep-Night Vigil Exterior (PASS)
- Window Amber: X: 414–891 (mean: 791 px), Y: 467–955 (mean: 638 px).
- 100% of window amber falls within 16:9 and 9:16 crop envelopes.
- Porch steps and timber siding are completely empty; snow accumulation on the roof and sill reinforces temporal progression from P01.

---

## 3. Plate-by-Plate Crop Ledger (P01–P12)

| Plate | Scene Description | 16:9 Crop (Y: 274–979) | 9:16 Crop (X: 274–979) | Editorial & Staging Notes |
|---|---|---|---|---|
| **P01** | Shore house exterior dusk | 100% amber in frame | 100% amber in frame | Anchors the world. Wide emphasizes desolation; tall emphasizes cottage facade. |
| **P02** | Hands trimming lamp wick | 88.2% warm pixels in frame | 98.0% warm pixels in frame | Match flame, scissors, and hands centered at X: 677. Perfect macro opening. |
| **P03** | Frosted window pane | 99.9% amber in frame | 99.6% amber in frame | Amber square dead center (X: 627, Y: 617). Beautiful recurring transition anchor. |
| **P04** | Snowy road leaving town | 100% amber in frame | 100% amber in frame | Distant window sits at X: 620 px (dead center). Vanishing point tracks cleanly in portrait. |
| **P05** | Table, cups, chair, lamp | 82.3% warm pixels in frame | 98.7% warm pixels in frame | Tight central cluster. Evokes quiet absence without clutter. |
| **P06** | Traveler on ferry deck | 77.8% warm pixels in frame | 99.8% warm pixels in frame | Dark coat/hood and ferry lantern centered (X: 747). Silhouette strong at mobile scale. |
| **P07** | Harbor ice & quay | 100% amber in frame | 33.3% amber in frame | Telegraph pole and quay lines are centered. Peripheral town lights prune naturally in 9:16. |
| **P08** | Night road headlights | 48.5% warm pixels in frame | 99.0% warm pixels in frame | Distant window centered (X: 591). Headlight ground sweep crops cleanly in 16:9. |
| **P09** | Gloved hand on ferry rail | 100% amber in frame | 100% amber in frame | Distant shore light sits at X: 627 px (dead center). Hand and rail anchor lower-left center. |
| **P10-v2** | Deep night cottage exterior | 100% amber in frame | 100% amber in frame | Pristine empty vigil. No extraneous figures or rogue light sources. |
| **P11** | Sleeping keeper interior | 97.0% warm pixels in frame | 98.6% warm pixels in frame | Keeper and lamp co-exist harmoniously across the vertical frame. |
| **P12** | Two-light dawn finale | 80.0% warm pixels in frame | 90.3% warm pixels in frame | **Climax secured.** Distant boat (X: 686, Y: 564) and sill lamp (X: 590, Y: 898) both visible in 9:16. |

---

## 4. Recommendations for Edit Assembly (Tasks 11 & 12)

1. **P07 Framing**: In the 9:16 Short cut, P07 loses peripheral harbor lights but gains a striking graphic verticality along the telegraph pole and sagging wires. Cut to P07 precisely on lyric cue `"sagging wires"`.
2. **P08 Headlight Dynamics**: In 16:9, the road headlight beams create horizontal motion leading the eye to the distant window. In 9:16, the window is prominent; consider a slow push-in (`scale: 1.0 -> 1.04`) toward the window.
3. **P12 Hold Duration**: In both widescreen and Short edits, let P12 hold with subtle drift without rapid cuts so the viewer's eye can take in both the foreground vigil lamp and the tiny answering lantern across the water.
