# Unbias AI

A public, image-only contribution platform for building a consented,
human-reviewed representation dataset. See `docs/` for the product brief,
POC design, architecture and implementation plan.

## Stack

- **Rails 8** (Ruby 3.3), **PostgreSQL**
- **React 19** + **Vite 5** (HMR) + **Tailwind CSS 4.3** + **Heroicons** + **React Router**
- **Devise** for auth, with React login / signup / password views (JSON endpoints)
- **Solid Queue** on Postgres as the Active Job backend (no Redis)
- **Active Storage** on **S3-compatible storage** (local disk in development)
- **Alba** for JSON serialization
- **letter_opener** to preview emails in development
- **RSpec** for testing, **annotaterb** for schema annotations, **pry-rails**, **dotenv-rails**

## Getting started

```bash
bundle install
yarn install

cp .env.example .env      # then fill in the values

bin/rails db:prepare      # create + migrate

bin/dev                   # or: yarn dev
```

`bin/dev` runs everything in `Procfile.dev` (Rails server, esbuild/Tailwind
watchers, the Vite dev server, and a Solid Queue worker). The app is served at
http://localhost:3000.

## Environment variables

Configured via `dotenv-rails`; see `.env.example`:

| Variable                                                                    | Purpose                                                         |
| --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `PASSWORD`                                                                  | Site-wide password gate. Unset/blank disables it (the default). |
| `MAILER_SENDER`                                                             | Default "from" address for Devise mail                          |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_BUCKET` | Active Storage S3 (production)                                  |
| `AWS_ENDPOINT_URL_S3` / `BUCKET_NAME`                                       | Non-AWS S3 providers (Tigris, R2, MinIO, …)                     |
| `DB_POOL`                                                                   | Active Record pool size. Defaults to `RAILS_MAX_THREADS`.       |

## Authentication

Devise is set up as a JSON API consumed by React:

- Endpoints live under `/users/*` via custom controllers in `app/controllers/users/`.
- React screens are in `app/frontend/pages/` (`Login`, `ForgotPassword`, `ResetPassword`).
- `GET /current_user` returns the signed-in user; `app/frontend/lib/auth.js` exposes `useAuth()`.

## Site password gate

`SitePasswordProtection` (included in `ApplicationController`) puts a single
shared password in front of the whole app — useful for staging and client
previews, and unrelated to Devise sign-in.

- Set `PASSWORD` to switch it on; leave it unset or blank and the gate is a
  no-op, which is the default.
- HTML requests are redirected to `/unlock`; JSON requests get `401`.
- The unlocked state is a digest of the password stored in the Rails session,
  so rotating `PASSWORD` relocks everyone. Attempts are rate-limited.

## Background jobs

Active Job runs on Solid Queue, backed by the primary Postgres database — no
Redis, no second service. Worker concurrency is configured in
`config/queue.yml` and scheduled jobs in `config/recurring.yml`.

```bash
bin/jobs                  # run workers (bin/dev already does this)
```

In production you can either run `bin/jobs` as its own process or set
`SOLID_QUEUE_IN_PUMA=true` to run the supervisor inside the web process. If you
do the latter, raise `DB_POOL` above `RAILS_MAX_THREADS` so workers and Puma
aren't fighting over the same connections.

## Testing

```bash
bundle exec rspec
```

## Common commands

```bash
bin/rubocop                    # Ruby linting
bin/brakeman                   # Ruby security scan
yarn lint                      # ESLint over app/frontend
yarn build:vite                # production Vite build
bundle exec annotaterb models  # refresh model schema annotations
```

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and push to `main`:

- **scan_ruby** — Brakeman security scan
- **lint** — RuboCop
- **frontend** — ESLint + `vite build`
- **test** — RSpec against a Postgres service, after a Vite build (request
  specs render the layout, which needs the asset manifest)

There are no system/browser tests yet; add `test:system` (and a browser)
back to the `test` job if you introduce them.
