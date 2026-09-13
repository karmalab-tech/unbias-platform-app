# Unbias AI — Project Brief

> **Working title:** Unbias AI  
> **Status:** POC  
> **Initiated by:** KarmaLab  
> **Direction:** A KarmaLab project designed to grow into a broader open collaborative initiative.

## Purpose

Unbias AI is a cultural and open-source initiative exploring representation bias in generative image models.

Generative AI increasingly participates in how people are visually represented, but its picture of society is not neutral. The project asks whether we can measure these biases, collectively build better representation data, adapt open-source image models, and then measure whether representation actually improves.

**Measure → Collect → Train → Measure again**

The current POC focuses on **Collect**: a public platform for contributing consented images and building a human-reviewed representation dataset.

## POC Goal

The first milestone is **10,000 people represented**.

The POC must:
- make multi-image contribution fast on mobile and desktop;
- collect contributor-confirmed representation metadata for clearly visible adults;
- obtain explicit permission and dataset/training consent;
- human-review every image before approval;
- expose live approved/pending representation progress;
- work as both a website and part of the IA·gora installation;
- provide lightweight moderation and admin tools.

The POC is **image-only**. Dataset export, LoRA training, video, partial-permission blurring and unique-person tracking are deferred.

## Core Principles

- Participation over extraction.
- Consent over scraping.
- Human review over blind automation.
- Transparency over black boxes.
- Open knowledge over proprietary infrastructure.
- Sensitive representation metadata is contributor-confirmed.
- Machine-generated metadata keeps explicit provenance.
- Raw contributed media remains private.
- Public statistics are aggregate.
- No contributor account is required.

## Contribution Model

Each photo may contain **1–4 clearly represented adults**. Tiny/incidental background people are ignored. The contributor confirms that all clearly represented people are 18+ and that permission has been obtained from them.

Contributors are asked not to upload more than **3 photos of the same person**. The POC does not track unique identities.

For each person collect:
- **Age:** 18–29, 30–44, 45–59, 60–74, 75+, Not sure
- **Skin tone:** Monk Skin Tone scale 1–10
- **Gender:** Woman, Man, Non-binary / gender-diverse, Not sure, Prefer not to say
- **Body:** Thin, Medium, Large, Very large, Not visible enough, Not sure
- **Visible disability / assistive device:** optional positive multi-select

Browser-side ML proposes people and, where possible, a Monk value. Contributors confirm/correct detections and explicitly confirm or adjust skin tone. Gender and body are not automatically inferred.

## Contribution Flow

**Upload → Permission → Confirm people → Annotate representation → Review → Consent/licensing → Submit → Success**

Key UX decisions:
- Upload is the first primary action.
- Multiple photos can be submitted together.
- Batch-level permission/consent appears once.
- Per-photo screens show overall and local progress.
- People are highlighted/numbered on the original image; no bounding-box drawing.
- Annotation uses large visual choices, labels and silhouette icons.
- Disability is optional and never blocks progression.
- Training/dataset consent is required; public-display consent is separate and optional.
- Success provides a human-readable **Code** with **“Keep this code safely.”**
- `Get the code by email` is optional, with a separate project-updates opt-in.
- Withdrawal is handled manually through support using the Code.

## Representation Targets

The milestone counts **people represented**, not unique identities or images.

- **Age:** 2,000 per five age buckets.
- **Skin tone:** 1,000 per Monk tone, 1–10.
- **Gender:** Woman 4,000; Man 4,000; Non-binary / gender-diverse 2,000.
- **Body:** 2,500 each for Thin, Medium, Large, Very large.
- **Disability / assistive devices:** independent smaller targets; no public target for no visible disability/device.

Exact disability targets and taxonomy are defined in `POC_DESIGN.md`.

## Moderation

**Every image is human-reviewed.**

Moderation is per image. Automatic checks are advisory. Moderators can only **Approve** or **Reject with a predefined reason**. They cannot edit metadata in the POC.

Pending contributions appear immediately in public progress, visually distinct from approved contributions.

## Public Dashboard

Information hierarchy:
1. Minimal header: `What is this?`, `Watch video`, `Contribute`
2. Large overall progress toward 10,000 people
3. 2–3 admin-managed `We need...` calls to action
4. Representation progress by Age, Skin tone, Gender, Body, Disability/assistive devices
5. Strong contribution CTA
6. About / FAQ / credits

The IA·gora installation uses the same visual system at large scale, includes a permanent QR code and reacts to new contributions.

## Visual Identity

**Contemporary exhibition identity + participatory data visualization + open-source culture.**

Warm, bold, human, contemporary, slightly editorial and engaging without feeling gamified.

- warm cream/off-white background;
- near-black typography;
- vivid coral/orange-red accent;
- restrained soft secondary colors;
- oversized numbers and strong sans-serif typography;
- generous whitespace;
- simple black line icons and human silhouettes;
- moderate corner radii;
- flat graphic design;
- data itself is the visual language;
- approved = solid; pending = diagonal hatching;
- no stock photography.

Avoid AI-startup aesthetics: neon gradients, glassmorphism, glowing imagery, neural-network graphics, robots, 3D blobs and dense SaaS dashboards.

Keep copy sparse.

## Technical Baseline

Start from Pierre's standard **Rails + React + Vite + Tailwind** starter repository.

- Rails backend/system of record
- React frontend
- PostgreSQL
- private object storage
- signed direct browser uploads
- browser-side person detection
- browser-side Monk suggestion
- asynchronous server-side processing and VLM enrichment
- lightweight live counters, initially polling
- Rails staff authentication
- Fly.io deployment

Avoid microservices unless genuinely required.

The code repository is **public on GitHub under the MIT License**. Contributor media, personal data, secrets and production data must never enter the repository.

## Automatic Processing

Each submitted image is processed independently for:
- normalization/previews;
- exact/perceptual duplicate checks;
- technical quality checks;
- advisory safety flags;
- strict-vocabulary context classification;
- neutral VLM scene description/captioning.

The VLM must not infer sensitive/speculative identity attributes. Contributor-confirmed structured metadata and automatic metadata remain separate and retain provenance/model-version information.

Processing failures must not make contributions disappear.

## Partners and Positioning

The initiative is currently a **KarmaLab project**, designed to grow into a broader open collaborative initiative.

**IA·gora is the first institutional partner.**

Partners may host the installation, activate communities, reach underrepresented groups, contribute expertise, experiment through exhibitions/workshops/research, and distribute the initiative and its open outputs.

The project is primarily cultural, artistic and open-source, not a SaaS product.

## Canonical Documentation

This brief is the entry point, not the full specification.

Before implementation, read:
- `docs/POC_DESIGN.md` — canonical product behavior, flows, taxonomy, targets, moderation and public/admin UX.
- `docs/TECHNICAL_ARCHITECTURE.md` — canonical architecture and implementation constraints.
- `docs/FUTURE_IMPROVEMENTS.md` — deferred ideas. **Do not implement these in the POC unless scope changes deliberately.**

If this brief is less specific than a detailed document, the detailed document wins. If documents conflict, surface the conflict rather than silently choosing.

## Implementation Priorities

1. Core data model and staff authentication
2. Private image upload/storage
3. Contribution flow without browser ML
4. Human moderation
5. Public dashboard and coverage counters
6. Browser-side people detection
7. Monk skin-tone suggestion
8. Server-side context/caption and advisory checks
9. IA·gora installation mode
10. Testing, accessibility and polish

The first useful milestone is:

**A contributor can upload images, annotate clearly represented people, consent, submit, have those images human-reviewed, and see the resulting pending/approved representation counts on the public dashboard.**
