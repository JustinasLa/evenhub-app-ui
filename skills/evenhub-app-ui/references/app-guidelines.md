# Even Hub APP Guidelines (Even OS 2.0 design language)

The Even Hub APP Guideline defines the UIUX design system for experiences on the Even G2 APP (phone companion app). It covers six areas: Color, Typography, Iconography, Layout, Components, Templates.

## Color palette (light mode tokens)

Naming: `TC` = Text Color, `BC` = Background Color, `SC` = Shaded Color.

### TC (Text Colors)

| Token | Hex | Usage |
|---|---|---|
| TC - Highlight | #FFFFFF | Used on a black background in brightness mode to emphasize important information |
| TC - 1st | #232323 | Majority of primary body text |
| TC - 2nd | #7B7B7B | Secondary information |
| TC - Accent | #232323 | Accent text |
| TC - Red | #FF453A | Warning messages; use #FF5454 only when reproducing a source example that visibly uses that value |
| TC - Green | #4BB956 | Device connection status (e.g. "Connected") |

### BC (Background Colors)

| Token | Hex | Usage |
|---|---|---|
| BC - Highlight | #232323 | Fill color for buttons that need to be highlighted (dark filled button) |
| BC - 1st | #FFFFFF | Background color for standard buttons |
| BC - 2nd | #F6F6F6 | Supporting color on top of BC-3rd (e.g. chat bubbles) |
| BC - 3rd (Main Background) | #EEEEEE | Background color for pages |
| BC - 4th | #E4E4E4 | Elements needing a deeper layer on top of a BC-3rd background (e.g. toggle track) |
| BC - Accent | #FEF991 | Sections indicating an ongoing action, or toast messages that require a warning (e.g. yellow "Translate" active card) |

### SC (Shaded Colors)

| Token | Value | Usage |
|---|---|---|
| SC - 1st | 50% #000000 | Overlay color when a popup appears |
| SC - 2nd | 8% #232323 | Background color for text input fields (e.g. search field) |

## Typography (Companion App) — "Common Rule - English"

Font family: **FK Grotesk Neue** ("FK"). Weights: Regular = 400, Light = 300.

| Style | Font & size | weight | line-height | letter-spacing |
|---|---|---|---|---|
| Very Large Title | FK 24 Regular | 400 | normal | -0.72px |
| Large Title | FK 20 Regular | 400 | normal | -0.6px |
| Medium Title | FK 17 Regular | 400 | normal | -0.17px |
| Medium Body | FK 17 Light | 300 | normal | -0.17px |
| Normal Title | FK 15 Regular | 400 | normal | -0.15px |
| Normal Body | FK 15 Light | 300 | normal | -0.15px |
| Normal Subtitle | FK 13 Regular | 400 | normal | -0.13px |
| Normal Detail | FK 11 Regular | 400 | normal | -0.11px |

## Layout — margins

- **Screen margin:** use **12px** on the left and right of the screen.
- **Card inset:** use **16px** on the left and right inside cards. This is separate from the outer screen margin.

## Layout — spacing

- **Same-element spacing:** use **0px / 6px** spacing between items when segmented inside the same frame (segmented lists, tags, chat bubbles, carousels, buttons). 0px between contiguous list rows; 6px between separated rows (e.g. rows with checkboxes).
- **Cross-element spacing:** use **12px** spacing between cards of the same subject (without titles). Use **24px** between cards or sections of different subjects.

## Layout — padding (inside cards)

- **Same-element padding:** 0px between segmented rows inside the same frame (e.g. a spec table: Prescription / Lens / Index / Sphere / Cylinder / Axis / Add / PD rows all at 0px).
- Detail-card vertical rhythm example: Title → 4px → meta line ("Today") → 12px → timestamp → 4px → body text → 12px → "Last updated" → 12px → "Keypoints" section → 12px → list items.

## Layout — border radius

- **Default card radius: 6px**, with **corner smoothing set to 60%** (iOS-style squircle).
- **Offset radius:** when a graphic outline is offset from the standard block, adjust the radius by the offset amount — e.g. offset corner radius 4px = 6px − 2px offset.

## Layout — HeadUp display adjustment (in-app control)

The app exposes a HeadUp Display angle control: 0–60° arc, **default 25°**, with a "Reset to default" action.

## Components & templates (inventory)

The Template page groups the reusable APP components into these families (use them as the component vocabulary):

- Buttons, tabs, tags & sliders
- Elements
- Toasts & modals (components: Normal-toasts, Toast-actions)
- Lists & content cards (components: Default-list-item, List-layout)
- Misc
- Sheets
- Forms (incl. Short Text Input Field Template)
- Empty Page / empty states

Recurring component patterns seen in the guidelines:

- Standard button: full-width white (BC-1st) bar, arrow → + "Button Text" label, radius 6px. Highlighted variant: BC-Highlight (#232323) fill with TC-Highlight text. Warning variant: TC-Red text on white.
- List item: leading icon, Title + Subtitle (TC-1st / TC-2nd), trailing chevron; 0px between rows.
- Device card: thumbnail, "Device name" (TC-1st), "Connected" (TC-Green), info icon.
- Toast/ongoing action: BC-Accent (#FEF991) card.
- Header bar: 60px tall, horizontal, space-between, 20px top/bottom padding.
- Toggle: use the paired `Toggle On.svg` and `Toggle Off.svg` assets at their native 36×24 size. The off track uses BC-4th (`#E4E4E4`); the on track uses BC-Highlight (`#232323`).
