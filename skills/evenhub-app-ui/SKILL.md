---
name: evenhub-app-ui
description: >-
  Design-system guidance for the Even Hub companion APP (mobile) for Even
  Realities G2 smart glasses. Use when designing or reviewing APP UI — colors,
  typography, iconography, layout/spacing, components — or when the official
  pixel-icon SVG assets are needed. For the glasses HUD (Even OS) design
  guidelines, use the everything-evenhub plugin instead.
---

# Even Hub APP Design Guidelines

Source: official public Figma "Even Realities - Software Design Guidelines" (UIUX Design Guidelines 2025), APP Guidelines page.

**Scope: the phone companion app only** (light/dark mode, standard mobile UI). Glasses HUD (Even OS) design guidelines are covered by the `everything-evenhub` plugin (`everything-evenhub:design-guidelines`) — defer to it for the 576×288 canvas, HUD layout, and glasses interaction rules.

## Quick facts (memorize)

| Topic | APP |
|---|---|
| Font | FK Grotesk Neue |
| Screen margin | 12px both sides (16px inside cards) |
| Corner radius | 6px + 60% corner smoothing (squircle) |
| Icon artboard | 32×32px, 2px padding, 2×2px pixel unit, ship at 24×24 |

## Reference files (read as needed)

- `references/app-guidelines.md` — APP color tokens (TC/BC/SC), full type scale, margins, spacing, padding, radius, component/template inventory.
- `references/iconography.md` — how icons are constructed (grid, key-shapes, do's/don'ts) plus the full inventory of the 191 bundled SVG assets.

## Bundled icon assets

The official icon set (191 SVGs, extracted from the APP section of the Figma file) ships with this skill under `assets/icons/`, organized in the same seven categories as the design file:

```
assets/icons/
  Edit & Settings Icons/   (32)
  Feature & Function Icons/(41)
  Guide System/            (20)
  Health Feature Icon/     (12)
  Menu Bar Icons/          (8, incl. -Highlighted variants)
  Navigate Feature Icon/   (23)
  Status Icons/            (55)
```

When implementing UI, prefer these SVGs verbatim rather than redrawing or substituting a generic icon library — the pixel-grid style is part of the brand. File names are human-readable (e.g. `Status Icons/Battery_Low.svg`, `Guide System/Chevron - Back.svg`).

## Core design attitude

- Text-first, monochrome-friendly, pixel-honest: near-monochrome grays with one yellow accent and red/green functional colors.
- Icons snap to the pixel grid — no half pixels, no smooth rounded corners on pixel art (use stepped/pixelated corners).
- Never use Unicode symbols (`→ · • ✓ ×` …) as inline icons — font glyphs are anti-aliased and break the pixel style. Use the bundled SVGs instead (`Go`, `Dot`, `Checkmark`, `Cross`, chevrons) — mapping table in `references/iconography.md`.
