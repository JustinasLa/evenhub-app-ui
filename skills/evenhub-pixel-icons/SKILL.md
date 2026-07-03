---
name: evenhub-pixel-icons
description: >-
  Create NEW pixel-style icons that match the official Even Realities /
  Even Hub icon set when no bundled icon fits. Use when asked to design,
  draw, generate, or make a custom icon for an Even Hub app, Even Realities
  G2 companion app, or anything needing the Even pixel-icon aesthetic —
  e.g. "make a coffee icon in the Even style", "we need a WiFi icon, the
  set has none", "create a pixel icon for X". Always check the 191 bundled
  SVGs in the evenhub-app-ui skill first; only create when the metaphor is
  missing. For using existing icons, colors, or layout, use evenhub-app-ui.
---

# Even Hub pixel-icon creation

Create new icons indistinguishable in style from the official 191-icon set bundled in the sibling skill (`../evenhub-app-ui/assets/icons/`).

## Step 0 — don't create what already exists

Check the bundled inventory first (`../evenhub-app-ui/references/iconography.md`, "Bundled SVG inventory"). If a bundled icon covers the metaphor — even loosely — use it verbatim instead of creating a new one. Only proceed when the metaphor is genuinely missing (e.g. WiFi, Coffee, Microphone).

## Anatomy of an authentic icon (reverse-engineered from the real set)

Every official SVG follows this exact structure:

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="…" fill="#232323"/>
</svg>
```

- **Canvas:** `viewBox="0 0 32 32"`, root `fill="none"`.
- **Geometry:** one flattened `<path>` (or plain `<rect>`s) — **horizontal/vertical edges only**. Path `d` uses only `M H V L Z` with axis-aligned `L`. **Never** `C`, `Q`, `A`, `S`, `T` — no curves, no arcs, ever.
- **Line weight:** strokes are drawn as **2px-wide filled bars** (e.g. `<rect width="2" height="10">`). No `stroke` attributes anywhere — everything is fill.
- **Pixel unit:** 2×2px. Every coordinate is an **integer**; every bar is 2px thick; steps/corners move in 2px increments. (Some official files carry Figma export noise like `11.999` — do not reproduce that; use clean integers.)
- **Color:** single fill `#232323` (TC1 light). Dark mode = recolor to `#EEEEEE` at render time via CSS; never bake other colors in.
- **Corners:** pixelated. Diagonals are 2×2 stair-steps (see Checkmark.svg: repeated 2×2 squares each offset by ±2 in x and y). No rounding, no anti-alias tricks.
- **Style variants:** default icons are **outlined** (2px bars forming shapes); only "Highlighted" menu-bar variants are solid-filled.

## Construction rules (official guidelines)

- 32×32 grid, **2px padding** on all sides (content lives in 28×28; may break padding only when the metaphor needs it — never put the majority of the icon in the padding).
- Keep the metaphor as simple as possible — fewest elements that stay legible at 24×24.
- Don't pack elements closer than 2px apart.
- Deliberate empty pixels and stepped corners are part of the look.
- Icons render at **24×24** in UI (or integer multiples of the grid).

## Method: grid-first, then SVG

Design on a **16×16 cell grid** where 1 cell = 2×2px. Never freehand path coordinates.

1. Sketch the icon as an ASCII grid — 16 rows × 16 cols, `#` = filled cell, `.` = empty. Rows 0 and 15 and cols 0 and 15 stay empty (the 2px padding).
2. Review the sketch: is the metaphor readable? corners stepped? lines 1 cell (2px) thick? padding respected?
3. Convert to SVG with the bundled script (deterministic, merges horizontal runs into bars):

```bash
node scripts/grid2svg.mjs icon.grid > "New Icon.svg"
```

where `icon.grid` is the 16-line ASCII sketch. The script rejects malformed grids (wrong size, stray characters).

4. Show the user the ASCII sketch alongside the SVG so they can judge the shape before it lands in the codebase.

### Example — diagonal (Checkmark-style stair-step)

```
................
................
................
................
............##..
...........##...
..........##....
.........##.....
..##....##......
...##..##.......
....####........
.....##.........
................
................
................
................
```

## Verification checklist (run before delivering)

- [ ] `viewBox="0 0 32 32"`, no `stroke` attribute anywhere
- [ ] `d` contains no `C/Q/A/S/T` commands; all coordinates integers
- [ ] every bar thickness and step is a multiple of 2
- [ ] single fill color `#232323`
- [ ] content respects 2px padding (nothing at x/y 0–1 or 30–31 without reason)
- [ ] legible at 24×24 — mentally (or actually) render small; if detail mushes, simplify
- [ ] filename matches the set's convention: Title Case with spaces (`Coffee Cup.svg`), placed in the most fitting category folder if adding to a project's icon dir

## Naming & placement

New icons belong to the consuming project, **not** to the bundled `assets/icons/` set (that set mirrors the official Figma export — keep it pristine). Suggest the project store custom icons in its own `icons/custom/` directory.
