# Design Language: Signal / Edge

The one visual language of Unbias AI. It is defined by the public Home page (`app/frontend/pages/Home.js` and `app/frontend/components/public/`) and applies to every surface: the contribution flow, About, installation mode, sign-in and password reset, moderation, admin, the password gate, error pages and emails. There is no second style, no "admin theme" and no light/dark variant. If a screen needs something this page does not describe, extend this page first, then the code.

Source of truth in code: `app/frontend/styles/theme.css` (tokens and utilities), `app/frontend/components/ui/` (Button, Field, Choice, Modal, MonkScale) and `app/frontend/components/public/` (header, hero, need cards, charts, banner, footer).

## Principles

1. **Flat.** Five flat colours, no gradients (except the data hatch), no transparency tricks, no blur, no soft shadows.
2. **Edged.** Square corners everywhere. Structure comes from 2px ink lines, not from tinted fills or hairlines.
3. **Dropped, not floated.** Depth is a hard offset shadow that disappears when the element is pressed.
4. **Loud type, quiet body.** Condensed uppercase Archivo for titles and figures, mono caps for labels, plain Archivo for sentences.
5. **People first.** Copy and icons talk about people, never records.

## Colour

Five colours plus ink at fixed opacities. All are Tailwind `@theme` tokens (`bg-signal`, `text-ink-72`, …).

| Token | Hex | Use |
|---|---|---|
| `ink` | `#29211f` | Text, all borders and rules, approved data, header/banner grounds |
| `cream` / `canvas` | `#fff8e8` | Page ground, inputs, text on ink |
| `signal` | `#fb4748` | Primary action, selected marker, error/status blocks. Never a data colour |
| `lime` | `#dfe75c` | Secondary stat card, hover on links, success notice, press shadow variant |
| `peach` | `#f0ad98` | Pending data, tertiary card, hover on secondary controls, hatch ground, disabled primary |
| `surface` | `#f8ebd0` | Inset panels that need a quiet ground (consent text, summaries) |
| `ink-72 / 60 / 55 / 45 / 40` | ink at that % | Body copy, secondary copy, captions, placeholders, empty values |

Rules:

- Text on `signal`, `lime`, `peach` and `cream` is `ink`. Text on `ink` is `cream`, with `peach` for secondary lines.
- Do not use red text on cream for errors: use a `notice` block.
- Data colours: approved = `data-approved` (ink), pending = `hatch`, track = `data-track` (cream), each inside a 2px ink border.
- The ten Monk Skin Tone swatches come from the API, are shown in order and labelled 1 to 10, and are never tuned. They are the only colours outside the palette.
- No Tailwind default colours (`gray-*`, `red-*`, `indigo-*`…), no `white`/`black`, no arbitrary hex values in components.

## Typography

Fonts are self-hosted (`@fontsource-variable`): **Archivo** for display and UI, **JetBrains Mono** for labels. Never load Google Fonts.

| Role | Recipe |
|---|---|
| Hero / installation figure | `font-display tabular font-extrabold font-stretch-70%`, `clamp(72px, 13vw, 148px)`, line-height `.86` |
| Page and section title | `display-caps` (Archivo 900, 75% width, uppercase), 34px page title, 24px section title, line-height `.95`–`1` |
| Large figure / code | `font-display tabular font-extrabold font-stretch-75%` |
| Label, eyebrow, nav, table head, chip | `mono-caps` (JetBrains Mono, uppercase, `.1em`), 11–13px, `font-bold` |
| Sub-heading inside a form or review | `mono-caps text-[13px] font-bold tracking-[0.12em]` |
| Item title (FAQ question, card title) | Archivo `font-bold` 19px, line-height `1.25`, sentence case |
| Body | Archivo 15.5–17px, line-height `1.5`, `ink-72` |
| Caption / hint | Archivo 13px, `ink-55` |

All figures use `tabular`. Counts are absolute and comma-grouped, never percentages in public views.

## Shape, lines and depth

- **Radius: none.** No `rounded-*` utility anywhere, including avatars, badges, spinners and close buttons. The one exception is the people-step tap marker (`marker-round`), a circle that must read as a pin on the photo.
- **Lines:** 2px `ink` (`border-2 border-ink`) for controls, cards, inputs, panels, chart tracks, header/footer rules and dividers (`divide-y-2`). Dashed 2px for "add" slots.
- **Shadows:** `shadow-hard` (6px ink), `shadow-hard-signal` (6px signal), `shadow-hard-lime` (4px lime), `shadow-hard-sm` (4px ink). Used on cards, banners, modals and thumbnails, never blurred.
- **Press:** interactive blocks use `press` (+ `press-sm`, `press-signal`, `press-lime`): the shadow halves on hover and disappears on press as the element drops into place.
- **Hatch:** `hatch`, `hatch-lg`, `hatch-well` are 45° ink stripes on peach. They mean "pending" or "well for media" and nothing else.
- **Layout:** content max width 1512px, gutter 40px (`md:px-gutter`) and 16px on mobile. Narrow flows use `max-w-lg` (steps), `max-w-md` (auth, gate), `max-w-3xl` (About), `max-w-5xl` (admin), `max-w-[1600px]` (moderation).
- **Touch targets:** at least 44px (`min-h-11`), primary buttons 56px (`min-h-14`).

## Components

| Component | Spec |
|---|---|
| **Header** (public, staff, auth, gate) | `bg-ink text-cream border-b-2`, min height 76px, eye icon 52px + `display-caps` 30px "Unbias". Nav in `mono-caps` 13px; current item `bg-signal text-ink font-bold`; others `text-peach hover:text-cream`. |
| **Button** (`ui/Button`) | `mono-caps font-bold border-2 border-ink`. `primary` signal + `press`; `ink` ink + signal shadow; `secondary` transparent, fills ink on hover; `ghost` underline. Disabled primary is peach without shadow. |
| **Field** (`ui/Field`, `inputClass`) | `border-2 border-ink bg-cream px-4 py-3`, label in `mono-caps` 12px above, hint `ink-55`, error as `notice`. Focus uses the global signal outline. |
| **Choice / MonkScale** | `border-2 border-ink bg-cream`; hover `bg-peach`; selected `bg-ink text-cream`. |
| **Notice** | `notice` utility: signal ground, ink text, 2px ink border, bold. Use `notice bg-lime` for success. Used for every error and status message. |
| **Panel** | `border-2 border-ink bg-surface p-4/5` for inset content; cards on Home use lime, peach, cream or ink grounds with `shadow-hard`. |
| **Chip / badge** | `mono-caps`, 10–11px, `border-2 border-ink`, `bg-cream`, `bg-peach` or `bg-signal`. Square. |
| **Modal** | Ink scrim (`bg-ink/80`), `border-2 border-ink bg-canvas shadow-hard-signal`, title `display-caps` 24px, square close button with 2px border. |
| **Marker** (photo person markers) | 36px square, `border-2 border-ink`, `bg-ink text-cream`; selected `bg-signal text-ink` at 125%. In the people step (`hint`) it is a `marker-round` circle, `bg-signal text-ink`. |
| **Tap hint** (`PhotoWithMarkers hint`) | Pointing hand, cream fill with 2px ink stroke, centred on the photo and bobbing up and down (`animate-tap-hint`) until the first person is marked. Never intercepts taps. |
| **Table** | `mono-caps` 11px head, `divide-y-2 divide-ink` rows, tabular figures. |
| **Links** | Ink text, underline with 4px offset, `hover:bg-lime`. Never coloured text. |
| **Progress / track** | `Track` in `public/Bars`: 2px ink border, cream track, ink approved segment, hatched pending segment. Upload progress is the same: cream track, signal fill. |
| **Footer** | `border-t-2`, `mono-caps` 12px, language toggle as 2px-bordered squares, current one `bg-ink text-cream`. |

Interactive states: hover = fill change (peach, lime or ink) or shadow drop; focus = the global 3px signal outline at 2px offset (never removed with `outline-none`); disabled = 70% opacity or peach; loading = dashed figures or a square spinner (`border-t-signal`), never a skeleton gradient. Animations are short and respect `prefers-reduced-motion`.

## Data display

Five dimension columns (age, skin tone, gender, body, visible disability / assistive devices) separated by 2px ink rules, each headed by a numbered `mono-caps` title and the target printed once ("2,000 each"). Rows are labelled bars or label-above bars; skin tone is vertical swatch columns that grow from the bottom. Approved sits first, pending hatched beside it. Targets drive bar length and are not printed per row. A bucket at zero still renders its label, swatch and empty track. See `components/public/Bars.js` and `RepresentationCharts.js`.

## Icons and imagery

- Illustrated icons in `app/frontend/images/icons/` (`icon_eye`, `icon_people`, `icon_photos`, `icon_bolt`, `icon_new_photo`) carry brand moments: header, stat cards, banner. `icon_eye` is also the favicon, app icon and the Open Graph image (`public/og-image.png`, 1200×630, built from this language).
- Utility glyphs come from `@heroicons/react` outline (1.5px stroke) and from text glyphs (`→`, `↗`, `+`, `▶`) in mono.
- No illustrations, gradients, textures or stock photography. Contributor photos appear only in hatched or bordered wells.

## Voice

Plain, short, about people. State what is true and what is needed; do not celebrate the product.

| Write | Not |
|---|---|
| Still needed | Remaining to goal |
| More people aged 75+ | Underrepresented cohort: 75+ |
| Contributions are reviewed by real people. | Every contribution is reviewed by a person before it is approved. |
| Scan to add photos from your phone | Scan to contribute on your phone |

Where a taxonomy comes from outside the product, name it and link out (the Monk Skin Tone scale links to its source).

## Outside the app

Surfaces that cannot use Tailwind follow the same tokens by hand: static error pages (`public/4xx.html`, `500.html`: cream ground, ink header, signal shadow card), emails (`app/views/layouts/mailer.html.erb`: ink header bar, cream ground, 2px ink borders, signal call to action) and the `<meta>` tags in the application layout.

## Checklist for new UI

- Square, 2px ink lines, no radius, no soft shadow.
- Only palette tokens; ink text on coloured grounds.
- `display-caps` for titles, `mono-caps` for labels, plain Archivo for sentences.
- `Button`, `Field`, `Choice`, `Modal`, `notice` before writing a new control.
- Errors in a `notice` block, not coloured text.
- 44px touch targets, visible signal focus ring.
- Strings through `t()` in EN and FR; limits from settings.

A Vitest guard (`app/frontend/lib/designLanguage.test.js`) fails the build when a forbidden pattern (`rounded-*`, Tailwind default colours, `white`/`black`, `outline-none`, a second font) appears in `app/frontend` or `app/views`.
