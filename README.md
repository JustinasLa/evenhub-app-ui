<p align="center">
  <strong>even-realities-design</strong>
</p>

<p align="center">
  Even Realities G2 design system as a Claude Code skill.<br>
  Even Hub APP + Even OS 2.0 guidelines · color tokens · type scale · HUD rules · <strong>191 official pixel icons bundled</strong>.
</p>

<p align="center">
  <a href="https://docs.anthropic.com/en/docs/claude-code"><img src="https://img.shields.io/badge/works_with-Claude_Code-orange?style=flat" alt="Claude Code"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/JustinasLa/even-realities-design?style=flat" alt="License"></a>
</p>

---

even-realities-design is a skill/plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Install once, and whenever you design or build UI for Even Realities products — the Even Hub companion app or the Even OS glasses HUD — Claude applies the official design guidelines automatically: exact hex tokens, FK Grotesk Neue / Even Roster Grotesk typography, margin & spacing metrics, pixel-icon construction rules, and the G2 HUD interaction model (two depth planes, four gestures, focus-based navigation).

Distilled from the public Figma file **"Even Realities – Software Design Guidelines"** (UIUX Design Guidelines 2025), both pages: APP Guidelines and OS Guidelines.

## What's inside

```
skills/even-realities-design/
  SKILL.md                        entry point — quick-facts table, when to apply what
  references/
    app-guidelines.md             APP: TC/BC/SC color tokens, 8-step type scale,
                                  margins (12/16px), spacing (0/6/12/24px),
                                  radius (6px + 60% smoothing), component inventory
    os-guidelines.md              OS: foreground vs app layer (2m / 3-4m planes),
                                  gestures (tap/double-tap/swipe/long-press),
                                  edge-to-edge · pixel-perfect · focus-based principles,
                                  576×288 canvas, OS margins & radius, text containers
    iconography.md                icon construction (32×32 grid, 2×2px unit, do's/don'ts)
                                  + full inventory of the bundled set
  assets/icons/                   191 official SVGs in 7 categories:
                                  Menu Bar · Feature & Function · Edit & Settings ·
                                  Guide System · Health · Navigate · Status
```

## Install

**Plugin marketplace. Two commands.**

```bash
# inside Claude Code
/plugin marketplace add JustinasLa/even-realities-design
/plugin install even-realities-design@even-realities-design
```

Then `/reload-plugins` (or restart Claude Code). Safe to re-run.

<details>
<summary><strong>Manual install (no plugin system)</strong></summary>

<br>

Copy the skill folder into a skills directory:

```bash
# personal (all projects)
~/.claude/skills/even-realities-design/

# or per-project
<your-project>/.claude/skills/even-realities-design/
```

Copy the whole folder [`skills/even-realities-design/`](skills/even-realities-design/) — SKILL.md plus `references/` and `assets/icons/` — so the icon paths keep working.

</details>

## Usage

No command needed — the skill triggers when the conversation involves Even Realities / G2 / Even OS / Even Hub design or implementation. You can also invoke it explicitly:

```
/even-realities-design
```

Typical asks it improves:

- "Build the settings screen for our G2 companion app" → correct tokens (#232323 / #EEEEEE / #FEF991…), 12px screen margins, 6px squircle cards, FK type scale.
- "Design a teleprompter view for the glasses" → 576×288 edge-to-edge layout, Even Roster Grotesk 20/400, no-outline text container with auto scroll, one focused element.
- "Need a battery icon" → uses the bundled `Status Icons/Battery_Low.svg` instead of inventing one.

## Icon set

The 191 SVGs under [`skills/even-realities-design/assets/icons/`](skills/even-realities-design/assets/icons/) were exported from the APP section of the public Figma file. Pixel-grid style is part of the brand: use them verbatim, render at 24×24 (or integer multiples), don't recolor outside the token palette.

| Category | Count | Examples |
|---|---|---|
| Status Icons | 55 | Battery_Full, Bluetooth, Glasses Charging, Alert |
| Feature & Function | 41 | Even AI, Teleprompt, Translate, Navigate, Weather |
| Edit & Settings | 32 | Add, Edit, Trash, Undo, Settings |
| Navigate Feature | 23 | Compass, Location, Restaurant, Train |
| Guide System | 20 | Chevrons, Single/Double Tap, Long Press, Swipe |
| Health Feature | 12 | Heart rate, HRV, Sleep, Steps |
| Menu Bar | 8 | Home/Health/Even hub/Me-Account (+ Highlighted) |

## Credits & license

Design guidelines and icon artwork © [Even Realities](https://www.evenrealities.com) — published by them as a public Figma resource for developers building on G2. This repo repackages that public resource for Claude Code workflows; not affiliated with or endorsed by Even Realities.

Skill text and packaging: MIT — see [LICENSE](LICENSE).
