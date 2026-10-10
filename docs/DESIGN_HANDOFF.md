# Handoff: Representation Dashboard

> Visual styling (colour, type, shape, components, voice) lives in one place: [`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md). This file keeps what the dashboard shows, how it behaves and the data it needs. The original HTML prototypes used an earlier style and were removed; the implementation in `app/frontend/components/public/` is the reference.

## Overview

A public dashboard for a photo-contribution project. It reports how many people are represented in the image library against a goal of 10,000, breaks that down across five demographic dimensions (age, skin tone, gender, body, visible disability / assistive devices), names the biggest gaps as calls to action, and ends with a contribute prompt plus a QR hand-off to mobile. It is the Home page, and the same components are reused full-screen in installation mode.

## Structure (top to bottom)

1. **Header.** Eye icon and "Unbias", links to What is this? and Watch video, primary Contribute action. Hidden in installation mode.
2. **Hero.** Three columns that stretch to equal height: headline progress (approved count over target, caption "people represented", progress track, legend of Approved / Pending review / Still needed), optional secondary stats (`showSecondaryStats`: people represented, images contributed, contributions today), and a clickable video preview that opens the overlay.
3. **Need cards.** Up to three admin-written requests ("More people aged 75+"), each linking to the contribute flow. Copy is a request, not a metric.
4. **Representation.** Five dimension columns: age (labelled rows), skin tone (ten vertical swatch columns, with an outbound note naming the Monk Skin Tone scale), gender and body (label-above rows), visible disability / assistive devices (labelled rows). One legend for Approved and Pending; targets are printed once per column header, never per row.
5. **Contribute banner.** "Add your photos", the reassurance line "Contributions are reviewed by real people.", and a QR code (`showQr`) to continue on a phone.
6. **Footer.** Navigation, source link and language toggle.

Breakpoints: hero columns stack (progress, video, stats); the five chart columns wrap to 2-up then 1-up; need cards go 1-up; the vertical swatch chart stays vertical at every width.

## Interactions and behaviour

- **Video overlay.** Opens from the hero preview or the header link; closes on Escape, scrim click or the Close button; focus moves into it and returns on close.
- **Polling.** Stats refresh on `stats_poll_seconds` (installation: `installation_poll_seconds`), served with an ETag.
- **Loading.** Tracks render at full width with no fills and figures show an em dash, never a spinner.
- **Empty.** A bucket at 0 still renders its label, swatch and an empty track.
- **Error / offline.** A single mono-caps line under the charts; the last loaded numbers stay visible.
- **Flags.** `showSecondaryStats` and `showQr` stay as props; bar shape is square system-wide.

## State and data

Everything is derived from counts. Each dimension bucket needs `{ label, approved, pending, target }`; bar segment widths are `min(100, value / target * 100)` percent, with approved and pending drawn as sibling flex children of the track so they stack without overlapping. `GET /api/public/stats` returns the shape:

```
total:      { approved, pending, target }
secondary:  { peopleRepresented, imagesContributed, contributionsToday }
dimensions: [ { id, title, form: 'rows' | 'columns' | 'label-above',
                buckets: [{ label, swatch?, approved, pending, target }, …] }, … ]
needs:      [{ copy, related_bucket, filter }, …]
```

Formatting: counts are absolute and comma-grouped, never percentages; all figures use tabular numbers.

**Monk Skin Tone scale.** Ten fixed reference swatches, always in order, always labelled 1 to 10. Not brand colours; do not tune them.

```
#f6ede4  #f3e7db  #f7ead0  #eadaba  #d7bd96
#a07e56  #825c43  #604134  #3a312a  #292420
```

## Assets

- **Fonts.** Archivo and JetBrains Mono, self-hosted through `@fontsource-variable`.
- **Icons.** Illustrated PNG icons in `app/frontend/images/icons/`, Heroicons outline for utility glyphs (see the Icons section of `DESIGN_LANGUAGE.md`).
- **Images.** The hero video poster and the QR code (`/qr.svg`) are the only imagery on the dashboard.
