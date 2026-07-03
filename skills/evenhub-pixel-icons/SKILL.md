---
name: evenhub-pixel-icons
description: >-
  Create custom pixel-style SVG icons matching the official Even Realities
  Even Hub visual language when the bundled icon set has no suitable metaphor.
  Use when asked to design, draw, generate, or refine an icon for an Even Hub
  app, Even Realities G2 companion app, or the Even pixel-icon aesthetic.
  First search the 191 bundled icons in the sibling evenhub-app-ui skill; use
  that skill instead when an existing icon, UI token, or layout is sufficient.
---

# Create Even Hub pixel icons

Create new icons that belong beside the official set without altering the
official assets.

## Workflow

### 1. Reuse before drawing

Search `../evenhub-app-ui/references/iconography.md` and
`../evenhub-app-ui/assets/icons/` by name and related concepts. Use an existing
icon verbatim when its metaphor is close enough.

When no icon fits:

1. Inspect two or three official icons with similar semantics or geometry.
2. Identify the shared silhouette, density, and outline/filled treatment.
3. Choose one unmistakable metaphor and remove decorative detail.

Do not combine several weak metaphors into one busy icon.

### 2. Design on the source grid

Sketch a 16×16 ASCII grid where each cell becomes a 2×2 px block:

- `#` = filled
- `.` = empty
- Keep the outer row and column empty for the standard 2 px padding.
- Use one-cell bars and one-cell stair steps as the default visual rhythm.
- Keep separate elements at least one cell apart.
- Prefer balanced optical weight over forced geometric symmetry.

Break the outer padding only when a closely related official icon does so and
the metaphor requires the extra span.

Review the grid at its intended 24×24 display size. If a detail is unclear
there, simplify it rather than adding pixels.

### 3. Generate the SVG

Run the bundled generator by resolving it from this skill directory:

```bash
node <skill-dir>/scripts/grid2svg.mjs icon.grid --output "Icon Name.svg"
```

The generator validates grid dimensions, characters, padding, and empty input.
For a justified edge-to-edge design, pass `--allow-edge`.

Do not hand-edit generated coordinates. Revise the grid and regenerate so the
source remains reviewable and every value stays on the 2 px grid.

### 4. Present and place

Show the ASCII grid with the resulting SVG or preview. State which official
icons informed the design. If the user requests revisions, edit the grid first.

Store new work in the consuming project, normally under `icons/custom/`.
Never add custom icons to `../evenhub-app-ui/assets/icons/`; that directory is
the untouched official Figma export.

## Style constraints

- Canvas: `32×32`, `viewBox="0 0 32 32"`, displayed at `24×24`.
- Geometry: axis-aligned 2 px blocks and stepped diagonals.
- Output: filled geometry only; no `stroke`, curves, arcs, masks, or filters.
- Coordinates and dimensions: even integers generated from the grid.
- Color: one fill, `#232323`. Recolor for dark mode at render time.
- Detail: use the fewest elements that remain recognizable.
- Filename: Title Case with spaces, for example `Coffee Cup.svg`.

Official Figma exports contain occasional fractional coordinates, clipping
groups, and a 33 px artboard exception. Treat those as source-export artifacts,
not patterns for new icons.

## Delivery checks

Before delivery, verify:

- the requested concept is not already bundled;
- the grid is retained or shown for review;
- standard padding is respected, or the exception is explained;
- the icon is recognizable at 24×24;
- the SVG contains no `stroke` or curved path commands;
- geometry stays on the 2 px grid and uses only `#232323`;
- the file is placed outside the official asset directory.

## Minimal stepped-diagonal example

```text
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
