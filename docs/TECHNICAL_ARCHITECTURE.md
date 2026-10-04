# Community Dataset Platform --- POC Technical Architecture

## 1. Scope

This document defines the technical architecture for the image-only
community dataset POC.

It covers the system needed to support: - public contribution -
multi-image uploads - browser-side people detection - browser-side Monk
skin-tone suggestions - contributor annotations - consent - server-side
image enrichment - automatic quality/safety flags - human moderation -
public coverage counters - installation mode - lightweight admin
tools

Dataset export/versioning, LoRA training, video contributions,
persistent identity tracking and other future features are outside this
POC.

## 2. Architecture Principles

Keep the POC conventional and easy to operate.

-   One Rails application as the backend and system of record.
-   React frontend inside the existing Rails + Vite project template.
-   PostgreSQL for application data.
-   Object storage for original images and derived image files.
-   Browser-side ML only where it materially improves contribution UX.
-   Server-side AI/processing happens asynchronously after submission.
-   No separate Python service unless a selected model/library genuinely
    requires one.
-   Avoid unnecessary infrastructure and distributed services.
-   Every machine-generated value keeps provenance and model/version
    information.
-   Raw images remain private.
-   The architecture should be deployable as a small Fly.io application
    and grow incrementally.

## 3. Application Stack

The application uses the standard KarmaLab project base template:

-   Rails backend
-   React frontend
-   Vite
-   Tailwind CSS
-   PostgreSQL

The stack itself does not require additional architectural abstraction
for the POC.

Rails owns: - application/API logic - authentication for
admins/moderators - contribution state - annotations - consent records -
moderation - coverage statistics - email delivery - orchestration of
asynchronous processing

React owns the contributor, public dashboard, installation, moderation
and admin interfaces.

## 4. Deployment and Source Code

### Fly.io

The application is deployed to **Fly.io**.

At minimum:

``` text
Fly.io
├── Rails web process
├── background processing process
└── PostgreSQL

Private object storage
└── contributed images / derived assets

External AI services
└── VLM / safety processing where needed
```

Web and background processing can initially run from the same
application image and codebase, even if Fly runs them as separate
processes.

Avoid introducing independent microservices in the POC.

### GitHub / Open Source

The source repository is public on **GitHub** and released under the
**MIT License**.

The repository must therefore never contain: - contributor images -
personal email addresses - production database dumps - secrets/API
keys - production environment files - private moderation data

Provide a normal `.env.example` / configuration documentation with
placeholder values only.

The code can be fully public while the contributed dataset remains
private.

## 5. High-Level Data Flow

``` text
Contributor browser
    │
    ├── local person/face detection
    ├── local skin-tone suggestion
    │
    ▼
Rails application
    │
    ├── PostgreSQL
    ├── private object storage
    ├── background processing
    │      ├── image normalization / metadata
    │      ├── duplicate checks
    │      ├── quality checks
    │      ├── safety flags
    │      └── VLM caption/context
    │
    ├── moderation
    │
    └── aggregate coverage counters
           │
           ├── public dashboard
           └── installation
```

## 6. Image Upload Architecture

### Client Flow

The contributor selects one or more images before permission/annotation.

Target input formats: - JPEG - PNG - WebP - HEIC

Initial limits: - approximately 768 px minimum on the shortest side -
approximately 20 MB maximum per image

These values remain configurable until tested on real phones and images.

### Upload Strategy

Images should be uploaded **directly from the browser to object storage
using short-lived signed upload URLs**, rather than proxying large image
bodies through Rails.

Suggested sequence:

``` text
Browser
→ Rails creates draft asset + signed upload URL
→ Browser uploads directly to object storage
→ Browser tells Rails upload completed
→ Rails verifies/stores technical metadata
```

Benefits: - less Rails memory/bandwidth pressure - better mobile upload
reliability - easier scaling - simpler Fly.io web processes

The database stores metadata and storage keys, never image blobs.

### Private Storage

Original uploads are private by default.

Access for: - contributor review during the active session -
moderation - admin - optional public-display assets

should use authenticated application endpoints or short-lived signed
read URLs.

Public-display consent does not automatically make the raw original
globally public. A derived/display asset can be published separately if
needed.

### Image Normalization

After upload, background processing can: - read dimensions/orientation -
normalize EXIF orientation - create display thumbnails/previews - strip
unnecessary metadata from derived files - compute file/perceptual hashes

Keep the original private upload unless the eventual legal/privacy
policy requires normalization/destruction of metadata on ingestion.

## 7. Browser-Side People Detection

Detection exists to make annotation easier, not to identify people.

### Requirements

It should: - run entirely in the browser - work on modern mobile
browsers - detect people and/or faces - return bounding regions and
confidence - allow filtering by relative image size - avoid uploading
biometric embeddings or identity templates - be fast enough that
detection feels like part of the upload flow

A person does not need to face the camera. Therefore the primary
mechanism should be **person detection**, optionally assisted by face
detection for skin-tone estimation.

### Filtering

Use configurable heuristics: - model confidence - bounding-region size
relative to image - optional face visibility - overlap / duplicate
detections

A starting point such as **\~5% of total image area** can be tested for
filtering incidental background people. It is not a fixed product rule.

The final list is always contributor-confirmed.

### Correction UX

The browser returns proposed people to React.

Contributor can: - confirm - remove a false positive - tap a missed
person to add them

No manual bounding-box drawing is required.

For a manually added person, the system only needs enough region
information to associate UI annotations and, where possible, find a
face/skin region. Precision cropping is not a dataset requirement.

### Persistence

Store the confirmed detection region with the `PersonAnnotation` so
annotations remain associated with the correct person.

Do not: - create persistent face embeddings - attempt identity
recognition - link the same person across different images

## 8. Browser-Side Monk Skin-Tone Suggestion

For each confirmed person, attempt to locate a sufficiently visible
face/skin region and estimate a suggested **Monk Skin Tone 1--10**
value.

This happens locally in the browser where practical.

The suggestion is UX assistance only.

``` text
automatic suggestion
→ contributor sees Monk reference scale
→ contributor explicitly confirms or changes it
```

Persist separately:

``` text
skin_tone_auto
skin_tone_confirmed
```

The confirmed value is used for coverage statistics.

The implementation must tolerate failure. If no reliable suggestion can
be produced, simply show the Monk scale with no preselected suggestion.

The exact estimation method/library is still to be selected and
validated against diverse real-world images before launch.

## 9. Contribution State and Persistence

The contribution flow is multi-step and may involve multiple large
uploads, so state should be persisted progressively rather than
submitted as one giant final form.

Suggested lifecycle:

``` text
draft
→ uploading
→ annotating
→ submitted
→ processing
→ pending_moderation
```

Each image can then independently become:

``` text
approved
rejected
withdrawn
```

Save: - upload completion - confirmed people - person annotations -
consent - submission status

as the contributor progresses.

This reduces data loss if a mobile browser refreshes or loses
connectivity.

No contributor account is required.

A random, non-sequential human-readable `public_code` identifies the
submission for later support/withdrawal.

## 10. Core Data Model

### Submission

``` text
id
public_code
status
email
updates_opt_in
created_at
submitted_at
```

Email is nullable and is only added when the contributor chooses "Get
the code by email".

### Asset

``` text
id
submission_id
status
storage_key
width
height
mime_type
file_size
file_hash
perceptual_hash
technical_metadata
created_at
```

### PersonAnnotation

``` text
id
asset_id
person_index
detection_region
detection_source
created_at
```

This is an annotation target, not a persistent identity.

### MetadataValue

``` text
id
asset_id
person_annotation_id
field
value
source
confidence
model
model_version
created_at
```

`person_annotation_id` is nullable for image-level metadata.

Possible sources: - contributor - automatic - moderator - derived

Machine output never silently overwrites contributor data.

### Consent

``` text
id
submission_id
training_allowed
public_display_allowed
consent_version
accepted_at
withdrawn_at
```

### RepresentationBucket

``` text
id
dimension
value
label
display_order
target_count
```

The taxonomy itself is fixed in code/data for the POC. Admins can change
target counts, not redefine dimensions.

### ModerationDecision

``` text
id
asset_id
moderator_id
decision
reason
created_at
```

### PublicCallToAction

``` text
id
caption
related_buckets
active
display_order
```

Maximum three active in the POC.

## 11. Submission Processing Pipeline

Server-side processing begins after final submission.

``` text
Submission
→ enqueue processing for each asset
→ technical validation
→ normalization / thumbnails
→ duplicate check
→ quality/safety checks
→ VLM enrichment
→ mark pending moderation
```

Processing should be **per asset**. A failure on one image should not
block the rest of the contribution.

Each step should be idempotent/retryable where practical.

### Background Jobs

Background work is justified because VLM calls and image processing
should not block web requests.

Use the Rails application's normal background-job abstraction.

The exact queue backend can be chosen during implementation based on the
base template and Fly.io deployment. Avoid introducing queue
infrastructure beyond what the POC actually needs.

Jobs include: - image metadata/thumbnail processing - hashes / duplicate
detection - quality checks - safety checks - VLM context/caption
generation - contribution-code email delivery - optional counter
refresh/broadcast

## 12. Automatic Quality and Safety Checks

Automatic checks are advisory. They generate flags for moderators rather
than making final dataset decisions.

Potential checks: - invalid/corrupted image - insufficient resolution -
severe blur / unusable quality - exact duplicate - near duplicate -
possible minor - possible AI-generated/synthetic image -
unsafe/inappropriate content

The exact services/models are still open.

Prefer deterministic/local checks for simple technical properties and
external/model-based checks only where needed.

Store: - check type - result - confidence where applicable -
model/version - timestamp

Do not automatically reject borderline content solely because a model
flagged it.

## 13. VLM Context and Caption Processing

A server-side VLM generates secondary metadata after submission.

### Context

The model selects from a strict predefined vocabulary, for example:

``` json
{
  "setting": ["outdoors", "public_space"],
  "context": ["social", "everyday"]
}
```

Do not rely on unconstrained prose for categorical context.

### Neutral Scene Description

The VLM may describe: - clothing - pose - visible action - setting -
framing - objects - lighting

It must be instructed not to infer: - gender - age - skin tone -
ethnicity - religion - nationality - relationships - profession -
wealth/class - personality - other sensitive/speculative identity
attributes

Contributor-confirmed representation metadata remains authoritative for
the structured representation fields.

Store: - raw VLM response - parsed context - neutral description -
generated caption if produced - provider/model - model version where
available - prompt/version of the enrichment pipeline

This makes automatic metadata auditable and regenerable later.

## 14. Moderation Architecture

Moderation is per image.

The moderation queue queries assets in `pending_moderation`, oldest
first.

The review endpoint provides: - signed/private image URL - numbered
confirmed people/detection regions - contributor metadata - automatic
context - generated caption - automatic flags - submission code/date

Moderator actions: - approve - reject with predefined reason

No metadata editing in the POC.

A moderation transaction should: 1. create the moderation decision 2.
update the asset status 3. update/invalidate aggregate coverage data 4.
notify/rebroadcast public counters if necessary

Keyboard shortcuts are frontend-only behavior and do not change the API
model.

## 15. Coverage Counters

Public counters need two values:

``` text
approved
pending
```

Only approved images/people belong to the dataset, but pending
contributions appear immediately in the public visualization.

### Counting

Counts can initially be computed from PostgreSQL queries and cached.

At POC scale, avoid building a dedicated analytics pipeline.

Possible implementation: - aggregate SQL queries - Rails cache / small
persisted aggregate table if needed - invalidate/update when submissions
or moderation decisions change

Correctness matters more than millisecond-level freshness.

## 16. Real-Time Dashboard / Installation Updates

The public website and installation should react shortly after a
contribution or moderation decision.

For the POC, use the simplest mechanism that feels live.

Preferred starting point: **lightweight polling** every few seconds.

Reasons: - trivial to operate - resilient across Fly.io deployments - no
persistent connection infrastructure - contribution volume is low enough
that the cost is negligible

The endpoint can return: - overall people count - approved/pending
counts per bucket - current calls to action - last-updated timestamp

If polling later becomes insufficient, Rails/SSE/WebSockets can replace
it without changing the underlying data model.

## 17. Admin and Moderator Authentication

Contributors require no account.

Admins and moderators require authenticated access.

Roles: - `admin` - `moderator`

Admin: - admin dashboard - target editing - calls-to-action management -
moderator access management - moderation

Moderator: - moderation only

Keep authentication conventional and inside the Rails application.

No public registration for staff roles.

## 18. Email

Email is optional for contributors.

When "Get the code by email" is used: 1. store the submitted email on
the contribution 2. store the separate updates opt-in value 3. send the
contribution code

The updates checkbox must not be inferred from providing an email.

Email sending should run asynchronously.

The specific email provider is not architecturally important and can be
selected during implementation.

## 19. Privacy and Data Handling

Technical requirements derived from the POC product decisions:

-   original uploads are private
-   object-storage buckets are not publicly listable
-   use signed/private access for moderation/admin
-   public pages expose aggregate statistics only
-   contribution codes must be sufficiently random to prevent
    enumeration
-   staff authentication protects moderation/admin endpoints
-   no persistent biometric identity data
-   no cross-image face recognition
-   browser detection results are only used for annotation association
-   public-display consent is stored separately from training consent
-   withdrawn assets can be located using the contribution code and
    deleted manually
-   deleted/withdrawn assets must stop contributing to public counts
-   secrets remain outside the public GitHub repository
-   machine-generated metadata stores provenance/model information

Final retention and deletion policy depends on legal review.

## 20. Failure Handling

### Upload Failure

Uploads are per image and independently retryable.

A failed upload should not force successful images to restart.

### Browser Detection Failure

Never block contribution because ML detection fails.

If detection: - finds nobody: contributor taps the represented people -
misses someone: contributor taps to add them - adds a false positive:
contributor removes it - cannot suggest skin tone: contributor chooses
directly from the Monk scale

### Server Processing Failure

Record processing state/error per asset.

Retry transient failures.

If an optional automatic check/enrichment cannot complete after retries,
the asset can still reach moderation with a visible `processing failed`
flag rather than silently disappearing.

### VLM Failure

Do not lose the contribution.

Moderation can proceed with missing automatic metadata if necessary.

## 21. Observability

Keep POC observability lightweight.

At minimum capture: - Rails application errors - background-job
failures - upload/storage failures - VLM/safety API failures -
processing durations - pending moderation count

Structured logs plus the normal Fly.io/application error tooling are
sufficient initially.

Avoid adding a separate analytics/data platform solely for the POC.

## 22. Testing Priorities

High-value tests:

### Backend

-   contribution lifecycle
-   consent persistence
-   asset status transitions
-   moderation approve/reject
-   coverage counts
-   withdrawal/deletion support operations
-   authorization for admin/moderator endpoints

### Frontend

-   multi-image upload flow
-   mobile interruption/recovery
-   people confirmation
-   multi-person annotation
-   required/optional field progression
-   review/edit flow

### Browser ML

Test against a deliberately diverse fixture set: - 1--4 people -
profiles / people looking away - different skin tones - different
lighting - partial occlusion - foreground + background crowds -
portraits vs full body - mobile-sized images

The person-size threshold and skin-tone suggestion quality should be
measured empirically before finalizing them.

## 23. Decisions Still Open

Implementation choices still to make:

1.  Object-storage provider and Rails integration.
2.  Exact browser-side person detector.
3.  Whether face detection is a second model or part of the selected
    detector.
4.  Exact Monk skin-tone estimation method.
5.  Server-side VLM/provider.
6.  Safety/moderation models or APIs.
7.  Technical blur/quality detection implementation.
8.  Exact background-job backend.
9.  Email provider.
10. Final upload limits after device testing.
11. Final person-size/confidence thresholds after detector testing.
12. Final legal retention/deletion requirements.

These are implementation decisions, not unresolved product-flow
questions.
