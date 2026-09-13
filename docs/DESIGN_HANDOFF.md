# Handoff: Representation Dashboard

## Overview

A public dashboard for a photo-contribution project. It reports how many people are represented in the image library against a goal of 10,000, breaks that down across five demographic dimensions (age, skin tone, gender, body, visible disability / assistive devices), names the three biggest gaps as calls to action, and ends with a contribute prompt plus a QR hand-off to mobile.

Two files ship in this bundle:

1. **Representation Dashboard** — the screen itself, a single unscrolled 4:3 frame intended for a large display / kiosk context as well as desktop web.
2. **Design Language** — the system documentation: color, type, layout, components, data-display rules, icons, voice, and a copy-paste token block. Where the two disagree, the Design Language page wins.

## About the Design Files

The files in `design/` are **design references created in HTML**. They are prototypes that show intended look, structure and behavior — they are not production code to copy directly.

The task is to **recreate these designs inside the target codebase's existing environment** (React, Vue, Svelte, native, whatever is already there) using its established component patterns, styling approach and data layer. If the project has no frontend environment yet, choose the framework that best fits it and implement the designs there.

Practical notes on the file format:

- Both `.dc.html` files open directly in a browser. `support.js` is the small runtime they need; `image-slot.js` powers the drag-and-drop image placeholders. Serve the `design/` folder over any static server and open either file to see the design live.
- Markup is written with **inline styles** and a light `{{ }}` templating layer, with values computed in a `class Component` block at the bottom of each file. Read that class to see exactly how bar widths, percentages and number formatting are derived. Do not port the templating layer itself — port the layout, values and logic.
- Content is **mock data**, hard-coded in the `renderVals()` method. Replace it with real API data; the shape needed is described under *State & data* below.

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii and data-viz treatment are final and should be reproduced faithfully. Exact hex values, font sizes, letter-spacing and paddings are listed in the Design Language page and summarized in *Design tokens* below.

Two areas are deliberately unfinished and need product/design decisions during build:

- **Responsive behavior.** The dashboard is authored at a fixed 1512 × 1134 reference frame with no page scroll. Breakpoint rules below tablet/mobile do not exist yet.
- **Interaction states beyond hover.** Focus, loading, empty and error states are not designed. Suggested defaults are noted per component.

## Screens / Views

### 1. Representation Dashboard

**Purpose.** A viewer sees at a glance how complete the library is, understands which groups are missing, and is given a way to contribute photos from their phone.

**Frame.** 1512 × 1134 px (4:3), `overflow: hidden`, no page scroll. Ground `#faf6ef`, ink `#17150f`, body font Instrument Sans. Horizontal gutter 56px throughout. In the app this becomes a max-width container with the same 56px gutter.

**Layout.** Four full-width horizontal bands stacked top to bottom, each separated from the next by a 1px `rgba(23,21,15,.10)` rule. No card shadows anywhere in the design; separation is hairlines and tinted grounds only.

---

#### Band 1 — Hero (`padding: 44px 56px 36px`)

Three columns, `display: flex`, `align-items: stretch`, `gap: 44px`. All three stretch to equal height so their bottom edges align.

**Column A — headline progress** (`flex: 1`, internally `flex-direction: column; justify-content: space-between`)

| Element | Spec |
|---|---|
| Count `6,482` | Archivo 800, 124px, line-height .88, letter-spacing −.045em, ink |
| Target `/ 10,000` | Archivo 500, 48px, line-height 1, letter-spacing −.02em, `rgba(23,21,15,.4)`; baseline-aligned with the count, `gap: 22px` |
| Caption `people represented` | Instrument Sans 600, 14px, letter-spacing .2em, uppercase, `rgba(23,21,15,.55)`, `margin-top: 20px` |
| Progress bar | height 32px, radius 7px, `overflow: hidden`, track `#eae1d3`, `margin-top: 28px`. Approved segment width `6482/10000 = 64.82%` solid `#17150f`; pending segment width `428/10000 = 4.28%` filled `#e3dac9` + `repeating-linear-gradient(45deg,#17150f 0 2px,transparent 2px 5.5px)` |
| Legend triplet | `display: flex; gap: 64px; margin-top: 22px`. Each item: 15×15 radius-3 swatch + label (Instrument 500, 14.5px, `rgba(23,21,15,.7)`) on one row, figure below (Archivo 700, 25px, −.01em). Items: **Approved** `#17150f` / 6,482 · **Pending review** hatch / 428 · **Still needed** `#eae1d3` / 3,090 |

Note the hatch swatch in the hero legend uses the 2px/5.5px stripe (matching the taller hero bar); chart bars use 1.6px/4.4px.

**Column B — secondary stats** (`width: 236px`, `flex: none`, `justify-content: space-between`, `gap: 20px`, `padding: 2px 0`)

Three stat rows. Each: a 56px disc (`border-radius: 50%`) holding a 28px line icon, `gap: 14px`, then a two-line text block — label Instrument 400 14.5px `rgba(23,21,15,.6)` above figure Archivo 700 30px, −.025em, line-height 1.15.

| Disc tint | Label | Figure | Icon |
|---|---|---|---|
| `#e7e1f6` | People represented | 6,482 | two people |
| `#fae4b6` | Images contributed | 8,103 | image / photo |
| `#dde8cf` | Contributions today | 243 | circled check |

This column is behind a visibility flag (`showSecondaryStats`, default on).

**Column C — video preview** (`width: 396px`, `flex: none`, `align-self: stretch`)

Radius 18px, `overflow: hidden`, ground `#f7efe2`, whole box clickable. Contains, stacked: the video still (object-fit cover, fills the box), a flat scrim `rgba(18,16,12,.24)` across the full inset (`pointer-events: none`), and the primary button absolutely centered (`top:50%; left:50%; translate(-50%,-50%)`).

Button: `#e1462a` ground, white text, `padding: 14px 22px`, radius 9px, Instrument 600 15.5px, `gap: 11px`, `white-space: nowrap`, 20px circled-play icon in white to the **left** of the label `Watch video`.

Clicking the box opens the video overlay (see *Interactions*).

---

#### Band 2 — Need cards (`padding: 30px 56px 32px`, top hairline)

`display: grid`, `grid-template-columns: repeat(3, 1fr)`, `gap: 24px`, full band width.

Each card: tinted ground, radius 13px, `padding: 22px 24px`, `display: flex; align-items: center; gap: 20px`, cursor pointer. Contents left to right — 42px line icon (`flex: none`), title (`flex: 1`, Archivo 700, 21px, line-height 1.25, letter-spacing −.015em, `text-wrap: pretty`), 19×13 forward arrow (`flex: none`).

| Ground | Title | Icon |
|---|---|---|
| `#e7e1f6` | More people aged 75+ | person with glasses |
| `#fae4b6` | Looking for darker skin tones | filled person silhouette in `#6b4630` |
| `#dde8cf` | More wheelchair users | wheelchair |

Copy is a request, not a metric. Each card should link to the contribute flow pre-filtered to that gap. The three cards are expected to be **data-driven** in production — computed from whichever dimension buckets are furthest from their targets — so treat the copy strings as templated, not literal.

---

#### Band 3 — Representation charts (`padding: 32px 56px`, top hairline)

Header row: `display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px`.

- Title `Representation` — Archivo 700, 30px, −.025em
- Legend, right-aligned, `gap: 26px`, Instrument 400 13px `rgba(23,21,15,.62)`: **Approved** (12px radius-2 `#17150f` chip) and **Pending** (same chip, hatched). Explained once here; individual columns carry no legend.

Below: `display: grid`, `grid-template-columns: 1fr 1.12fr 1fr 1fr 1.16fr` — five dimension columns. Columns 2–5 carry `border-left: 1px solid rgba(23,21,15,.09)` and `padding: 0 30px` (last one `padding-left: 30px`); column 1 has `padding-right: 30px`.

Every column starts with the same header: a 9px key dot + title (Archivo 700, 17px, −.01em), `gap: 9px`, `margin-bottom: 22px`.

| # | Title | Key dot | Bar form |
|---|---|---|---|
| 1 | Age | `#7c6bb2` | horizontal labelled rows |
| 2 | Skin tone | `#b07a4e` | vertical swatch columns |
| 3 | Gender | `#c46b8a` | horizontal, label above bar |
| 4 | Body | `#4f8f86` | horizontal, label above bar |
| 5 | Visible disability / assistive devices | `#c98b3f` | horizontal labelled rows |

**Horizontal labelled row** (columns 1 and 5): `display: flex; align-items: center; gap: 10px`, bottom margin 14px (col 1) / 12px (col 5). Fixed-width label cell (44px col 1, 118px col 5) Instrument 500 12.5px `rgba(23,21,15,.72)`; then the bar (`flex: 1 1 auto; min-width: 0`, height 11px, radius 4px, `overflow: hidden`, track `#eae1d3`) holding approved then pending segments; then a right-aligned value cell (52px / 50px) Instrument 600 12px `font-variant-numeric: tabular-nums`.

**Label-above row** (columns 3 and 4): label and value on a `justify-content: space-between` baseline row with `margin-bottom: 8px`, bar (height 12px) beneath. Row bottom margin 21px (col 3) / 18px (col 4).

**Vertical swatch columns** (column 2): `display: flex; align-items: stretch; gap: 7px; height: 168px`. Each of ten columns is `flex: 1; min-width: 0; flex-direction: column; align-items: center; gap: 7px` holding, top to bottom — the value (Instrument 600, 10.5px, tabular, `rgba(23,21,15,.62)`), the track (`flex: 1 1 auto`, full width, radius 4px, `overflow: hidden`, `justify-content: flex-end` so fills grow from the bottom, pending stacked above approved), and a full-width 13px radius-3 swatch of the Monk tone with a `rgba(23,21,15,.12)` hairline.

Under column 2, an outbound note: `Using the ` + italic `Monk Skin Tone scale` + a 9px up-right arrow, `margin-top: 9px`, Instrument 400 11.5px `rgba(23,21,15,.55)`, hover `#e1462a`, linking to `https://en.wikipedia.org/wiki/Monk_Skin_Tone_Scale` in a new tab.

---

#### Band 4 — Contribute banner (`margin: 0 56px 48px`)

Ground `#f7e6d6`, radius 16px, `padding: 34px 44px`, `display: flex; align-items: center; justify-content: space-between; gap: 40px`.

Left: 72px accent disc (`#e1462a`) with a 34px white camera icon, `gap: 26px`, then heading `Add your photos` (Archivo 700, 33px, −.03em) with reassurance line `Contributions are reviewed by real people.` beneath (Instrument 400 15.5px `rgba(23,21,15,.6)`, `margin-top: 6px`).

Right (behind a `showQr` flag, default on): `padding-left: 44px; border-left: 1px solid rgba(23,21,15,.13)`, `gap: 22px` — a 94px radius-8 QR code image, then `Scan to add photos from your phone` (Instrument 500 17px, line-height 1.35, `max-width: 170px`).

### 2. Design Language (reference page)

Not a product screen. A fluid, max-width-1180 documentation page that specimens the system: eight numbered sections (Color, Typography, Layout & shape, Components, Data display, Icons, Voice, Tokens), each separated by a hairline, with a pill nav at the top that anchors to them. Use it as the styling source of truth while building, and keep it updated as the system evolves.

## Interactions & Behavior

**Implemented in the prototype**

- **Video overlay.** Clicking the hero video preview sets `videoOpen` true and renders a fixed full-viewport overlay: `rgba(18,16,12,.94)` ground, `z-index: 50`, centered column with `gap: 26px`. Inside, a 64%-width 16:9 player surface (radius 10px) and a `Close` affordance below it (Instrument 400 15px, `rgba(255,255,255,.6)`) that sets `videoOpen` false. In production this should hold the real player, close on Escape and on scrim click, and trap focus.
- **Hover.** Primary buttons darken to `#e1462a` → `#b8351b`. The Monk scale link goes `rgba(23,21,15,.55)` → `#e1462a`. Need cards and the video preview are `cursor: pointer`.
- **Style flags.** Three prototype-level switches exist and are worth preserving as props: `showSecondaryStats` (boolean), `showQr` (boolean), `barShape` (`rounded` | `square` | `pill` — maps to bar radius 4 / 0 / 999 system-wide).

**Not designed — needs decisions**

- **Focus states.** Nothing is specified. Suggested: a 2px `#e1462a` outline at 2px offset on all interactive elements, since the accent already reads as "action".
- **Loading.** Suggested: render tracks at full width with no fills and dash the figures, rather than a spinner — the frame's structure is meaningful on its own.
- **Empty / zero state.** A dimension bucket at 0 should still render its label, swatch and an empty track; do not hide rows.
- **Error.** No treatment exists. Consider a band-level inline message using ink/60 body copy rather than a colored alert, to stay inside the palette.
- **Counting animation.** The hero figure and bars are static in the prototype. If animated on load, keep it short (~600ms, ease-out) and respect `prefers-reduced-motion`.
- **Responsive.** Below the 1512px reference the three hero columns need a stacking order (progress → video → stats reads best), the five chart columns need to wrap to a 2-up or 1-up grid with the vertical hairlines becoming horizontal ones, and the need cards need to go 1-up. The vertical swatch chart should stay vertical at all widths; it is the variant that survives narrow columns.

## State & data

Prototype state is a single boolean: `videoOpen`.

Everything else is derived from counts. Each dimension bucket needs `{ label, approved, pending, target }`; bar segment widths are `min(100, value / target * 100)` percent, approved and pending drawn as sibling flex children of the track so they stack without overlapping.

The shape the UI needs from the API:

```
total:      { approved: 6482, pending: 428, target: 10000 }
secondary:  { peopleRepresented, imagesContributed, contributionsToday }
dimensions: [
  { id: 'age',        title: 'Age',       key: '#7c6bb2', form: 'rows',
    buckets: [{ label: '18–29', approved: 1742, pending: 96, target: 2000 }, …] },
  { id: 'skinTone',   title: 'Skin tone', key: '#b07a4e', form: 'columns',
    buckets: [{ label: '1', swatch: '#f6ede4', approved: 512, pending: 38, target: 1100 }, …] },
  …
]
needs:      [{ copy: 'More people aged 75+', icon: 'person', tint: '#e7e1f6', filter: {…} }, …]
```

Formatting rules: counts are absolute and comma-grouped (`toLocaleString('en-US')`), never percentages; all figures use `font-variant-numeric: tabular-nums`; targets drive bar length but are **not** printed next to rows (they were removed for making the charts unreadable).

## Design tokens

```css
:root {
  /* surfaces */
  --canvas:        #faf6ef;   /* page ground */
  --surface:       #f7efe2;   /* media wells, inset panels */
  --surface-warm:  #f7e6d6;   /* contribute banner only */
  --shell:         #312c26;   /* workspace behind the frame */

  /* ink */
  --ink:           #17150f;
  --ink-72:        rgba(23,21,15,.72);
  --ink-60:        rgba(23,21,15,.60);
  --ink-45:        rgba(23,21,15,.45);
  --hairline:      rgba(23,21,15,.10);

  /* action */
  --accent:        #e1462a;   /* primary buttons + links only, never a chart color */
  --accent-hover:  #b8351b;

  /* data */
  --data-approved: #17150f;
  --data-pending:  #e3dac9;
  --data-track:    #eae1d3;
  --hatch: repeating-linear-gradient(45deg, #17150f 0 1.6px, transparent 1.6px 4.4px);

  /* category tints + key dots (pairings are fixed) */
  --tint-age:      #e7e1f6;  --key-age:        #7c6bb2;
  --tint-skin:     #fae4b6;  --key-skin:       #b07a4e;
  --tint-body:     #dde8cf;  --key-body:       #4f8f86;
                             --key-gender:     #c46b8a;
                             --key-disability: #c98b3f;

  /* type */
  --font-display: 'Archivo', sans-serif;         /* 500 / 700 / 800 — headings + all figures */
  --font-ui: 'Instrument Sans', system-ui, sans-serif;  /* 400 / 500 / 600 — everything read in sentences */

  /* shape — no shadows exist in this system */
  --r-bar: 4px;   --r-qr: 8px;     --r-btn: 9px;
  --r-card: 13px; --r-banner: 16px; --r-media: 18px;

  /* space */
  --s1: 6px; --s2: 9px; --s3: 14px; --s4: 22px;
  --s5: 30px; --s6: 44px; --gutter: 56px;
}
```

**Monk Skin Tone scale** — ten fixed reference swatches, always in order, always labelled 1–10. Not brand colors; do not tune them.

```
#f6ede4  #f3e7db  #f7ead0  #eadaba  #d7bd96
#a07e56  #825c43  #604134  #3a312a  #292420
```

**Type scale** (name · family/weight · size / line-height · tracking)

| Role | Spec |
|---|---|
| Hero figure | Archivo 800 · 124 / .88 · −.045em |
| Hero target | Archivo 500 · 48 · −.02em · ink/40 |
| Section title | Archivo 700 · 30 · −.025em |
| Card title | Archivo 700 · 21 / 1.25 · −.015em |
| Column title | Archivo 700 · 17 · −.01em |
| Figure | Archivo 700 · 25–30 · −.025em |
| Eyebrow | Instrument 600 · 14 · .2em · uppercase · ink/55 |
| Body | Instrument 400 · 15.5 / 1.5 · ink/60 |
| UI label | Instrument 500 · 14.5 · ink/70 |
| Data label | Instrument 500 · 12.5 · ink/72 |
| Data value | Instrument 600 · 12 · tabular-nums |
| Footnote | Instrument 400 · 11.5 · ink/55 |

## Voice

Plain, short, about people rather than records. Copy states what is true and what is needed; it does not celebrate the product.

| Write | Not |
|---|---|
| Still needed | Remaining to goal |
| More people aged 75+ | Underrepresented cohort: 75+ |
| Contributions are reviewed by real people. | Every contribution is reviewed by a person before it is approved. |
| Scan to add photos from your phone | Scan to contribute on your phone |

Where a taxonomy comes from outside the product, name it and link out rather than paraphrasing it.

## Assets

- **Fonts.** Archivo (500, 700, 800) and Instrument Sans (400, 500, 600), loaded from Google Fonts in the prototype. Self-host or route through the codebase's existing font pipeline.
- **Icons.** All icons are hand-written inline SVG in the prototype files — line icons, 1.5px stroke, round joins, ink stroke, no fill, drawn on 28- and 42-unit viewBoxes. Sizes in use: 20 (in buttons), 28 (stat discs), 34 (accent disc), 42 (need cards). Scale the stroke with the icon so weight stays even. Section 06 of the Design Language page specimens the set: people, image, approved, play, forward, external, assistive. Swap them for the codebase's icon library if one exists, matching weight and terminal style.
- **Images.** No real imagery is included. Two drop slots are placeholders the design expects real assets for: the **hero video still** (396px wide, fills its column, object-fit cover) and the **QR code** (94 × 94, radius 8). No illustration assets are used anywhere.
- **No shadow, gradient or texture assets** — the only gradients in the system are the 45° data hatch and nothing else.

## Files

```
design/
  Representation Dashboard.dc.html   the screen
  Design Language.dc.html            the system documentation — styling source of truth
  support.js                         runtime both files need
  image-slot.js                      drag-and-drop image placeholder component
```

Open either HTML file directly in a browser, or serve the folder statically. In `Representation Dashboard.dc.html` the mock data lives in `renderVals()` near the bottom; in `Design Language.dc.html` the same method holds the specimen data.
