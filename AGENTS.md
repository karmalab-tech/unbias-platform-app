# Unbias AI — AI Assistant Guide

> `CLAUDE.md` and `.github/copilot-instructions.md` are symlinks to this file, so Claude Code, GitHub Copilot, and Codex all read the same source of truth.

Unbias AI is a public, image-only contribution platform building a consented, human-reviewed representation dataset. Canonical product and architecture specs live in `docs/` (`PROJECT_BRIEF.md`, `POC_DESIGN.md`, `TECHNICAL_ARCHITECTURE.md`, `DESIGN_LANGUAGE.md`, `DESIGN_HANDOFF.md`, `IMPLEMENTATION_PLAN.md`). Read them before changing product behaviour. `docs/FUTURE_IMPROVEMENTS.md` and `IMPLEMENTATION_PLAN.md` §7 list what is deliberately out of scope; do not add any of it without an explicit scope change.

## Where the project stands

- All eight phases of `docs/IMPLEMENTATION_PLAN.md` are implemented and merged: contribution flow, browser-side detection, server-side processing with Claude, moderation, public dashboard, installation mode, admin, EN + FR, CI with RSpec + Vitest + Playwright. `docs/TESTING_GUIDE.md` is the click-through walkthrough of every feature and the place to document any new one.
- Product decisions (hero counts approved people only, admin-managed calls to action, "today" = last 24 h, drafts purged after 24 h, rejected media kept 30 days, Claude Sonnet 5 with a small budget, EN + FR, Fly.io + S3, Postmark) are recorded in the status line and §3 of `IMPLEMENTATION_PLAN.md`. Do not reopen them silently.
- Open items, in order: run one real Claude enrichment with an API key and check the description never names sensitive attributes; tune the Monk suggestion on a diverse set (FACET subset, provided by the product owner); replace the placeholder consent wording and bump `consent_version`; first Fly.io deployment (private S3 bucket with a CORS `PUT` rule, secrets from `.env.example`, intro video URLs); keep the `PASSWORD` gate until launch.
- Work ships as a few milestone PRs, each with its own section in `docs/TESTING_GUIDE.md` so a reviewer can test by clicking. CI must be green before asking for review.

## Tech Stack

| Layer            | Technology                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| Backend          | Ruby 3.3.7, Rails 8.0.2, PostgreSQL                                    |
| Asset pipeline   | Propshaft + jsbundling-rails (esbuild) + cssbundling-rails + vite_rails |
| Frontend         | React 19, Vite 5, Tailwind CSS 4, Heroicons outline, React Router 7    |
| Browser ML       | `@mediapipe/tasks-vision` (EfficientDet-Lite0 people, BlazeFace faces) in a classic Web Worker |
| Server ML        | `anthropic` gem, model and limits in `config/unbias.yml`               |
| Auth             | Devise for staff only (admin / moderator roles, JSON endpoints, no public sign-up) |
| Background jobs  | Solid Queue on PostgreSQL (Active Job adapter), recurring jobs in `config/recurring.yml` |
| Caching / Cable  | Solid Cache, Solid Cable                                               |
| Storage          | Active Storage → AWS S3 (production), local disk (development); direct uploads |
| Images           | ruby-vips via `image_processing` (variants, hashes, sharpness)         |
| Serialization    | Alba (`app/serializers/`)                                              |
| Mail             | Postmark SMTP in production when `POSTMARK_API_TOKEN` is set, letter_opener in dev |
| QR               | `rqrcode` (`/qr.svg`)                                                  |
| Config           | dotenv-rails (`.env`, see `.env.example`); product limits in `config/unbias.yml` |
| Testing          | RSpec, Vitest 2, Playwright (`e2e/`)                                   |
| Linting / tools  | RuboCop (rails-omakase), Brakeman, ESLint 9, Prettier 3, annotaterb, pry-rails |
| Deploy           | Fly.io (`fly.toml`: `web` + `worker` processes), Dockerfile fetches ML models |
| Node             | 22.14 (`.node-version`)                                               |

## Development

- Copy `.env.example` to `.env`; defaults work locally. `bin/fetch-ml-models` downloads the detection models into the gitignored `public/models` (required for detection, also run in CI and the Dockerfile).
- `bin/rails db:prepare db:seed` creates the 29 representation buckets and the first admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- `bin/dev` runs `Procfile.dev` via foreman: `rails server`, `yarn build --watch`, `yarn build:css --watch`, `bin/vite dev` (HMR), and `bin/jobs` (Solid Queue worker). All are required; a submitted photo only reaches moderation once `ProcessAssetJob` has run.
- Checks: `bin/rspec`, `yarn test` (Vitest), `yarn lint`, `bin/rubocop`, `bin/brakeman --no-pager`, `yarn build:vite`. Run `yarn format` (Prettier) before editing frontend files by script: Prettier reflows code, so string-based edits against stale text miss silently.
- Smoke test: `RAILS_ENV=test ACTIVE_JOB_INLINE=1 bin/rails db:test:prepare db:seed`, start the server the same way on port 3100, then `yarn e2e`. `ACTIVE_JOB_INLINE` switches the test adapter to `:inline`. Reset the test database (`bin/rails db:test:prepare`) after an e2e run before running RSpec again.
- Models are annotated with `bundle exec annotaterb models` after migrations.

## Frontend Conventions

- React code lives in `app/frontend/` (not `app/javascript/`); entrypoint is `app/frontend/entrypoints/application.js`, mounted into `<div id="root">` by `app/views/app/index.html.erb`.
- **Functional components only**, no class components.
- JSX is written in `.js` files — `vite.config.mts` loads `.js` with the `jsx` esbuild loader.
- React 19 automatic JSX — do **not** `import React from "react"`.
- Import alias `~/` → `app/frontend/` is provided by `vite-plugin-ruby` at build time, and mirrored in `eslint.config.mjs` and `jsconfig.json` so linting and editors resolve it too. Keep those two in sync.
- Tailwind 4 via `@tailwindcss/vite` (dev HMR) and `@tailwindcss/cli` (prod build from `app/assets/stylesheets/application.tailwind.css`). `prettier-plugin-tailwindcss` sorts classes — don't reorder by hand.
- Icons come from `@heroicons/react` outline set (1.5px stroke) plus the illustrated PNGs in `app/frontend/images/icons/`.
- There is one visual language, **Signal / Edge**, defined by the Home page and documented in `docs/DESIGN_LANGUAGE.md`; it applies to every screen, including contribute, staff, admin, auth, the password gate, error pages and emails. Square corners, 2px ink lines, flat palette tokens, hard offset shadows, `display-caps` titles and `mono-caps` labels. Never introduce another style, a Tailwind default colour, `rounded-*` or soft shadows; `app/frontend/lib/designLanguage.test.js` fails on them. Update the doc first when the language needs to grow.
- Design tokens live in `app/frontend/styles/theme.css` as Tailwind `@theme` variables and utilities (`bg-canvas`, `text-ink-60`, `bg-signal`, `font-display`, `hatch`, `press`, `notice`, `display-caps`, `mono-caps`…). Fonts are self-hosted via `@fontsource-variable` (Archivo, JetBrains Mono); never load Google Fonts. Reuse `ui/Button`, `ui/Field`, `ui/Choice`, `ui/Modal` and `notice` before writing a new control. `docs/DESIGN_HANDOFF.md` covers the dashboard's structure, behaviour and data.
- New pages are client-side routes inside React (React Router in `app/frontend/components/App.js`), not ERB views. Any HTML `GET` not owned by Rails falls through to the SPA (see the catch-all in `config/routes.rb`).
- User-facing strings go through `t()` from `~/i18n`; add keys to `app/frontend/i18n/locales/{en,fr}.js` (plural forms are `{ one, other, zero }` objects). Locale is detected once at import time from the browser; `?lang=fr` forces it.
- Product limits come from `/api/public/settings` through `loadSettings()` / `useSettings()` in `~/lib/settings`; never hard-code a limit in the frontend. Await `loadSettings()` before logic that depends on it.
- Browser-side detection lives in `app/frontend/workers/detection.worker.js` (classic worker: MediaPipe needs `importScripts`, never `{ type: "module" }`) with pure helpers and Vitest tests in `app/frontend/lib/detection.js`. Detection output is a proposal the contributor confirms; it never writes annotations by itself.
- Read boolean query-string toggles with `useQueryFlag("present")` rather than parsing `location.search` directly — it stays in sync when another component rewrites the URL.
- Polling uses `usePolling` from `~/lib/usePolling` with intervals from settings (`stats_poll_seconds`, `installation_poll_seconds`).
- Uploads go through `DirectUpload` from `@rails/activestorage` (`directUpload()` in `~/lib/contribution`); it adds the CSRF header itself, do not add a second one.

## Contributor Identity

- Contributors never have accounts. `Submission.start!` creates a draft and returns a one-time session token; only its SHA-256 digest is stored. The browser keeps the token in localStorage (`readToken` / `writeToken`) and sends it as `X-Submission-Token`; `Api::ContributorController` resolves it and rejects withdrawn submissions.
- The token is accepted as `?token=` only on the `image` action so `<img>` previews work after a reload (`tokenizedUrl` helper); `token` is in `filter_parameter_logging`.
- After submit the contributor receives a public code `UNB-XXXX-XXXX` (Crockford base-32). Admins look it up at `/admin` to withdraw a submission or a single photo.
- Drafts never submitted are purged after `draft_ttl_hours` by `PurgeStaleDraftsJob`.

## Auth Conventions

- A site-wide password gate sits in front of everything, independent from Devise. `SitePasswordProtection` (included in `ApplicationController`) redirects HTML requests to `/unlock` and returns `401` JSON until the visitor submits `ENV["PASSWORD"]`; the unlocked state is a digest stored in the Rails session. Blank/unset `PASSWORD` disables the gate entirely, which is the default.
- Devise is API-style and staff-only: custom controllers under `app/controllers/users/` (`sessions`, `passwords`) respond with JSON, not HTML. Registrations are disabled; admins create moderators (`User#invite!`), who receive a set-your-password email.
- `users.role` is `moderator` or `admin`. Controllers guard with `require_staff!` / `require_admin!` from `StaffAuthorization`; staff APIs inherit from `Api::Staff::BaseController` (signed image URLs), admin APIs from `Api::Admin::BaseController`.
- Failed authentication returns `401 { error: … }` via `JsonFailureApp` (defined in `config/initializers/devise.rb`) instead of redirecting.
- The React frontend talks to Devise through `app/frontend/lib/api.js` (adds the CSRF token + `Accept: application/json`) and `app/frontend/lib/auth.js` (`AuthProvider` / `useAuth`). `GET /current_user` returns the signed-in user. Staff pages load data inside `StaffShell` so nothing is fetched before the auth guard resolves.
- Auth screens live in `app/frontend/pages/` (`Login`, `ForgotPassword`, `ResetPassword`). The password-reset email links to the React `/reset-password` route (`app/views/devise/mailer/reset_password_instructions.html.erb`).

## Backend Conventions

- Follow `rubocop-rails-omakase`.
- Controllers stay thin; keep business logic in models (`Submission#submit!`, `Asset#approve!` / `#reject!`, `Submission#withdraw!`).
- Product limits are read from `Rails.configuration.x.unbias` (`config/unbias.yml`), never literal numbers.
- Jobs in `app/jobs/` call a single method on a model or service; they run on Solid Queue, backed by the primary Postgres database. Recurring jobs live in `config/recurring.yml`.
- Anything that changes counts (submit, moderation, withdrawal, targets, calls to action) must call `CoverageStats.bump!`; `/api/public/stats` is cached in Solid Cache under that version key and served with an ETag.
- Serialize JSON with Alba (see `app/serializers/`).
- Use Solid Cache for caching and Solid Cable for Action Cable.
- Asset statuses: `draft → processing → pending_moderation → approved | rejected`, plus `withdrawn`. `processing` already counts as pending on the dashboard.

## Processing Pipeline

- `AssetProcessing::Pipeline` runs per asset from `ProcessAssetJob`, in order: `technical` (vips: dimensions, SHA-256, dHash, Laplacian sharpness), `duplicate` (exact hash, then Hamming ≤ `phash_max_distance`), release to `pending_moderation`, then the Claude steps `vlm_context_caption` and `vlm_safety`. Moderation never waits for the model.
- Every step writes one `AssetEnrichment` row (`kind` in `AssetEnrichment::KINDS`) with `provider`, `model`, `prompt_version` and `raw_response`; finished steps are skipped on re-run. Bump the `PROMPT_VERSION` constant whenever a prompt changes.
- Machines never write contributor fields on `person_annotations`. Flags (`ModerationFlags.for(asset)`) are advisory chips for moderators, never automatic rejections.
- `VlmClient` uses the `anthropic` gem with JSON-schema output; the vocabulary is closed (`AssetProcessing::Vocabulary`). Transient API errors raise `Pipeline::Retry`, which the job retries with backoff. Without `ANTHROPIC_API_KEY` the VLM steps fail soft and the asset shows a "processing failed" flag.
- Open vips images with random access (`access: :sequential` breaks the multi-pass hashes).

## Testing Conventions

- Request specs cover every API namespace; model specs cover transitions and code generation; `spec/services/asset_processing_pipeline_spec.rb` stubs the VLM client. Helpers in `spec/support/builders.rb` build submissions and clear `Rails.cache` before each example (the test env uses `:memory_store` so ETags are stable).
- Vitest is for pure frontend helpers (`*.test.js` next to the module); Playwright (`e2e/contribution.spec.mjs`) walks contribute → moderate → dashboard against a running server and is the only browser test. Keep it a single smoke path.
- Test photos must never be committed. Use `spec/fixtures/files/` (synthetic) or download to a scratch directory outside the repo.

## Repository Hygiene

- The repository is public under MIT. Contributor media, personal data, secrets, production data and ML models (`public/models`) never enter git.
- Do not put model identifiers of the assistant in commits, PRs or code comments.
- Commit messages are short imperative sentences describing the change.
- Never commit to `main` or a detached HEAD: create a new branch, commit there and push it with `git push -u origin <branch>`.

## General

- Prefer clarity over cleverness.
- No commented-out code or debug logs.
- Keep this file short — expand it as real patterns emerge in the project.

## Comments

- Default to no comments; well-named code speaks for itself.
- One line max. Never multi-line blocks or paragraph explanations.
- Only write one for a non-obvious WHY: a hidden constraint, a subtle invariant, a workaround. Never explain WHAT the code does.
