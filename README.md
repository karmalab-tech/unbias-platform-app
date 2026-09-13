# Unbias AI

A public, image-only contribution platform for building a consented,
human-reviewed representation dataset. Contributors upload photos, tap the
people in them, describe how each person is represented, and consent. A
moderator reviews every photo. The public dashboard and the IA·gora
installation show pending and approved people per bucket, live.

The product brief, POC design, architecture, design handoff and the phased
plan live in [`docs/`](docs). Start with `docs/PROJECT_BRIEF.md`; the
hands-on walkthrough for each pull request is `docs/TESTING_GUIDE.md`.

## Stack

- **Rails 8** (Ruby 3.3) as backend and system of record, **PostgreSQL**
- **React 19** + **Vite 5** + **Tailwind 4**, mounted by a single ERB view
- **Devise** for staff only (admin / moderator), no contributor accounts
- **Active Storage** with direct browser uploads to a private S3 bucket
  (local disk in development), thumbnails through libvips
- **Solid Queue / Solid Cache / Solid Cable** on Postgres, no Redis
- **MediaPipe** in a Web Worker for browser-side person and face detection
- **Anthropic Claude Sonnet 5** for server-side context, neutral captions
  and advisory safety flags (optional; the app works without a key)
- **Postmark** for email in production, letter_opener in development
- **RSpec**, **Vitest**, **Playwright**, RuboCop, ESLint, Brakeman

## Getting started

```bash
bundle install && yarn install
cp .env.example .env          # defaults are fine locally
bin/fetch-ml-models           # downloads the detection models into public/models
bin/rails db:prepare db:seed  # 29 representation buckets + the first admin
bin/dev                       # Rails, Vite, Tailwind and the Solid Queue worker
```

Open http://localhost:3000. Staff sign in at `/login` with the seeded admin
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, see `.env.example`).

The worker in `bin/dev` is required: a submitted photo only reaches the
moderation queue once `ProcessAssetJob` has run.

## Configuration

Everything comes from environment variables listed in `.env.example`:
storage (S3), first admin, public host, intro video, Anthropic key,
Postmark token, and the optional site-wide password gate. Product limits
(photos per contribution, people per photo, thresholds, retention windows,
model name) live in `config/unbias.yml`.

## Where things are

| Area | Location |
| --- | --- |
| Taxonomy and targets | `app/models/representation.rb`, seeded into `representation_buckets` |
| Contributor API | `app/controllers/api/` (token-scoped, see `contributor_controller.rb`) |
| Moderation and admin API | `app/controllers/api/moderation/`, `app/controllers/api/admin/` |
| Coverage counters | `app/models/coverage_stats.rb`, served by `/api/public/stats` |
| Processing pipeline | `app/services/asset_processing/` |
| Contribution flow | `app/frontend/components/contribute/` |
| Browser detection | `app/frontend/workers/detection.worker.js`, `app/frontend/lib/detection.js` |
| Public dashboard | `app/frontend/components/public/`, `app/frontend/pages/Home.js`, `Installation.js` |
| Staff screens | `app/frontend/pages/Moderation.js`, `app/frontend/pages/admin/` |
| Design tokens | `app/frontend/styles/theme.css` |
| Strings (EN / FR) | `app/frontend/i18n/locales/`, `config/locales/` |

## Tests and checks

```bash
bin/rspec                     # backend
yarn test                     # Vitest, detection helpers
yarn lint && bin/rubocop      # style
bin/brakeman --no-pager       # security scan
yarn build:vite               # production build

# Smoke test in a real browser against a test server:
RAILS_ENV=test ACTIVE_JOB_INLINE=1 bin/rails db:test:prepare db:seed
RAILS_ENV=test ACTIVE_JOB_INLINE=1 bin/rails server -p 3100 &
yarn e2e
```

CI (`.github/workflows/ci.yml`) runs Brakeman, RuboCop, ESLint + Vitest +
Vite build, RSpec, and the Playwright smoke test.

## Deployment (Fly.io)

`fly.toml` defines a `web` process (Thruster + Puma) and a `worker` process
(`bin/jobs`), with `bin/rails db:prepare` as the release command. The
Dockerfile fetches the detection models at build time.

```bash
fly launch --copy-config --no-deploy
fly secrets set RAILS_MASTER_KEY=... DATABASE_URL=... AWS_ACCESS_KEY_ID=... \
  AWS_SECRET_ACCESS_KEY=... AWS_REGION=eu-west-3 AWS_BUCKET=... \
  APP_HOST=unbias-ai.fly.dev MAILER_SENDER=... POSTMARK_API_TOKEN=... \
  ANTHROPIC_API_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... PASSWORD=...
fly deploy
```

The S3 bucket must stay private and needs a CORS rule allowing `PUT` from
the app origin for direct uploads.

## Privacy rules baked into the code

- Contributed photos are private; only aggregate counts are ever public.
- Sensitive representation fields are contributor-confirmed; machine output
  is stored separately with provider, model and prompt version.
- Browser detection never leaves the browser and never identifies anyone.
- Drafts never submitted are deleted after 24 hours; rejected photos lose
  their files after 30 days; withdrawal by contribution code removes files
  and counts.

This repository is public under the MIT license. Contributor media,
personal data, secrets and production data must never be committed.
