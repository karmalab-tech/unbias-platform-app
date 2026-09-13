# Community Dataset Platform --- POC Design Document

## 1. Purpose

Build a public, image-only contribution platform for collecting a
diverse, consented dataset for representation research and future
bias-correction training for open-source generative models.

The POC has four core jobs:

1.  Make contributing images extremely simple.
2.  Collect useful, contributor-confirmed representation metadata.
3.  Human-review every image before it enters the dataset.
4.  Make collection progress visible and motivating through live
    coverage goals.

The platform works both as a normal website and as the contribution
backend for the IA·gora installation.

## 2. POC Principles

-   Mobile-first contribution taking only a few minutes.
-   Upload is the first meaningful action.
-   Public experience feels collective and playful, not bureaucratic.
-   Image-only.
-   Every approved image is human-reviewed.
-   Sensitive representation metadata is contributor-confirmed, not
    inferred as fact by AI.
-   Machine-generated metadata remains separate from contributor
    metadata.
-   Training/dataset consent and public-display consent are separate.
-   Raw contributed media remains private.
-   Public statistics expose aggregate counts only.
-   No contributor account is required.

## 3. Users

### Contributor

Uploads one or more images and annotates the clearly represented people.

### Moderator

Reviews images, annotations, automatic metadata and flags, then approves
or rejects each image.

### Admin

Views collection coverage, edits target counts, manages public calls to
action and moderator access.

### Public Visitor

Views live progress and can start contributing.

## 4. Dataset Structure

Images may contain **1--4 clearly represented adults**.

A person does not need to face the camera, but must be large and visible
enough to be meaningfully annotated. Tiny/incidental background people
are ignored.

All clearly represented people must be 18+, and the contributor confirms
permission from each clearly represented / identifiable person.

Multiple photos may be uploaded in one contribution. Contributors are
asked to upload no more than **3 photos of the same person**.

### Age

-   18--29
-   30--44
-   45--59
-   60--74
-   75+
-   Not sure

### Skin Tone

Use the **Monk Skin Tone scale, 1--10**.

Browser-side analysis suggests a value. The contributor sees the visual
scale and must explicitly confirm or adjust it.

Store the automatic suggestion and contributor-confirmed value
separately.

### Gender

-   Woman
-   Man
-   Non-binary / gender-diverse
-   Not sure
-   Prefer not to say

No automatic gender inference.

### Body

Use silhouette icon + explicit label: - Thin - Medium - Large - Very
large - Not visible enough - Not sure

No automatic body inference.

### Visible Disability / Assistive Device

Optional positive multi-select: - Glasses - Hearing aid - Wheelchair -
Cane / crutches / walker - Prosthetic - Limb difference - Other
assistive device / visible disability

No selection means none visible. This field never blocks progression.

## 5. Coverage Goals

### Milestone

**10,000 people represented**

This counts person representations across approved images, not unique
identities.

### Age

Equal targets: - 18--29: 2,000 - 30--44: 2,000 - 45--59: 2,000 - 60--74:
2,000 - 75+: 2,000

### Skin Tone

Equal targets: - Monk 1--10: 1,000 each

### Gender

-   Women: 4,000
-   Men: 4,000
-   Non-binary / gender-diverse: 2,000

The public UI shows absolute targets, not percentages.

### Body

Equal targets: - Thin: 2,500 - Medium: 2,500 - Large: 2,500 - Very
large: 2,500

### Visible Disability / Assistive Device

Independent targets: - Glasses: 1,500 - Hearing aid: 500 - Wheelchair:
500 - Cane / crutches / walker: 500 - Prosthetic: 500 - Limb difference:
500 - Other: 500

No public target is shown for people without a visible
disability/assistive device.

`Not sure`, `Prefer not to say` and `Not visible enough` do not
contribute to targets.

Reaching a target never closes a category.

## 6. Contribution Flow

``` text
Landing / Upload
→ Permission
→ Photo review / people confirmation
→ Representation annotation
→ Review
→ Consent / licensing
→ Submit
→ Success
```

### Landing / Upload

Show: - project name + one-line explanation - large **Upload photos**
CTA - short vertical intro-video thumbnail - `What is this?` / FAQ link

The video is optional and opens fullscreen on mobile/touchscreens.

Allow taking a photo or selecting multiple images.

Show examples with 1--4 clearly represented people and the notice:

> Please upload no more than 3 photos of the same person.

Target formats: - JPEG - PNG - WebP - HEIC

Initial technical guidance: - approximately 768 px minimum shortest
side - approximately 20 MB maximum/file - no restrictive aspect ratio -
no AI-generated / synthetic images

Final thresholds are determined during implementation testing.

### Permission

Shown once per batch after upload.

Contributor confirms: - all clearly represented people are 18+ -
permission has been obtained from every clearly represented /
identifiable person

### Photo Review / People Confirmation

Browser-side person detection, optionally assisted by face detection,
proposes the clearly represented people.

Use confidence and relative-size filtering to ignore tiny background
figures.

Show numbered markers on the original image:

> We found 3 people. Is that right?

Contributor can: - confirm - remove a false detection - tap a missed
person to add them

No manual bounding-box drawing.

If zero people are detected, the contributor can tap people to annotate.

Images with more than 4 clearly represented people are not suitable for
the POC.

The contributor-confirmed list is canonical.

### Representation Annotation

Keep the full image visible and annotate one person at a time.

``` text
Photo 2 of 5 · Person 1 of 3
```

Show all fields on one screen: - Age - Monk skin tone - Gender - Body -
optional disability/assistive-device tags

The selected person is highlighted on the image.

Required: - Age - Skin tone - Gender - Body

After these four are answered, `Next person` becomes enabled.

Do not auto-advance. The contributor explicitly continues after
optionally adding disability tags.

### Review

Show a thumbnail grid of all uploaded photos with: - completion state -
number of annotated people

Any photo can be reopened and edited.

### Consent / Licensing

Shown once per batch.

Separate: - required permission for storage, processing, dataset use and
AI evaluation/training - optional permission for public display on the
project website, exhibitions and installations

Raw contributed media remains private.

Researchers/trainers can contact the project to discuss controlled
dataset access.

Final legal wording requires legal review.

### Submit / Success

Pending contributions immediately affect the pending portion of public
coverage bars.

Success message:

> **Thank you! You added 4 people to the dataset.**

Show concrete contribution impact.

Then:

> **Keep this code safely**\
> You'll need it if you ever want to manage or withdraw your
> contribution.

``` text
UNB-8F3K-29AD    [Copy]

[ Get the code by email ]
```

The email button opens a modal:

``` text
Get your code by email

Email
[________________________]

□ Keep me updated about the project

[ Send code ]
```

Email is optional. The project-updates checkbox is a separate explicit
opt-in.

### Withdrawal

No self-service withdrawal UI.

The FAQ tells contributors to contact the project with their
contribution code. Withdrawal is handled manually by email, including
partial removal of selected photos.

Withdrawn media is removed from storage and future dataset/training use.

## 7. Automatic Processing

### Browser-Side

**Person detection** - identify annotation targets - associate
representation metadata with the correct person - ignore
incidental/background people using size/confidence heuristics

This is detection, not persistent identity recognition.

**Monk skin-tone suggestion** - analyze the visible face/skin region -
suggest a Monk value - require contributor confirmation

### Server-Side

After submission: - context / setting classification - neutral scene
description - caption generation - technical quality checks - duplicate
/ perceptual-hash checks - safety flags

### Context

Contributors do not annotate context.

A VLM classifies it from a strict vocabulary, for example:

``` json
{
  "setting": ["outdoors", "public_space"],
  "context": ["social", "everyday"]
}
```

### Captioning

Use: 1. contributor-confirmed structured representation metadata 2.
VLM-generated neutral description of non-sensitive visual content

The VLM may describe clothing, pose, visible action, setting, framing,
objects and lighting.

It must not infer gender, age, skin tone, ethnicity, religion,
nationality, relationships, profession, wealth/class, personality or
other sensitive/speculative identity attributes.

Store separately: - confirmed structured metadata - raw VLM scene
description - generated caption - caption model/version

## 8. Metadata Provenance

Record the source of every value: - contributor - automatic -
moderator - derived

Never silently overwrite one source with another.

Example:

``` json
{
  "skin_tone_auto": {"value": 7, "source": "automatic"},
  "skin_tone_confirmed": {"value": 8, "source": "contributor"}
}
```

## 9. Moderation

Every image is human-reviewed before entering the dataset.

``` text
Submitted
→ Automatic checks
→ Pending review
→ Human moderation
→ Approved / Rejected
```

Moderation is **per image**, not per contribution.

### Queue

Default ordering: oldest pending first.

Show queue summary:

``` text
Pending 428 · Approved today 173 · Rejected today 21
```

### Review Screen

Moderator sees: - large full image - numbered annotated people - all
contributor-confirmed person labels - automatic context - generated
caption - automatic flags - submission code - submission date

Automatic flags are advisory and may include: - unusable
resolution/quality - blur - duplicate - possible minor - possible
synthetic/AI-generated image - unsafe/inappropriate content

### Actions

Only: - **Approve** - **Reject**

No metadata editing in the POC.

Reject requires a predefined reason: - Permission / consent issue -
Minor visible - Unusable image quality - Incorrect labeling -
Duplicate - AI-generated / synthetic - Inappropriate content - Does not
meet contribution guidelines - Other

No free-text rejection reason.

Keyboard shortcuts: - `A`: approve - `R`: reject - `1–9`: rejection
reason after `R` - `← / →`: previous / next

Approved images move from pending to approved counts. Rejected images
are removed from pending counts.

## 10. Public Dashboard / Homepage

Use the same visual system for the public website and IA·gora
installation.

### Header

Minimal navigation:

``` text
What is this? · ▶ Watch video · Contribute
```

`What is this?` opens the About page.

`Watch video` opens the intro video fullscreen, including on
touchscreens.

### Hero

Large live metric:

``` text
6,482 / 10,000 people
```

Show overall progress and a short explanation.

### Calls to Action

Show 2--3 admin-written messages high on the page:

``` text
Looking for people aged 75+
We need more wheelchair users
```

Include a clear contribution CTA.

### Representation Progress

Group progress bars by: - Age - Skin tone - Gender - Body - Disability /
assistive devices

Each bucket shows: - approved - pending - target - total contributed
count

Pending and approved are visually distinct.

### Footer / Secondary Navigation

Include: - What is this? - FAQ - Contribute - project / KarmaLab credits

## 11. IA·gora Installation Mode

Large interactive screen(s) show: - intro video / fullscreen play
button - live total toward 10,000 people - representation progress -
2--3 current calls to action - permanent QR code + short URL -
`What is this?` link

Visitor phone uses the normal contribution flow.

After submission, installation counts react immediately using pending
counts while keeping pending/approved visually distinct.

## 12. Admin

Small desktop interface with three sections.

### Dashboard

Show: - total represented people - image count - pending count -
approved/pending/target coverage charts - exact category counts

### Calls to Action

CRUD for public messages: - caption - optional related dataset buckets -
active/inactive - display order

Maximum 3 active.

### Settings

**Coverage targets**

Editable target count for each existing bucket. Changing a target
updates public progress immediately.

Representation dimensions/buckets themselves are not editable through
the POC admin.

**Moderators**

Simple access list: - email - role - added date - remove

Roles: - Admin - Moderator

Moderator has moderation-queue access only.

## 13. Suggested Data Model

### Submission

``` text
id
public_code
status
optional_email
updates_opt_in
created_at
```

### Asset

``` text
id
submission_id
type: image
storage_path
width
height
file_hash
technical_metadata
status
```

### PersonAnnotation

``` text
id
asset_id
person_index
detection_region
created_at
```

The detection region associates UI/metadata with a person. It is not a
persistent identity.

### MetadataValue

``` text
asset_id
person_annotation_id
field
value
source
confidence
created_at
```

`person_annotation_id` is nullable for image-level metadata.

### Consent

``` text
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
label
value
display_order
target_count
```

### ModerationDecision

``` text
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

## 14. Privacy and Safety

POC principles: - adults only - permission required from clearly
represented / identifiable people - training/dataset consent required -
public-display consent separate and optional - raw contributed media
private - aggregate public statistics only - human-readable private
contribution code - manual withdrawal by email/support - withdrawn media
removed from storage and future use

Final consent/licensing wording, retention periods and exact legal
obligations require legal review before launch.

## 15. Technical Decisions Still Open

To define next: 1. web app/backend stack 2. database and object storage
3. browser-side person/face detector 4. Monk skin-tone suggestion
implementation 5. server-side VLM 6. safety/quality checks 7.
background-processing approach 8. real-time dashboard mechanism 9.
deployment/infrastructure 10. final tested upload/detection thresholds
