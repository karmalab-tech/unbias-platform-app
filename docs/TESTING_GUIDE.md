# Testing guide

Hands-on walkthroughs for each pull request, written for a reviewer who wants
to click through the product rather than read the diff. Automated checks:
`bin/rspec`, `bin/rubocop`, `yarn lint`, `yarn build:vite`.

## Local setup (once)

```bash
bundle install && yarn install
cp .env.example .env            # defaults are fine for local testing
bin/rails db:prepare            # creates unbias_ai_development + test
bin/rails db:seed               # 29 representation buckets + the first admin
bin/dev                         # Rails, Vite, Tailwind, Solid Queue worker
```

The seed creates the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, which
default to `pierre.de.milly@gmail.com` / `unbias-admin`. Change the password
after the first sign-in on any shared environment. Emails open in the browser
via letter_opener in development.

`bin/dev` must include the worker: submitted photos only reach the moderation
queue once `ProcessAssetJob` has run.

---

## PR 1 — Milestone 1: contribute, moderate, see the progress

Phases 0–4 of `IMPLEMENTATION_PLAN.md`: rename and staff roles, data model,
contributor flow without browser ML, moderation, public dashboard and admin.

### 1. Contribute (phone-sized window recommended)

1. Open http://localhost:3000. The dashboard shows `0 / 10,000` and empty bars.
2. Click **Contribute** (or **Upload photos**). Pick two or three JPEG/PNG
   photos. Try a HEIC or a GIF: it is refused with an explanation. A photo
   under 768 px on its short side shows a `!` badge (warning, not a block).
3. **Continue** → tick both permission boxes → **I confirm**.
4. **Who is in this photo?** Tap the photo once per person (up to 4). Tap a
   number to remove it. Try **Remove this photo** on one of them.
5. **Person 1**: pick age, Monk skin tone, gender, body; assistive devices are
   optional. The button stays disabled until the four required fields are set.
   **Next person** / **Done with this photo** moves on; nothing auto-advances.
6. Reload the page mid-way: the draft resumes where you were (token in
   localStorage). Open a second browser: it starts a fresh contribution.
7. **Your photos** grid: every photo shows Complete or Needs labels; tap one
   to reopen it. **Continue to consent** is enabled only when all are complete.
8. Consent: the first box is required, the second optional. **Submit**.
9. Success: "You added N people", a code `UNB-XXXX-XXXX`, **Copy**, and
   **Get the code by email** → an email opens in letter_opener.
10. Back on the dashboard within ~5 s the hatched **pending** segment grows.
11. Add `?lang=fr` to any URL to check the French copy.

### 2. Moderate

1. http://localhost:3000/moderation → redirected to sign in → use the admin
   credentials above → back to the queue, oldest photo first.
2. The side panel lists each numbered person with their labels, the
   submission code, date, display consent and "Automatic context: not
   available yet" (Phase 6 fills it).
3. Keyboard: `A` approves, `R` then `1`–`9` rejects with that reason, `Esc`
   cancels, `←`/`→` moves. The summary line updates after every decision.
4. The dashboard moves people from hatched pending to solid approved.
5. Empty queue shows "Nothing to review".

### 3. Admin (admin role only; moderators are redirected to the queue)

1. **Dashboard**: tiles plus a coverage table per bucket.
2. **Calls to action**: add up to three; a fourth active one is refused.
   Active cards appear on the public page immediately (tinted cards under
   the hero). French caption is optional and falls back to English.
3. **Settings → Coverage targets**: change a target, blur the field, reload
   the public page: the bar length changes.
4. **Settings → Moderators**: invite an email → a set-your-password mail
   opens in letter_opener; follow the link to set a password and sign in as
   a moderator (queue only, no Admin tab). You cannot remove or demote
   yourself.
5. **Find a contribution**: paste a code from step 1.9 → photos with status,
   **Withdraw this photo** / **Withdraw the whole contribution** (confirm
   dialogs). Withdrawn photos disappear from counts and their files are
   purged.

### 4. Things to know

- Drafts never submitted are purged after 24 h (`PurgeStaleDraftsJob`, hourly).
- Assets in `processing` already count as pending on purpose.
- `GET /api/public/stats` is the single JSON feed behind the dashboard and
  returns an ETag; `GET /qr.svg` is the QR code.
- The site password gate (`PASSWORD` in `.env`) is off unless set.
