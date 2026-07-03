# Even OS Guidelines (glasses HUD)

The Even Hub OS Guidelines define the **interaction design system for experiences on Even G2** (the glasses display). Everything is dark mode: light (white/green-tinted) pixel graphics on black. Four key perspectives:

1. **System Model** — how applications are structured and run on the glasses (foreground system layer + App layer).
2. **Core Principles** — fundamental interaction rules ensuring clarity, focus, consistency.
3. **Visual Foundations** — typography, iconography, pixel-level design standards optimized for G2 displays.
4. **Components** — reusable UI components and their intended behaviors within Even OS 2.0.

## System model: two depth planes

- **Priority Plane (Near)** and **Content Plane (Far)**, separated by ~1m of virtual distance.

### System Foreground Layer (Priority Plane)
- Positioned at closer virtual distances (e.g. **2.0m from viewer**).
- Reserved for **time-sensitive alerts and critical operational data**.
- Features **higher luminance contrast and spatial frequency**.
- System foreground features: **Menu, Even AI, Ring connection alerts, Notifications, Confirmation popup**.
- When an app-layer feature is running, system features can activate on top, **temporarily pausing** the background feature's process.
- ⚠️ Even Hub does **not** currently support third-party system-foreground-layer development.

### App Layer (Content Plane)
- Rendered at further virtual distances (e.g. **3–4m from viewer**).
- Contains **routine status indicators and passive monitoring data**.
- Maintains **lower visual salience through reduced saturation**.
- Background-layer features: **Conversate, Teleprompt, Translate, Navigate, Dashboard**.
- **Only one background-layer feature can run at a time** — switching from Conversate to Teleprompt ends the currently active feature.
- Even Hub only supports background-layer (app layer) development.

### System menu (for reference)
The long-press Menu lists: Notifications, Conversate, Teleprompt, Translate, Navigate. The Dashboard shows date/time (large pixel digits), battery, temperature, alarm, and widgets (e.g. stocks). "Even AI listening" is a bordered overlay bar.

## Interaction gestures

The **ring and glasses touchpad** support four main gestures:

| Gesture | Function |
|---|---|
| Single tap | Confirm a selection or expand a card |
| Double tap | Exit or go back |
| Swipe | Scroll long text or select items in a list |
| Long press | Activate the Menu |

## Core principles

### Edge-to-edge design
Position all interface elements close to the screen edges to maximize usable space and avoid obstructing the user's view. The HUD canvas in specs is **576×288px** — the Do example pins status text to corners/edges; the Don't example shrinks content into an inset box.

### Pixel-perfect design
Design all elements with precise pixel accuracy to ensure clear and consistent rendering on the glasses display. Do: crisp pixel-grid rendering (clock icon + "Text" sample aligned to grid). Don't: anti-aliased/blurred (sub-pixel positioned) graphics.

### Focus-based navigation
- At any given time, **only one interactive element may be highlighted** using an outline.
- Highlighting is used **exclusively** to indicate the current actionable target and must not compete with other visual elements.
- Do: each view contains only one outlined target (e.g. "Selection 1" outlined in a 5-item list).
- Don't: multiple outlined elements in the same view — creates ambiguity about which element is actionable.

## Typography (OS)

Single background font style:

| Property | Value |
|---|---|
| Font | **Even Roster Grotesk** |
| font-size | 20 |
| font-weight | 400 |
| line-height | normal |
| letter-spacing | 0px |

Rendering is pixel-style (dot-matrix look) on the HUD.

## Layout examples (OS)

### Margins & spacing
- **List margin & spacing:** left & right margin **16px**; top & bottom margin **8px** (e.g. the "Home" list cell).
- **Card margin & spacing:** left & right margin **20px**; top & bottom margin **16px** (text card example).

### Radius
- **Default radius:** list items and cards use a corner radius of **6px** (thin white outline containers).

## Components (OS)

### Text containers
- **No container outline:** intended for extended reading without interactive items (e.g. Teleprompt). Vertical scrolling is enabled automatically based on content; a scrollbar automatically appears when the container overflows.
- **With container outline:** containers indicate a potential interaction. Users can either swipe to navigate content areas on a page (similar to list selection) or tap to interact with a piece of content.
- Full-screen outlined containers should only be used to enhance focus; vertical scrolling is enabled automatically inside them (e.g. Dashboard News widget expanded).

### Iconography (OS)
- Icons drawn on a **24×24px** artboard with **3px padding** (padding may be broken if necessary).
- **Pixel unit 1×1px** — gives the best consistency across all OS icons.
- Same do/don'ts as APP icons: keep icon inside padding, extend into padding only when extra space is needed, no sub-pixel decimals, don't fill the padding area, pixelated (not smooth) corners.
- Best practice workflow: 24×24 artboard per icon → 3px padding → snap-to-pixel workspace → rectangle tool (not line tool) → beware auto-alignments creating half pixels → flatten & merge pixel units → name layers/artboards properly → create a component per icon.
