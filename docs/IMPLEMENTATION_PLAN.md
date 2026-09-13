# Unbias AI — POC Implementation Plan

> Status: **proposal, awaiting answers** to the open questions listed at the end (tracked in Notion).
> Written after reading every file in `docs/` (brief, POC design, technical architecture, future improvements, design handoff, presentation deck, design prototypes) and the full starter repository.

## 1. Where the repository stands

The repo is the untouched KarmaLab Rails + React + Vite template plus the `docs/` folder. What matters for the POC:

| Area | Current state | Consequence |
| --- | --- | --- |
| App name | Placeholder `RailsReactVite` / `rails_react_vite` in `config/application.rb`, `config/database.yml`, `config/deploy.yml`, `Dockerfile`, PWA manifest, README, AGENTS.md | Must be renamed before any feature code (template rule). |
| Auth | Devise with `:registerable`; React `Signup` page; JSON endpoints; `JsonFailureApp` | Public self-registration must go. Roles do not exist yet. |
| Site gate | `SitePasswordProtection` via `PASSWORD` env | Useful for the staging build; disabled by default. |
| Jobs / cache / cable | Solid Queue, Solid Cache, Solid Cable on Postgres, `bin/jobs` worker in `Procfile.dev` | Exactly what the architecture doc asks for. Nothing to add. |
| Storage | Active Storage: local disk in dev, S3-compatible in prod (`AWS_ENDPOINT_URL_S3`, `BUCKET_NAME` supported) | Already supports Tigris/R2/S3. Direct browser uploads come for free (`ActiveStorage::DirectUploadsController`). |
| Images | `image_processing` + libvips in the Dockerfile | Thumbnails, EXIF rotation, hashes and blur metrics can all be done with ruby-vips, no extra service. |
| Serialization | Alba | Use for every JSON endpoint. |
| Frontend | React 19, React Router 7, Tailwind 4, Heroicons, `t()` i18n (en/fr), `useQueryFlag`, `api.js` wrapper | Design system will be Tailwind tokens; Heroicons outline (1.5px stroke) matches the design's line-icon spec. |
| Deploy | Kamal config (`config/deploy.yml`, `.kamal/`) and a production Dockerfile | Brief says Fly.io. The Dockerfile is reusable; Kamal files become dead weight. |
| CI | Brakeman, RuboCop, ESLint + Vite build, RSpec with Postgres | Keep. Add frontend unit tests when the ML/flow logic exists. |
| Tests | 2 request specs, 1 empty model spec | Everything else is greenfield. |
| Hygiene | `.DS_Store` files committed (root and `docs/`) | Remove and ignore. |

## 2. Conflicts between the documents

Per the brief, conflicts are surfaced rather than silently resolved. Each one has a recommendation and an open question in Notion.

| # | Conflict | Sources | Recommendation |
| --- | --- | --- | --- |
| C1 | Hero number: the dashboard prototype shows `6,482 / 10,000` as **approved only** (pending 428 shown separately). The deck shows `6,482 / 10,000` as **approved 5,801 + pending 681**. | `DESIGN_HANDOFF.md` vs `PROJECT_PRESENTATION.pdf` p.9 | Headline = approved only; pending drawn as the hatched segment. Dataset membership is what the milestone counts. |
| C2 | "We need…" cards: **admin-written CRUD, max 3 active** vs "expected to be **data-driven** in production, computed from the buckets furthest from target". Automatic scarcity recommendations are explicitly deferred. | `POC_DESIGN.md` §10/§12, `PROJECT_BRIEF.md` vs `DESIGN_HANDOFF.md` Band 2; `FUTURE_IMPROVEMENTS.md` §13 | Admin-managed. An optional `related_bucket` picks the card tint and icon so the visual stays data-flavoured. |
| C3 | Public header `What is this? · Watch video · Contribute` is specified, but the dashboard design has **no header** (kiosk frame). | `POC_DESIGN.md` §10 vs `DESIGN_HANDOFF.md` | Add the minimal header on the website; hide it in installation mode. |
| C4 | Per-bucket targets: spec says each bucket **shows approved, pending, target, total**; design says targets drive bar length but are **not printed** ("made the charts unreadable"). | `POC_DESIGN.md` §10 vs `DESIGN_HANDOFF.md` State & data | Follow the design (no per-row target) and print the target once per dimension in the column header (e.g. "2,000 each"). |
| C5 | Secondary stats (`Images contributed`, `Contributions today`) exist in the design's public hero but the spec lists image count only on the **admin** dashboard. | `DESIGN_HANDOFF.md` Column B vs `POC_DESIGN.md` §12 | Keep them public behind the `showSecondaryStats` flag; define "contributions today" as images submitted since local midnight. |
| C6 | Persistence before consent: the deck says "**Nothing is stored** until the contributor gives explicit consent". The architecture mandates **progressive persistence** (upload → draft asset in storage before the consent step). | `PROJECT_PRESENTATION.pdf` p.7 vs `TECHNICAL_ARCHITECTURE.md` §9 | Progressive persistence, plus a recurring job that hard-deletes drafts never submitted after 24 h. Consent is required to reach `submitted`. The deck's sentence then means "nothing enters the dataset". |
| C7 | The advisory **"possible minor"** flag requires age estimation, while the VLM **must not infer age** or any sensitive attribute. | `POC_DESIGN.md` §9 flags vs §7 captioning rules | Run a separate safety-only prompt that returns booleans (`possible_minor`, `unsafe_content`, `possible_synthetic`) and stores nothing else; or drop the flag for the POC. |
| C8 | Skin tone target is **1,000** per Monk tone in the spec; the dashboard mock uses **1,100**. | `POC_DESIGN.md` §5 vs prototype `renderVals()` | 1,000. Treat the mock as placeholder data. |
| C9 | Disability "Other" label: "Other assistive device / visible disability" vs "Other assistive device". | `POC_DESIGN.md` §4 vs prototype | Use the long form in data, the short form in charts. |
| C10 | Deployment: **Fly.io** in the brief; **Kamal** in the repo. | `PROJECT_BRIEF.md` vs `config/deploy.yml` | Add `fly.toml` with `web` and `worker` process groups; delete Kamal files. |

## 3. Technical decisions (recommendations)

Each item marked **(Q)** has a question in Notion; the rest are routine calls I will make unless told otherwise.

### 3.1 Storage and uploads — Active Storage direct uploads **(Q)**
Use Active Storage as-is: the browser asks Rails for a blob (`POST /rails/active_storage/direct_uploads`), receives a short-lived signed PUT URL, uploads straight to the private bucket, then attaches the signed blob id to a draft `Asset`. This is exactly the sequence in `TECHNICAL_ARCHITECTURE.md` §6 with zero custom presign code. Blob `key`, `checksum`, `byte_size`, `content_type` and analyzed `width/height` replace the `storage_key` / `file_hash` columns. Private reads go through a controller that authorizes (staff, or the contributor's submission token) and redirects to `blob.url(expires_in: 5.minutes)`. Bucket needs a CORS rule for PUT from the app origin. Provider: Tigris (Fly-native, S3 API, already supported by `config/storage.yml`).

### 3.2 Data model — typed contributor columns + separate machine-output table **(Q)**
The docs suggest a generic `MetadataValue` (field/value/source) table. For the POC I recommend a hybrid that keeps the provenance guarantee with far simpler queries:

- `person_annotations` holds the **contributor-confirmed** fields as typed columns (`age_bucket`, `skin_tone_confirmed`, `gender`, `body`, `disability_tags[]`) plus `skin_tone_auto`, `detection_region` (jsonb), `detection_source` (`detector` | `manual`). Source is contributor by definition, and the coverage SQL is a plain `GROUP BY`.
- `asset_enrichments` holds every **machine** output as one row per check/enrichment: `kind`, `result` (jsonb), `confidence`, `provider`, `model`, `model_version`, `prompt_version`, `raw_response`, `status`, `error`. Nothing machine-made ever touches a contributor column.

This matches "never silently overwrite one source with another" and the moderator-only approve/reject rule. If moderator corrections arrive later (`FUTURE_IMPROVEMENTS.md` §10) a `metadata_corrections` table is added then.

### 3.3 Contributor session ownership
No account exists, so a draft `Submission` is owned by a random `session_token` (64 bits+, returned once, kept in `localStorage`, sent as an `X-Submission-Token` header). It authorizes every write and every private read of that submission's images until `submitted`. The public code `UNB-XXXX-XXXX` (Crockford base-32, no ambiguous glyphs, ~40 bits) is generated at submit and shown on the success screen. Rails 8 `rate_limit` guards submission creation and upload registration.

### 3.4 Browser-side ML — MediaPipe Tasks Vision **(Q)**
- Person detection: MediaPipe **Object Detector** (EfficientDet-Lite0, COCO `person` class, float16). Filter by score and relative area (start at 5 % of image area, configurable) and suppress overlaps.
- Face regions: MediaPipe **Face Detector** (BlazeFace short-range) only to locate a skin patch per person; nothing biometric is stored.
- Monk suggestion: median colour of the central face patch (excluding highlights/shadows) → CIELAB → nearest of the 10 reference Monk swatches. Returns `null` when no face or low confidence.
- Models self-hosted under `public/models/` (Apache-2.0), loaded lazily after the permission step so the upload screen stays fast. Runs in a Web Worker. All of it is optional: every failure path degrades to "tap the people" and "pick from the scale".

### 3.5 Server-side processing pipeline (Solid Queue, per asset)
`ProcessAssetJob` runs a fixed step list, each idempotent and recorded in `asset_enrichments`:
1. `technical`: dimensions, EXIF orientation, min-side check, SHA-256 (from blob checksum), dHash perceptual hash, Laplacian-variance blur score — all ruby-vips, no external calls.
2. `duplicate`: exact hash and Hamming distance on dHash against existing assets.
3. `vlm_context_caption` and `vlm_safety`: Anthropic Claude via the `anthropic` gem, model `claude-opus-5`, structured output constrained to the strict vocabulary JSON schema; stores raw response, model id, prompt version. **(Q)**
4. Transition to `pending_moderation` regardless of enrichment failures; a `processing_failed` flag is shown to moderators.

### 3.6 Staff authentication and roles
Add `role` enum (`moderator`, `admin`) to `users`; drop `:registerable` and the Signup page; keep sessions/passwords. Admin adds a moderator by email → Devise sends a reset-password mail as the "set your password" invite. First admin created by `db/seeds.rb` from `ADMIN_EMAIL`. Authorization is two `before_action`s (`require_staff!`, `require_admin!`); no gem.

### 3.7 Coverage counters and "real time"
One SQL aggregate over `person_annotations` joined to asset status (approved vs pending = `submitted|processing|pending_moderation`), grouped per dimension bucket, plus overall totals. Cached in Solid Cache under a version key bumped on submit, approve, reject and withdraw. `GET /api/public/stats` returns the exact JSON shape from `DESIGN_HANDOFF.md` (total, secondary, dimensions[].buckets[], needs[], updated_at) with an ETag. The dashboard polls every 5 s, the installation every 3 s.

### 3.8 Design system in Tailwind
Tokens from `DESIGN_HANDOFF.md` become `@theme` variables in `application.css` (colours, radii, spacing, fonts). Fonts Archivo and Instrument Sans are **self-hosted** via `@fontsource` packages rather than Google Fonts (public installation in the EU; no third-party requests). Data hatch is a utility class. Icons: Heroicons outline where a match exists, hand-written SVG for silhouettes and the Monk scale. `barShape`, `showSecondaryStats`, `showQr` kept as props.

### 3.9 Deployment
`fly.toml` with `[processes] web = "bin/thrust bin/rails server"` and `worker = "bin/jobs"`, release command `bin/rails db:prepare`, region and Postgres flavour to confirm **(Q)**. Secrets via `fly secrets`. Remove Kamal.

### 3.10 Email
`ContributionCodeMailer` delivered with `deliver_later`; provider via SMTP env vars **(Q)**. Opt-in stored as its own boolean; never inferred from the email.

## 4. Data model

```
users                  id, email, encrypted_password…, role (enum), created_at
submissions            id, public_code (uniq, nullable until submitted), session_token_digest,
                       status (draft|submitted|processing|pending_moderation|reviewed|withdrawn),
                       permission_confirmed_at, email, updates_opt_in, submitted_at, locale, created_at
consents               id, submission_id, training_allowed, public_display_allowed,
                       consent_version, accepted_at, withdrawn_at
assets                 id, submission_id, position, status (draft|uploaded|processing|pending_moderation|
                       approved|rejected|withdrawn), processing_state, width, height, content_type,
                       byte_size, sha256, phash, moderated_at   + has_one_attached :original
person_annotations     id, asset_id, person_index, detection_region (jsonb), detection_source,
                       age_bucket, skin_tone_auto, skin_tone_confirmed, gender, body,
                       disability_tags (string[]), completed_at
asset_enrichments      id, asset_id, kind, status, result (jsonb), confidence, provider, model,
                       model_version, prompt_version, raw_response (jsonb), error, created_at
moderation_decisions   id, asset_id, moderator_id, decision (approve|reject), reason (enum), created_at
representation_buckets id, dimension, value, label, display_order, target_count, swatch (skin only)
public_calls_to_action id, caption, related_bucket_id (nullable), active, display_order
```
Taxonomy values are enums in code; `representation_buckets` is seeded from them and only `target_count` is editable.

## 5. API surface (JSON, Alba)

```
Public       GET  /api/public/stats                      counters + needs + updated_at
Contributor  POST /api/submissions                       → { id, session_token }
             PATCH /api/submissions/:id                  permission, consent, email
             POST /api/submissions/:id/assets            attach signed blob id → draft asset
             DELETE /api/submissions/:id/assets/:aid
             PUT  /api/submissions/:id/assets/:aid/people   confirmed people + annotations (bulk)
             POST /api/submissions/:id/submit            → { public_code, people_count }
             POST /api/submissions/:id/email_code
             GET  /api/submissions/:id/assets/:aid/image → 302 signed URL (token-scoped)
Staff        GET  /api/moderation/queue                  oldest pending first + summary counts
             GET  /api/moderation/assets/:id             review payload
             POST /api/moderation/assets/:id/approve | /reject
Admin        GET  /api/admin/dashboard
             CRUD /api/admin/calls_to_action
             GET/PATCH /api/admin/buckets                target_count only
             GET/POST/DELETE /api/admin/moderators
             GET  /api/admin/submissions/lookup?code=    withdrawal support (Q)
```
React routes: `/`, `/about`, `/faq`, `/contribute/*`, `/installation`, `/login`, `/moderation`, `/admin/*`. Everything else stays on the existing SPA catch-all.

## 6. Phases

Each phase ends with something demoable and its own RSpec coverage. Phases 1–4 together deliver the brief's "first useful milestone".

### Phase 0 — Foundation (½ day)
Rename template to the confirmed app name; remove `:registerable`, Signup page, Kamal files, `.DS_Store`; add `role` to users, `require_staff!`/`require_admin!`, seeds for first admin; `fly.toml`; design tokens + self-hosted fonts in Tailwind; `.env.example` entries for every new variable; update `AGENTS.md` with the new conventions.

### Phase 1 — Core data model and taxonomy (1 day)
Migrations for every table in §4, models with validations and status enums, taxonomy module (`Representation::AGE`, `SKIN_TONE`, …) with labels for `en`/`fr`, bucket seeding with the spec's targets, model specs for transitions and public-code generation.

### Phase 2 — Contribution flow without ML (3–4 days)
Contributor API with session-token auth and rate limits; Active Storage direct upload wiring in React (`DirectUpload` from `@rails/activestorage`), per-file progress and retry; screens Upload → Permission → People (manual tap to add, numbered markers) → Annotation (one person at a time, four required fields, optional tags) → Review grid → Consent → Success with code, copy button and email modal. State persisted after every step; reload resumes from `localStorage` token. Mobile-first, EN + FR strings. Draft-purge recurring job. Request specs for the lifecycle and consent persistence.

### Phase 3 — Moderation (2 days)
Queue with summary line, review screen (signed image, numbered people, contributor labels, enrichment panel with graceful "not available", flags, code, date), approve/reject with predefined reasons, transaction that writes the decision, updates asset status and bumps the stats cache version, keyboard shortcuts `A`, `R`, `1–9`, `←/→`. Authorization specs.

### Phase 4 — Public dashboard, stats API and admin (3 days)
`Stats` query object + Solid Cache; `/api/public/stats`; dashboard implementing the handoff bands (hero, need cards, five chart columns incl. vertical Monk swatches, contribute banner with QR); header per C3; About/FAQ pages; responsive rules (stack hero, 2-up then 1-up charts); loading/empty states per handoff; polling hook. Admin: dashboard numbers, CTA CRUD (max 3 active enforced in model), target editing, moderator list with invite mail. **→ First useful milestone.**

### Phase 5 — Browser-side detection and Monk suggestion (3 days)
Web Worker with MediaPipe object + face detectors, size/confidence filtering, overlap suppression, canvas markers on the original image, remove/add corrections, Monk estimation with explicit confirmation UI, `skin_tone_auto` persisted separately. Fixture set of diverse test images kept **out of the repo**; Vitest tests for filtering and Monk mapping with recorded detector outputs.

### Phase 6 — Server-side processing (2–3 days)
`ProcessAssetJob` steps from §3.5, `anthropic` gem client with strict-vocabulary schema and prompt versioning, duplicate detection, blur/resolution flags, `processing_failed` flag, retries with `retry_on`, enrichment panel wired into moderation. Specs with the API stubbed.

### Phase 7 — Installation mode, email, withdrawal support (1–2 days)
`/installation` route: no header, larger type, QR + short URL, faster polling, subtle count-up on change, `prefers-reduced-motion`. Contribution-code mailer + provider config. Admin lookup-by-code page with per-asset withdraw (purges blob, sets `withdrawn`, stops counting).

### Phase 8 — Testing, accessibility, polish (2 days)
Keyboard and screen-reader pass on the flow and moderation, focus styles per handoff, colour contrast of hatched segments, Playwright smoke test of the full contribution path against the test env, Brakeman/RuboCop/ESLint clean, README rewrite for the real project (setup, env vars, deploy, data-privacy rules for contributors of code).

Rough total: 18–21 working days of implementation, excluding waiting on legal copy and provider accounts.

## 7. Guardrails (explicitly out of scope)
No dataset export, LoRA training, video, partial-permission blurring, unique-person tracking, contributor accounts, self-service withdrawal, moderator metadata editing, editable taxonomy, automatic CTA recommendations, automatic gender/body inference, intersection analysis. Any of these needs a deliberate scope change first.

## 8. Open questions
Every **(Q)** above and every conflict in §2 is a toggle on the Notion page "Unbias AI (Inrō workspace)". Answers there unblock the corresponding phase; Phase 0 and 1 can start as soon as the app name and data-model shape are confirmed.
