<p align="center">
  <strong>evenhub-app-ui</strong>
</p>

<p align="center">
  Even Realities G2 design system as a Claude Code skill.<br>
  Even Hub APP design guidelines · color tokens · type scale · <strong>191 official pixel icons bundled</strong>.
</p>

<p align="center">
  <a href="https://docs.anthropic.com/en/docs/claude-code"><img src="https://img.shields.io/badge/works_with-Claude_Code-orange?style=flat" alt="Claude Code"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/JustinasLa/evenhub-app-ui?style=flat" alt="License"></a>
</p>

---

evenhub-app-ui is a skill/plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Install once, and whenever you design or build UI for the Even Hub companion app, Claude applies the official design guidelines automatically: exact hex tokens, FK Grotesk Neue typography, margin & spacing metrics, and pixel-icon construction rules.

Distilled from the public Figma file **"Even Realities – Software Design Guidelines"** (UIUX Design Guidelines 2025), APP Guidelines page.

> **Looking for glasses HUD (Even OS) guidelines?** Those are covered by the official [everything-evenhub](https://github.com/even-realities/everything-evenhub) plugin — this skill deliberately sticks to the companion APP to avoid duplicating it.

## What's inside

```
skills/evenhub-app-ui/
  SKILL.md                        entry point — quick-facts table, when to apply what
  references/
    app-guidelines.md             APP: TC/BC/SC color tokens, 8-step type scale,
                                  margins (12/16px), spacing (0/6/12/24px),
                                  radius (6px + 60% smoothing), component inventory
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
/plugin marketplace add JustinasLa/evenhub-app-ui
/plugin install evenhub-app-ui@evenhub-app-ui
```

Then `/reload-plugins` (or restart Claude Code). Safe to re-run.

<details>
<summary><strong>Manual install (no plugin system)</strong></summary>

<br>

Copy the skill folder into a skills directory:

```bash
# personal (all projects)
~/.claude/skills/evenhub-app-ui/

# or per-project
<your-project>/.claude/skills/evenhub-app-ui/
```

Copy the whole folder [`skills/evenhub-app-ui/`](skills/evenhub-app-ui/) — SKILL.md plus `references/` and `assets/icons/` — so the icon paths keep working.

</details>

## Usage

No command needed — the skill triggers when the conversation involves Even Realities / G2 / Even Hub app design or implementation. You can also invoke it explicitly:

```
/evenhub-app-ui
```

Typical asks it improves:

- "Build the settings screen for our G2 companion app" → correct tokens (#232323 / #EEEEEE / #FEF991…), 12px screen margins, 6px squircle cards, FK type scale.
- "Need a battery icon" → uses the bundled `Status Icons/Battery_Low.svg` instead of inventing one.

## Icon set

The 191 SVGs under [`skills/evenhub-app-ui/assets/icons/`](skills/evenhub-app-ui/assets/icons/) were exported from the APP section of the public Figma file. Pixel-grid style is part of the brand: use them verbatim, render at 24×24 (or integer multiples), don't recolor outside the token palette.

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
