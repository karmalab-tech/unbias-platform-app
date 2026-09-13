# Community Dataset Platform --- Future Improvements

This document collects features and ideas deliberately excluded from the
POC. They are not commitments or priorities; they are retained so useful
ideas are not lost.

## 1. Video Contributions

Add video as a contribution type.

This would require decisions around: - upload/transcoding - storage
costs - frame sampling - tracking people through time - temporal
annotations/captions - moderation UX - how video contributes to coverage
counts - training/export format

## 2. Dataset Export and Versioning

Create reproducible dataset snapshots for research and training.

Potential features: - immutable dataset versions - exact asset +
metadata membership - export formats - filters - provenance manifests -
consent/version checks before export - exclusion lists - reproducible
training snapshots

Example:

``` text
Dataset v0.1
12,400 images
Created Sep 12, 2026
```

## 3. LoRA Training Integration

Connect the community dataset to the future bias-correction training
pipeline.

Collection coverage and training weights remain separate.

A future workflow can: - evaluate a specific open-source model -
identify measured representation biases - select/sample dataset images
accordingly - derive per-model training weights - train a LoRA -
re-evaluate the corrected model - compare before/after results

Equal collection targets do not imply equal LoRA training weights.

## 4. Unique-Person / Repeated-Person Assistance

The POC intentionally does not track unique real-world identities.

Possible future feature: - browser-side similarity check within the
current upload batch - warn when the same person appears more than the
recommended 3 times

This should remain a soft warning and ideally avoid persistent biometric
identity records.

More advanced cross-photo identity matching would require significant
privacy/legal review before consideration.

## 5. Partial Permission and Anonymization

Support group images where permission is available for only some
identifiable people.

Possible workflow: - detect people/faces - contributor marks who has
permission - save relevant regions - blur/anonymize non-permitted people
server-side - verify anonymization during moderation

This was deliberately excluded because it substantially complicates the
first contribution flow.

## 6. Contributor Accounts and Management

Possible contributor features: - account/profile - contribution
history - Pending / Approved / Rejected status - view rejection
reasons - manage email/preferences - self-service withdrawal - partial
withdrawal per image - download contribution records

The POC uses a simple contribution code and manual support instead.

## 7. Self-Service Withdrawal

Allow contributors to enter their contribution code and: - view
submitted photos - withdraw an entire contribution - withdraw individual
images - see deletion status

This should preserve a clear audit trail without retaining withdrawn
media unnecessarily.

## 8. Public Raw-Dataset Access

The POC keeps raw media private.

Future access models could include: - controlled researcher access -
application-based access - signed data-use agreements - downloadable
approved subsets - public dataset releases

Privacy, consent, licensing and misuse risk must be evaluated before any
raw-media release.

## 9. Moderator Growth

As contribution volume grows: - moderator application form - admin
review/approval - moderator onboarding - moderation guidelines - quality
audits - reviewer agreement metrics - moderation history - escalation to
admins - workload distribution

## 10. Moderator Metadata Corrections

POC moderators only approve/reject.

If good images are frequently rejected because of contributor labeling
errors, add: - metadata correction - correction provenance - original vs
corrected value - optional second review for sensitive corrections

Moderator changes must never silently overwrite contributor-provided
values.

## 11. Richer Admin Dataset Management

Possible future controls: - create/edit representation dimensions -
create/edit buckets - UI labels and visual references -
activate/deactivate dimensions - geographic coverage - context
coverage - intersection analysis - filtering and exploration -
dataset-quality metrics

POC admins only edit target counts for the fixed taxonomy.

## 12. Intersection Analysis

Internally analyze combinations such as: - age × skin tone - age ×
gender - gender × skin tone - age × body - gender × body - age × visible
disability / assistive device

This can reveal imbalance hidden by individually balanced dimensions.

A future admin/research interface could expose matrices, filters and
scarcity statistics.

Avoid turning this into a giant public matrix unless there is a clear
communication purpose.

## 13. Automatic Scarcity Recommendations

Instead of manually writing "We need..." calls to action, a future
system could suggest under-covered categories/intersections.

Potential rules: - prioritize significantly under-target buckets - use
at most two dimensions per recommendation - avoid statistically
meaningless tiny intersections - allow admin approval/editing before
publication

The POC deliberately keeps these messages editorial and admin-managed.

## 14. Automatic Gender / Body Inference

Not included in the POC.

If ever explored, automatic inference should be treated only as an
assistive suggestion, never authoritative truth, and should be evaluated
carefully for bias and usefulness.

Given the project's subject matter, there may be little benefit in
automating these fields at all.

## 15. Additional Self-Described Metadata

Possible future optional fields: - ethnicity / cultural background -
nationality - religion

These should be self-described only and introduced only when there is a
clear research/training purpose.

Sexual orientation should not be inferred visually.

## 16. Richer Context and Geographic Analysis

Possible internal metadata: - country - broad region - clothing -
environment - activity - shot type - framing - indoor/outdoor - source
device - technical quality

Future dashboards could analyze contextual stereotypes and geographic
gaps.

## 17. Advanced Captioning and Regeneration

Because captions and structured metadata are stored separately, future
systems can: - regenerate captions with newer VLMs - compare caption
models for bias - version caption pipelines - audit demographic
leakage/speculation - generate training-specific captions without
changing source annotations

## 18. Social / Community Features

Possible later ideas: - contributor profiles - contribution history -
achievements - community milestones - social sharing - contribution
streaks - public activity

These should only be added if they improve collection without turning
representation into a competitive points system.

## 19. Advanced Public Visualizations

Possible future additions: - richer intersection visualization - recent
contribution activity - event-specific progress - historical growth
charts - geographic maps - model-specific collection campaigns

The POC public dashboard stays focused on the 10,000-people milestone,
primary dimensions and editorial calls to action.

## 20. Model-Specific Collection Campaigns

The community dataset is initially model-agnostic.

Later, measured deficiencies from the model-evaluation tool could inform
temporary collection campaigns, for example where a specific model lacks
enough corrective examples.

These should remain distinct from the general dataset's core coverage
targets.

## 21. Training / Dataset Publication

Future decisions: - whether trained LoRAs are open-source - methodology
publication - commercial-use terms - controlled dataset licensing -
research access - dataset redistribution - model cards / dataset cards -
documentation of known limitations and biases

## 22. Legal and Governance Maturity

As the project grows: - formal retention policy - automated deletion
workflows - versioned consent language - data-access governance -
research access agreements - audit logs - incident handling -
contributor rights workflow - legal review for biometric/similarity
features
