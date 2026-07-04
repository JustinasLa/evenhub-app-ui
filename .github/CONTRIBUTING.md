# Contributing to evenhub-app-ui

evenhub-app-ui is an Even Realities G2 design-system skill/plugin for Claude Code and
Codex — design guidelines, color tokens, and the official pixel-icon SVG set. This
guide walks you through making a change.

## Prerequisites

- [Node.js 18+](https://nodejs.org) (provides `node` and `npm`) — only needed for the
  installer and the icon converter; the skills themselves are plain Markdown and SVG.


## 1. Fork and clone

Click **Fork** on the repo page, then clone your fork:

```bash
git clone https://github.com/<your-username>/evenhub-app-ui.git
cd evenhub-app-ui
git remote add upstream https://github.com/JustinasLa/evenhub-app-ui.git
```

`origin` is your fork (where you push); `upstream` is this repo (where you pull
the latest from). You cannot push directly to `upstream` - all changes go
through a pull request.

## 2. Confirm a clean starting point

```bash
node bin/install.js --list
node bin/install.js --dry-run
```

The installer must detect your agents and preview both skills without errors
before you start. If it fails on a fresh clone, open an issue rather than a
pull request.

## 3. Create a branch

Never commit to `master`. Branch off it with a short, descriptive name:

```bash
git checkout -b short-description-of-change
```

## 4. Make your change

Most changes touch Markdown (`SKILL.md`, `references/`) or SVG assets. To test a
skill change end to end, load your working copy into your agent:

```bash
# Claude Code: copy the skill folder into a skills directory
cp -r skills/evenhub-app-ui ~/.claude/skills/evenhub-app-ui

# or install everything the way users do
node bin/install.js --force
```

Then start a fresh session and exercise the skill on a real design task.

New icons are drawn on the 16×16 ASCII grid and converted with the bundled
generator — never hand-write the SVG:

```bash
node skills/evenhub-pixel-icons/scripts/grid2svg.mjs my-icon.grid --output "icons/custom/My Icon.svg"
```

## 5. Verify before committing

```bash
node bin/install.js --dry-run
```

The installer preview must pass clean. For icon changes, also verify the
skill's checklist: 32×32 viewBox, single `#232323` fill, no `stroke`, no curve
commands, all bars in multiples of 2px, legible at 24×24.

## 6. Commit, push, and open a pull request

```bash
git add -A
git commit -m "Describe your change in the imperative, e.g. Fix toggle sizing rule"
git push -u origin short-description-of-change
```

GitHub prints a link after the push - open it (or use the "Compare & pull
request" banner on your fork) and:

- Confirm the PR targets `JustinasLa/evenhub-app-ui` `master`.
- Describe what changed, why, and how you tested it.
- Reference any related issue with `Closes #123`.

## 7. Respond to review

To address feedback, add more commits to the **same branch** and push again —
the PR updates automatically:

```bash
git add -A
git commit -m "Address review feedback"
git push
```

## 8. After it's merged, sync your fork

```bash
git checkout master
git pull upstream master
git push origin master
git branch -d short-description-of-change
```

## Project conventions

Keep changes consistent with the existing content:

- **Official assets are verbatim.** Everything under
  [`skills/evenhub-app-ui/assets/icons/`](../skills/evenhub-app-ui/assets/icons/)
  mirrors the public Figma export — never edit, rename, recolor, or "fix" those
  SVGs, including their original spelling. Custom icons live in
  [`icons/custom/`](../icons/custom/) instead.
- **Guideline text must trace to the source.** The references are distilled from
  the public Figma file "Even Realities – Software Design Guidelines"; don't add
  rules, tokens, or metrics that aren't in it.
- **Both skills stay in sync.** If a change affects icon rules, check
  `skills/evenhub-app-ui/references/iconography.md` and
  `skills/evenhub-pixel-icons/SKILL.md` together.
- **Match the surrounding style** - tone, formatting, and existing patterns.
- **One logical change per pull request.** Smaller PRs are reviewed faster.

## Scope and architecture

- `skills/evenhub-app-ui/` - the design-system skill: `SKILL.md` routing,
  `references/` (guidelines + iconography), `assets/icons/` (193 official SVGs).
- `skills/evenhub-pixel-icons/` - the icon-creation skill plus
  `scripts/grid2svg.mjs`, the deterministic ASCII-grid → SVG converter.
- `bin/install.js`, `install.sh`, `install.ps1` - cross-agent installer.
- `.claude-plugin/`, `.codex-plugin/` - plugin manifests for Claude Code and Codex.
- `icons/custom/`, `docs/` - README demo assets, not installed with the skills.

This repo repackages a public design resource; it is not affiliated with Even
Realities. If you're planning a larger change, open an issue first to discuss
it before investing time in a pull request.
