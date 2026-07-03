# Iconography — Even Hub APP icon set

Pixel-style icon system for the Even Hub APP.

## Construction rules (APP icons)

- **Base grid:** 32×32px. All Even icons are crafted on top of a foundational 32×32px grid; employ this grid while designing icons to ensure a cohesive and practical visual presentation.
- **Padding:** 2px (allowed to be broken if necessary).
- **Key-shapes:** use the key-shape that best demonstrates the proportion of the icon metaphor. Use it as a starting point, but don't force it if it doesn't convey the right visual message.
- **Pixel unit:** draw with a **2×2px unit** for best consistency across all icons.
- **Style:** keep the execution of the icon and metaphor as simple as possible for best focus and legibility. Respect "pixel corner characteristics" and "empty pixel characteristics" (stepped pixel corners, deliberate empty pixels).

### Best practice workflow
1. Create a 32×32px artboard for each icon.
2. Add 2px padding to the artboard.
3. Set workspace to snap to pixels and round values to whole pixels.
4. Use the rectangle tool instead of the line tool (avoids half-pixel vectors).
5. Be mindful of automatic alignments — they can produce uneven/half pixels.
6. Flatten and merge all pixel units for better resizing.
7. Scale the final icon from 32×32px down to **24×24px** for use.
8. Properly name layers and artboards; create a component for each new icon.

### Do
- Extend icons into padding if additional space is needed.
- Use the key-shape to demonstrate the proportion of the metaphor.
- Stack the pixel units to get more varied angles into the icon design if needed.
- Be consistent with the 2×2px unit.
- Keep the icon inside the padding.

### Don't
- Avoid placing the pixel unit on random decimals.
- Avoid over-complicating icons — keep them simple and focused.
- Avoid placing the majority of the icon in the padding area.
- Ensure design elements are not packed too closely together.
- Avoid smooth rounded corners — opt for pixelated corners for a corner effect.

## Bundled SVG inventory (`assets/icons/`)

191 SVGs in 7 categories, extracted from the Figma APP section. Highlighted menu variants are filled; defaults are outlined.

### Menu Bar Icons (8)
Home Menu, Home Menu - Highlighted*, Health Menu, Health Menu - Highlighted, Even hub Menu, Even hub Menu - Highlighted, Me-Account Menu, Me-Account Menu - Highlighted
(*file name in set: "Home Menu - Hightlted" spelling follows source)

### Feature & Function Icons (41)
3D Facial Scan, Access Control, Account, Calendar, Camera, Direct Push, EIS, Email, Even AI, Feedback, HeadUp Angle, InBox, Interface Settings, Languages, Learn and Explore, Menu, Message, Navigate, News, Notification, Personal Info, Phone Call, Phone Voice Input, Privacy, QR Code, QuickNote, Scan, Screen off, Services, Stocks, Study, Teleprompt, Theme, Time Counting, Transcribe, Translate, Voice Print, Weat Detect (Wear Detect), Weather, Wiki

### Edit & Settings Icons (32)
Add, Checklist, Copy, Cross, Cross_small, Cut, Display Adj On, Distance Adj, Dot List, Edit, Height Adj, Import, Layout Settings, Multi-selection, New, Numble List, Options, Paste, Pause, Pin, Play, Redo, Restore, Settings, Share, Sweep, Switch, Trash, Undo, Unpin, Upload to Cloud, Width

### Guide System (20) — navigation & gesture hints
Back, Go, Search, Chevron - Back / Drill-down / Drill-in / Drill-up, Chevron_small - Back / Drill-down / Drill-in / Drill-up, Single Tap, Double Tap, Long Press, Swipe, Maximize, Maximize Card, Minimize, Minimize Card, Shift to top

### Health Feature Icon (12)
Heart rate, HRV, Lift_1, Lift_2, Lift_3, Run, Sleep, Sp02, Stand, Steps, Temperature, Walk

### Navigate Feature Icon (23)
Bicycle, Bus, Business, Cloth Shop, Coffee shop, Compass, Crown, Direction, End Location, Flag, Gift, Groceries, Home Address, Hotel, Location, Office Address, Relocate, Restaurant, Shopping, Train, Walk, Zoom In, Zoom Out

### Status Icons (55)
1st Floor, 2nd Floor, Alert, Archived File, Bad, Bad Pressed, Battery_50, Battery_75, Battery_Dying, Battery_Full, Battery_Low, Bluetooth, Bluetooth Disconnecte(d), Brightness, Brightness_Auto, Case, Case Battery, Case Charging, Checkbox, Checkmark, Clickbox, Complete, Disconnected, Display Adj Off, Dot, Eye closed, Eye open, FAQs, Fast, Fav, File, Glasses, Glasses Battery, Glasses Charging, Good, Good Pressed, Grabber, HeadUp, Hint, Info, Log out, Login, More, Network error, Reset, Saved, Selected, Selected Box, Slow, Speaker Off, Speaker On, Text Sizing, Unbind, Undisturb, Unfav, Unselected Box

## Usage guidance

- Use `Guide System` chevrons/gestures for wayfinding affordances; `Menu Bar Icons` only in the app tab bar (Highlighted variant = active tab).
- Icons render at 24×24 in UI; don't scale to arbitrary sizes that break the pixel grid (use integer multiples).
- Don't restyle (no stroke-rounding, no recoloring beyond the TC palette).

### No Unicode glyphs as iconography

Never use Unicode symbol characters (`→ ← · • ✓ × ⋯ ▸ ➜` etc.) as inline icons in UI copy or labels — font-rendered glyphs are smooth/anti-aliased and break the pixel-grid brand. Substitute the bundled SVG:

| Instead of | Use |
|---|---|
| `→` / `➜` (direction, "A to B") | `Guide System/Go.svg` |
| `‹ ›` / `▸` (navigation) | `Guide System/Chevron - *.svg` (or `Chevron_small`) |
| `·` / `•` (separator, bullet) | `Status Icons/Dot.svg` |
| `✓` | `Status Icons/Checkmark.svg` |
| `×` (close/remove) | `Edit & Settings Icons/Cross.svg` (or `Cross_small`) |
| `⋯` (more) | `Status Icons/More.svg` |
| `+` (add) | `Edit & Settings Icons/Add.svg` |

Inline icons in text lines: render as `<img>`/icon element sized to the text (16px next to 13–15px text is fine — integer scale of the grid), vertically centered, with 4–6px gaps. Plain punctuation inside sentences (commas, parentheses, real ellipsis in prose) stays text — the rule targets symbols doing *icon work*.
