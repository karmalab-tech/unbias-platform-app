# The Cast: proposal

> Status: **proposal, not agreed.** Nothing here is built and nothing here overrides `PROJECT_BRIEF.md` or `IMPLEMENTATION_PLAN.md` until the team accepts it. Once accepted, §13 lists the documents to update.

**Summary.** Default settings stops presenting itself as "a dataset to retrain models" and becomes a tool plus a community. The tool takes one prompt and returns several versions of it, each describing a different real person, together with consented reference photos of that person. The people behind the photos form *the cast*: they chose to be references, they have a name and a story, and they are told every time someone uses their photo.

## 1. Why change direction

Three things we learned while building the POC and showing it in exhibitions:

1. **Image models do not pick a person; they return the most likely image for the words they are given.** The bias experience shows it: a more precise prompt only moves the result somewhere else. "Young Black female doctor" still gives one face fifteen times. The problem is not missing words; it is that whatever is left unsaid falls back to the default.
2. **Fine-tuning (LoRA) is not the answer we can give the public.** A LoRA moves the average rather than adding variety, and most people generate with closed models (GPT Image, Nano Banana) that do not accept LoRAs. Everyone asks us "how do I fix this?", and "train an adapter for an open model" is not an answer for them.
3. **People are reluctant to upload photos to "a dataset".** The 10,000-people goal is far away, and the dashboard shows progress without explaining why it matters.

What works, and what Karma Lab already does professionally: **do not let the model choose.** Give it references for everything: real people, real clothes, real places. References are the one thing that escapes the average, and they work with every model, closed ones included.

## 2. The idea

> **AI has default settings.** When you don't choose, it chooses for you, and it always picks the average.
> **Don't let it choose.** Say who you mean, and show it real people.
> **Real people need consent.** So we are building a cast: people who chose to be references, and who know every time they are used.

Three parts:

| Part | What it is |
| --- | --- |
| **The tool** | Prompt in, several prompts out, each describing a different person from the cast, each with that person's reference photos. |
| **The cast** | Consented people with a first name, a short story and a few photos. Being in the cast is like being an actor for AI: *I want to be represented as who I am.* |
| **The use log** | Every high-resolution download is logged and the person is emailed. They can object to a use, and withdraw at any time. |

Later the same model extends beyond people: clothes, objects, furniture, places. A library of non-default references. Only people are in scope for now.

## 3. The tool

### Flow

1. The user writes a prompt, e.g. *"A doctor talking to a patient in a hospital corridor."*
2. Claude reads it, finds the people in it, and notes which dimensions the prompt already fixes (here: none) and which it leaves open.
3. The tool **picks people from the cast first**, varied across the open dimensions (age, skin tone, gender, body, visible disability) and respecting the fixed ones.
4. For each person, Claude rewrites the prompt from that person's profile: *"A doctor in her seventies, dark skin, grey locs, wearing glasses, talking to…"*
5. The user sees, for example, six variants: the rewritten prompt plus two or three low-resolution, watermarked photos of the person.
6. The user picks a person. Getting the high-resolution photos is the *use*: it is logged and the person is notified.
7. The user takes the prompt and the photos to ChatGPT, Gemini or any tool they already use.

### Design decisions

- **People first, prompt second.** Variations are drawn from the cast, not invented and then matched. Every variant has references, the variety comes from real people, and gaps in the cast show up immediately.
- **Only fill what is unsaid.** If the prompt says "an old man", every variant is an old man. Rewritten prompts are always shown in full, never applied silently. (Gemini's 2024 automatic diversity injection is the failure to avoid.)
- **No image generation in V1.** We hand over prompts and references; the user generates elsewhere. It works with every model, costs nothing per use, and keeps us out of responsibility for generated content. Generating in-tool can come later.
- **Requesters identify themselves.** An email (magic link) and acceptance of the usage rules before the first high-resolution download. Without it, notification and objection mean nothing.

## 4. The cast

### Who can join

- Adults (18+), **joining as themselves only.** Unlike today's flow, nobody uploads other people.
- One profile per person, with an email address (required: it is how they are told about every use).

### The profile

| Field | Notes |
| --- | --- |
| First name (or chosen name) | Shown with the photos if public display is on |
| Short story | A few sentences, optional, moderated |
| Photos | 3 to 6: face, half body, full body, different light. The existing upload, detection and quality checks apply |
| Self-declared attributes | The five existing dimensions: age, skin tone (Monk), gender, body, visible disability. Same taxonomy as `Representation` |
| Consents | Reference use (required); public display of name, story and photos on the site and in exhibitions (optional, separate) |

### Managing it

- Accounts stay passwordless: the person manages the profile through a link emailed to them (replacing the `X-Submission-Token` + `UNB-XXXX-XXXX` code for cast members).
- From the profile: edit story and photos, see the full usage history (date, the prompt used, requester's display name), object to a use, pause or withdraw.
- **Withdrawal stops future uses; it cannot recall photos already downloaded.** This is said plainly at sign-up and in the usage rules, which forbid keeping or reusing a photo after an objection.

### Objection

When notified, the person can answer *"I don't consent to this use."* The objection goes to the requester through the platform (no email addresses exchanged either way) and to the moderators. Repeated objections or a breach of the usage rules block the requester.

## 5. Coverage instead of a 10,000-people target

The tool needs **breadth, not volume**: a few people for each combination of attributes, not thousands of photos. Full combinations explode (5 ages × 10 skin tones × 3 genders × 4 bodies = 600 cells), so the proposal is:

- Core grid: **age (5) × skin tone grouped in 4 bands × gender (3) = 60 cells, 2 people each ≈ 120 people.**
- Body and visible disability tracked per value on top, like today's buckets.
- The public page shows the grid filling up and names the gaps ("we have no men over 75 with dark skin yet"). Gaps become the call to action.

The 29 `RepresentationBucket` rows and the dashboard charts can be reused for the per-value view; the grid is new.

## 6. Data model (sketch)

New or changed, names indicative:

| Model | Purpose |
| --- | --- |
| `CastMember` | One person: name, story, email, attributes, consents with `consent_version`, status (`draft → pending_review → active → paused → withdrawn`), public display flag |
| `Asset` (reused) | A cast member's photo; keeps the processing pipeline and moderation. Gains a `cast_member_id` alongside `submission_id` |
| `Requester` | Someone using the tool: email, display name, accepted rules version, blocked flag |
| `ToolSession` | One prompt and the variants returned (for history and quality review) |
| `ReferenceUse` | A high-resolution download: cast member, requester, prompt, timestamp. Triggers the notification email |
| `Objection` | A cast member's objection to a `ReferenceUse`, with its outcome |
| `Reference` (later) | Generalises `CastMember` to clothes, objects, places via a `kind` |

Low-resolution previews are Active Storage variants with a watermark; high-resolution files are only ever served through a signed, short-lived URL created by a `ReferenceUse`.

## 7. Consent and legal

This is a **model release**, not a dataset consent, and it is the riskiest part of the project.

- A name and a face linked to ethnicity (skin tone) and disability is special-category data under GDPR: it needs explicit consent, a clear purpose, data minimisation and easy withdrawal.
- The consent wording, the requester usage rules and the privacy policy need **legal review before launch.** `consent_version` is still `v0-draft`, so this is the right moment.
- Usage rules for requesters should at least forbid: identity-changing edits presented as the real person, sexual content, political or commercial endorsement without asking, and resale of the photos.
- Photos found online are fine for an internal prototype only. The public tool uses cast members only: consent over scraping stays a core principle.

## 8. The website

The story every page follows: **Problem → Why → Fix → Join.**

### Site map

| Route | Content |
| --- | --- |
| `/` Home | The bias experience as the opening screen, then static chapters: *AI has default settings* (why it averages) → *Don't let it choose* (the fix) → try-the-tool block → *Meet the cast* → *Join the cast* → footer |
| `/experience` | Unchanged standalone version, `?present=true` for exhibitions. Gains a final step, *Now let's fix it* (§10, phase A) |
| `/tool` | The tool (phase C) |
| `/cast` | Replaces the dashboard: cast members who chose public display, the coverage grid, the gaps. `?present=true` for exhibitions |
| `/join` | Replaces `/contribute`: an intro screen (why, what happens to your photos, how you are told, how to leave, FAQ), then the profile flow |
| `/escape-the-default` | Practical advice anyone can use today in any tool: describe everything, vary descriptions, use real references |
| `/about` | Method, consent, privacy, FAQ, Karma Lab, the motion video |

Nav: **Experience · Tool · Cast · About**, with **Join the cast** as the main button. On mobile, the existing drawer.

### Home in detail

1. **Experience stage** (dark): mosaic, *These images are not neutral*, *Show me how*. Playing it happens in place; a *What is this project? ↓* cue lets readers skip it. Online, the end of the experience scrolls into chapter 2 instead of stopping at *Do you want to help?*
2. **AI has default settings**: models return the most likely image; precision moves the default, it does not remove it. One visual from the experience (15 identical-looking results).
3. **Don't let it choose**: the fix, with the same prompt shown before (default) and after (referenced).
4. **Try it**: a prompt field with a canned demo until the tool exists.
5. **Meet the cast**: a few faces, names and one-line stories.
6. **Join the cast**: be represented as who you are; you are told every time; you can leave at any time.

## 9. Exhibition

| Screen | Content |
| --- | --- |
| 1 · Interactive | `/experience?present=true`. Ends on *Now let's fix it*, then the QR code to join |
| 2 · Loop | An attract loop: the experience playing itself, then the fix shown on the same prompt. The motion video becomes an optional segment |
| 3 · Cast wall | `/cast?present=true`: faces, names, short stories of cast members who chose public display, the coverage grid, "we're missing you" and the QR code |

## 10. What happens to what exists

| Piece | Fate |
| --- | --- |
| Bias experience and its admin | Kept as is; gains the *fix it* step |
| Upload, browser detection, processing pipeline, moderation | Kept, applied to cast photos |
| Representation taxonomy and buckets | Kept, plus the coverage grid |
| Anonymous multi-photo contribution, public code, 10K hero | Retired once `/join` ships (no real contributions exist yet, so nothing to migrate) |
| Dashboard and installation screen | Reworked into `/cast` and the cast wall |
| Motion video | Moves to `/about` and the exhibition loop |
| LoRA / dataset export | Dropped from public messaging; stays in `FUTURE_IMPROVEMENTS.md` as research |

## 11. Phases

**A. Story and proof (now, little backend):**
- restructure the site around Problem → Why → Fix → Join (Home chapters, nav, `/about`, `/escape-the-default`);
- write the bridge copy in EN and FR;
- add *Now let's fix it* to the experience: one or two prompts rerun through the tool's logic by hand, with 15–20 Karma Lab people as references (generated with the OpenAI image edits endpoint next to the existing `GenerateExperienceImageJob`);
- show it at the next exhibition and see whether the before/after lands.

**B. Join the cast:** `CastMember` profile, consent v1 after legal review, email-link management, `/join`, `/cast` and the cast wall.

**C. The tool:** prompt analysis and variants with Claude, cast selection, low-resolution previews, requester sign-in, high-resolution download, `ReferenceUse` log and notification email.

**D. Objection and history:** objection relay, usage history on the profile, requester blocking.

**Later:** in-tool generation; clothes, objects, furniture and places as references.

## 12. Open questions

1. Is the team comfortable with reference use of people's faces, given the consent and legal burden (§7)? Who does the legal review?
2. Can Karma Lab provide 15–20 consented people for phase A?
3. Is the tool free and open to anyone with an email, or reserved (partners, studios, students) at first?
4. Does a cast member see the requester's name, or only that a use happened and for which prompt?
5. Does joining the cast stay purely voluntary, or is there a future compensation model (per use)?
6. Is "the cast" the right name in both languages (FR: *le casting*, *la distribution*)?
7. Does the per-dimension "dataset for research" consent survive as an optional extra, or disappear?

## 13. Documents to update once accepted

`PROJECT_BRIEF.md` (purpose, loop, goal), `IMPLEMENTATION_PLAN.md` (a new plan for phases A–D), `TECHNICAL_ARCHITECTURE.md` (§6 models), `POC_DESIGN.md` and `DESIGN_HANDOFF.md` (pages), `BIAS_EXPERIENCE.md` (the fix step), `FUTURE_IMPROVEMENTS.md` (LoRA moves there), `TESTING_GUIDE.md` (each shipped phase), and `CLAUDE.md` (where the project stands).
