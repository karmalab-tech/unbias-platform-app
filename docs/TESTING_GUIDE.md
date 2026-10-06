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
   **Get the code by email** → an email opens in letter_opener. Below, a
   **Follow the project on Instagram** card opens
   https://www.instagram.com/karmalab.tech in a new tab.
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

---

## PR 2 — Detection, enrichment, installation, email, smoke test

Phases 5–8: browser-side detection and Monk suggestion, server-side
processing with Claude Sonnet 5, installation mode, Postmark, purge of
rejected media, Playwright smoke test.

### 0. New setup steps

```bash
bin/fetch-ml-models            # ~30 MB of models and wasm into public/models (gitignored)
# optional, for real enrichment:
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

Restart `bin/dev` afterwards. Without the key, photos still reach
moderation and carry a "Processing failed" flag.

### 1. Browser-side detection (phone-sized window)

1. Upload a photo with one to four clearly visible people. On the
   **Who is in this photo?** step the intro reads "Looking for people…"
   for a second, then "We found N people. Is that right?" with numbered
   markers on the people. Background figures under ~5 % of the image are
   ignored; the thresholds are `detection_min_score` and
   `detection_min_area_ratio` in `config/unbias.yml`.
2. Tap a number to remove a false positive, tap a missed person to add one.
   A crowd photo with more than 4 people keeps Continue disabled until you
   remove some.
3. On the person screen, a face that was found shows "Suggested from the
   photo: N" under the Monk scale, with nothing pre-selected: you still pick.
   The suggestion follows the photo's lighting, so shaded faces suggest
   darker tones; it is assistance, not truth.
4. Nothing leaves the browser: open the network tab, no request carries
   image data except the direct upload to storage.
5. In moderation, detected people are labelled "detected, confirmed by
   contributor" and, when the contributor changed the tone, "(suggested N)".

### 2. Server-side processing

1. Submit a contribution, then open it in `/moderation`. Advisory flags
   appear as chips: **Blurry** and **Low resolution** come from vips;
   uploading the same photo twice yields **Exact duplicate** with a link to
   the other photo; a lightly re-encoded copy yields **Possible duplicate**.
2. With `ANTHROPIC_API_KEY` set, **Automatic context** fills in with the
   setting and context labels, a neutral description and a caption, plus the
   provider, model (`claude-sonnet-5`) and prompt version. The description
   must never mention gender, age, skin tone or similar; report it if it does.
3. Safety booleans become **Possible minor**, **Possibly AI-generated** or
   **Possibly inappropriate** chips. Only the booleans are stored.
4. Kill the network or use a wrong key: the photo still reaches the queue
   with **Processing failed**; transient API errors are retried up to six
   times by Solid Queue.

### 3. Installation mode

Open http://localhost:3000/installation?lang=fr on a large window: no
navigation, oversized count, QR code and short URL, calls to action and
charts. Submit a contribution from a phone on the same network: the count
pulses within about three seconds. Set `INTRO_VIDEO_URL` (plus optional
poster and subtitles URLs) to see the video autoplay muted and loop.

### 4. Email and retention

- Production sends through Postmark when `POSTMARK_API_TOKEN` is set;
  development still opens emails in the browser.
- Photos rejected more than 30 days ago lose their files daily at 4 am
  (`PurgeRejectedMediaJob`); the record and decision stay for the audit
  trail.

### 5. Smoke test

```bash
RAILS_ENV=test ACTIVE_JOB_INLINE=1 bin/rails db:test:prepare db:seed
RAILS_ENV=test ACTIVE_JOB_INLINE=1 bin/rails server -p 3100 &
yarn e2e
```

`yarn test` runs the Vitest suite for the detection helpers. CI now runs
both plus the Playwright job.

## PR 3 — Contribution flow polish: photo stack, sticky photo, zoomable full screen, focused questions

No new setup. Run the app as usual and contribute with **three or more
photos** in one batch, in a phone-sized window.

### 1. The batch as a stack of prints

1. Upload three or more photos and continue. The **Before we continue**
   (permission) screen now opens with the batch fanned out above the
   heading, like a pile of paper prints, with "N photos" under it.
2. Finish the labels and continue to **One last thing** (consent): the same
   stack sits above the heading there.
3. The pile shows at most five prints; the caption always counts the whole
   batch. Remove a photo on the way through and the count follows.
4. With a single photo the stack is one print, barely tilted.

### 2. Sticky photo while describing a person

1. On a person screen (age, skin tone, gender, body), scroll down. The photo
   pins under the header instead of scrolling away, shrinks to about a fifth
   of the screen and gets a hairline under it; the numbered marker of the
   person you are describing stays on it.
2. Scroll back up: the photo grows to its full size again.
3. Every step now starts scrolled to its own top, including when you move
   from person 1 to person 2.

### 3. The photo full screen

1. On a person screen, tap the photo (anywhere, including on a number). It
   opens full screen over the form, fading in while it scales up, with the
   numbered markers gone and a close button in the corner.
2. Tap the photo again, tap the close button, or press Escape: it fades back
   out. The page behind does not scroll while it is open.
3. It works the same when the photo is pinned and small: you always get the
   photo at full size.
4. On a phone, pinch to zoom in up to five times, around the point between
   your fingers, and drag with one finger to move around. The photo stops at
   its own edges. Pinch back in and it snaps to fit and recentres.
5. While it is open the browser's own pinch zoom is off: the page behind
   never zooms or pans, and neither does the interface around the photo.
6. Zoomed in, a tap goes back to the fitted photo rather than closing; tap
   again to close. The close button closes at any zoom level.

### 4. Questions fade in as you reach them

1. On a fresh person, **Age** is at full strength and every question below it
   is dimmed.
2. Answer Age: **Skin tone** comes up to full strength, the ones below stay
   dimmed. The same happens down the form; the optional disability question
   comes up once the four required answers are in.
3. A dimmed question is never disabled: hover or tab into it and it comes up
   to full strength, and you can answer out of order. Answering one out of
   order keeps it at full strength.
4. Re-open a person you already described (from **Your photos**): nothing is
   dimmed, everything is answered.

## PR 4 — Disclosed launch boost on the dashboard

Defaults live in `config/unbias.yml` (`launch_boost_*`); the test environment
turns the boost off so the other specs see real numbers.

1. Open `/` on a fresh database: photos contributed starts at 1,573 and the
   headline people count at 1,100. There is no note on the dashboard itself; the
   disclosure lives in the FAQ.
2. Submit a contribution: photos contributed goes up by one per photo. The
   number never goes down and never shows less than the real count.
3. Open `/about#faq-boost`: it lists real, added and shown for photos and for
   approved people, and says the added part disappears at 2,500 real photos
   (people: 2,500 real approved people). Check `?lang=fr` too.
4. The charts by category and the pending count are always real.
5. The admin dashboard always shows real numbers (it does not use the boost).
6. Set `launch_boost_photos_floor` and `launch_boost_people_floor` to 0 (or
   reach 2,500): the FAQ says the boost has ended.


## PR 5 — Dashboard keeps working without network

Only the home page (`/`) and `/installation` are cached, by `public/sw.js`. The contribute flow, staff pages and everything behind a login are never cached. The worker is registered in production builds only, so test it on a deployed or production-built server (not `bin/dev`).

1. Open `/` (or `/installation`) with network and wait a few seconds for the numbers to load.
2. Cut the network (airplane mode, or Chrome DevTools → Network → Offline) and refresh: the page loads with the last numbers, charts, fonts and QR code.
3. Restore the network: within one polling interval the numbers update from the server, and the next refresh serves the latest page.
4. Offline, open `/contribute`: the browser's own "no connection" page appears, since contributing needs the server.
5. After a deploy, the next online visit picks up the new version; the old one is only used while offline.

The first visit must happen online. Browsers may clear cached data after long idle periods (Safari: about a week), so open the installation once online on the day.
