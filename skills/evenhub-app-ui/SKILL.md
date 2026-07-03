---
name: evenhub-app-ui
description: >-
  Design, implement, or review mobile companion-app UI using the official Even
  Hub design system for Even Realities G2. Use for Even Hub screens, settings,
  components, colors, typography, spacing, cards, navigation, or when selecting
  official Even Realities pixel-icon SVGs. Apply only to the phone app, not the
  576x288 glasses HUD; use everything-evenhub for Even OS display experiences.
  Use evenhub-pixel-icons only when no bundled icon fits.
---

# Apply the Even Hub app design system

Use this skill for the mobile companion app only. Do not apply its layout,
typography, or components to the Even OS glasses display.

The guidance is distilled from the public Figma file “Even Realities – Software
Design Guidelines” (UIUX Design Guidelines 2025), APP Guidelines page.

## Route the task

Load only the reference needed:

- Read `references/app-guidelines.md` before designing, implementing, or
  reviewing screens and components. It defines colors, type, spacing, radii,
  and component patterns.
- Read `references/iconography.md` before selecting or placing icons. It maps
  common UI symbols and inventories all bundled assets.
- Use both references for complete screen work.
- Use the sibling `evenhub-pixel-icons` skill only after confirming that no
  bundled icon expresses the requested metaphor.
- Defer glasses-HUD work to `everything-evenhub:design-guidelines`.

## Implement in this order

1. Establish the screen hierarchy and choose patterns from the component
   inventory; do not invent a new component when an official pattern fits.
2. Apply semantic color tokens instead of choosing approximate grays or accent
   colors.
3. Apply the FK Grotesk Neue type role that matches each element.
4. Set the 12 px screen margin, 16 px card inset, 6 px card radius, and the
   documented 0/6/12/24 px spacing rhythm.
5. Select official SVGs from `assets/icons/` and preserve their geometry.
6. Verify hierarchy, state contrast, spacing, and icon usage at the target
   mobile viewport.

When FK Grotesk Neue is unavailable, state the fallback explicitly rather than
silently presenting another font as exact.

## Core constraints

- Use a near-monochrome interface with yellow only for the documented accent
  and ongoing/warning states; reserve red and green for semantic status.
- Keep cards at 6 px radius with 60% corner smoothing where the platform
  supports it. Use a 6 px radius fallback where it does not.
- Render official 32×32 icon artboards at 24×24 unless the context requires an
  integer grid-preserving scale.
- Use bundled SVGs verbatim. Recolor only through the documented text-color
  roles; do not round, smooth, or redraw their pixel geometry.
- Do not use Unicode glyphs as icons. Use the mapped SVG for arrows, chevrons,
  dots, checks, close, more, and add actions.
- Keep custom icons outside `assets/icons/`; that directory mirrors the
  official source.

## Bundled icon categories

The 191 official SVGs under `assets/icons/` retain the source categories:

- `Edit & Settings Icons/`
- `Feature & Function Icons/`
- `Guide System/`
- `Health Feature Icon/`
- `Menu Bar Icons/`
- `Navigate Feature Icon/`
- `Status Icons/`

Search by filename and related concept before substituting an external icon
library. Preserve source filenames, including their original spelling.

## Review checklist

Before delivery, verify:

- the result is mobile-app UI rather than glasses-HUD UI;
- all colors map to documented semantic tokens;
- typography roles and weights match the reference;
- margins, card insets, spacing, and radii follow the defined rhythm;
- active, disabled, warning, success, and overlay states remain distinguishable;
- every icon is bundled or clearly identified as custom;
- pixel icons remain sharp and recognizable at 24×24;
- unavailable fonts or unsupported corner smoothing have explicit fallbacks.
