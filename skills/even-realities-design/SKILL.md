---
name: even-realities-design
description: >-
  Design-system guidance for building software for Even Realities G2 smart
  glasses: the Even Hub companion APP (mobile) and Even OS 2.0 (the glasses
  HUD). Use when designing or reviewing UI for Even Realities products —
  colors, typography, iconography, layout/spacing, components, HUD interaction
  rules — or when the official pixel-icon SVG assets are needed.
---

# Even Realities Software Design Guidelines (Even OS 2.0)

Source: official public Figma "Even Realities - Software Design Guidelines" (UIUX Design Guidelines 2025). Two design targets share one design language:

1. **Even Hub APP** — the phone companion app (light/dark mode, standard mobile UI).
2. **Even OS** — the glasses heads-up display (1-bit style rendering, text-first, pixel-perfect).

Decide which target the user is working on first; the rules differ substantially.

## Quick facts (memorize)

| Topic | APP | OS (glasses HUD) |
|---|---|---|
| Font | FK Grotesk Neue | Even Roster Grotesk, 20px / weight 400 / normal line-height / 0 letter-spacing |
| Screen margin | 12px both sides (16px inside cards) | List: 16px L/R, 8px T/B · Card: 20px L/R, 16px T/B |
| Corner radius | 6px + 60% corner smoothing (squircle) | 6px on list items and cards |
| Icon artboard | 32×32px, 2px padding, 2×2px pixel unit, ship at 24×24 | 24×24px, 3px padding, 1×1px pixel unit |
| Canvas | phone screens | 576×288px usable HUD area — never fill it edge-to-padding (see os-guidelines) |

## Reference files (read as needed)

- `references/app-guidelines.md` — APP color tokens (TC/BC/SC), full type scale, margins, spacing, padding, radius, component/template inventory.
- `references/os-guidelines.md` — Even OS system model (foreground vs app layer), interaction gestures, core principles (edge-to-edge, pixel-perfect, focus-based navigation), OS layout metrics, text containers.
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

- Text-first, monochrome-friendly, pixel-honest. On glasses everything renders as light-on-dark; on the APP, near-monochrome grays with one yellow accent and red/green functional colors.
- One focused element at a time on the HUD; no competing highlights.
- Icons and HUD graphics snap to the pixel grid — no half pixels, no smooth rounded corners on pixel art (use stepped/pixelated corners).
