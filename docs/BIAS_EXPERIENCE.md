# Bias Experience

An interactive page that shows what an image model does with the same sentence run many times: it does not return a random person, it returns the average one. Each step lets the visitor remove one bias from the prompt, and the results show that everything left unsaid still falls back to the default.

- **Online:** `/experience`, under the public header. The introduction before it and the "what we can do" ending after it (leading to the dashboard and the contribute button) come later.
- **Exhibition:** `/experience?present=true`, full screen, no navigation, touch first, the Unbias logo top left. It goes back to the first screen (with a new mosaic) after `experience_idle_seconds` (config/unbias.yml, default 30) without a touch; `?idle=60` overrides it for one screen.

## The experience

A dark stage (`bg-night`, a darker shade of ink). Left: the prompts. Right: the fifteen portrait images (3:4, 5 × 3, sized to fit a 16:9 screen) of the current prompt. Nothing else: no titles, no steps, no buttons besides the prompts, and one small `mono-caps` line, "Pick a prompt", above the choices once the experience has started.

1. Only a *Show me how →* button (FR: *Montrez-moi comment*) is offered, under a two-line bold statement: *Everyday, we create more images with Gen AI. / These images are not neutral.* (FR: *Nous créons de plus en plus d’images avec l’IA générative. / Mais ces images ne sont pas neutres.*). The grid shows a random mosaic of fifteen finished images from the whole tree, never two from the same prompt (`randomMosaic`), drawn again at every idle reset.
2. The button fades the statement out and brings in four lines (*When you prompt an AI generation model, it always gives you the most average result. / Even if you do it many, many times. / This is how AI models work. / Try it for yourself.*) with the base prompt and its right arrow below, without the "Pick a prompt" line. The mosaic stays.
3. Picking the prompt fades the four lines and the arrow out, then turns the fifteen tiles one by one, in a diagonal wave from top left to bottom right, onto its results.
4. The picked prompt becomes the current one. On the base prompt only, three lines rise in under it (*These people do not exist, they were generated from data. / And they all look oddly similar. / Young, healthy, perfect.*) and leave with the next pick; then the next prompts appear below, the added words highlighted: *…of a young / middle-aged / old person.*
5. Picking one, in this order: the other choices (and on the first step the statement) fade out; the tiles turn while the picked prompt glides up into place as the current prompt; once the tiles have turned, the next choices rise in one after another. After the last step, *Do you want to help?* (FR: *Vous voulez nous aider ?*) rises in instead, followed in exhibition mode by the contribute QR code (`/qr.svg`) with a small *Scan this QR code*, and online by a *Learn more →* button to the dashboard (`/`).
6. Any earlier prompt in the list can be tapped to go back to it, with the same motion.

Every state change (border, text, shadow, highlight colour) eases over 300 ms. The column motion is a FLIP animation keyed by prompt path (`BiasExperience.js`); it is skipped under `prefers-reduced-motion`.

Three levels of emphasis, from loudest to quietest:

| Element | Look |
|---|---|
| Current prompt | Cream text, 2px cream border, signal hard shadow; its added words on a signal block |
| Next prompts | Cream at 80%, cream border at 40%; added words in lime. Full cream on hover, signal border while loading |
| Earlier prompts | Cream at 35%, border at 10%; added words slightly brighter |

The images have no border and no shadow. Every tile floats on its own slow rhythm (`animate-float`, 2.5 px up and down with a barely visible tilt, 7–10 s per cycle, different phase per tile), and the flip wave runs on top of that motion. Both stop under `prefers-reduced-motion`.

The steps:

| Step | Dimension | Choices |
|---|---|---|
| 1 | — | person |
| 2 | age | young, middle-aged, old |
| 3 | skin tone (prompted as origin) | Black, Asian, Arab, white |
| 4 | profession | doctor, teacher, parent |
| 5 | gender | female, male (*mother* / *father* for a parent) |

Until the last step nobody names a gender: the model picks one for every image, so each prompt shows its own split of men and women. The profession step is there to swing that split hardest (*doctor* tends towards men, *parent* towards women); it comes after origin because the difference between an Arab and a white doctor matters less than between a person and a doctor. Gender comes last to see whether naming it actually pulls the images away from the default.

French: before the profession, prompts say *une personne* and adjectives agree with it (*une personne noire âgée*). A bare profession uses inclusive spelling, as on the posters (*un·e médecin noir·e âgé·e*, *un·e enseignant·e*, *un·e parent*). The gender step then writes the gendered form (*une femme médecin noire âgée*, *un homme enseignant blanc*, *une mère*, *un père*).

## The prompt tree

`ExperienceTree` (`app/models/experience_tree.rb`) defines the steps and the **default** English and French wording. The wording that is actually used lives in the database (`experience_prompts.prompt` and `prompt_fr`):

- `bin/rails db:seed` (or `bin/rails experience:seed`, e.g. on Fly with `fly ssh console -C "bin/rails experience:seed"`) creates every prompt missing from the table with the default wording. It never overwrites wording already stored, so it is safe to run again; nodes removed from `ExperienceTree` are kept but left out of the tree. Opening `/admin/experience` runs the same seed.
- `bin/rails experience:reset_wording` overwrites every prompt with the default wording, after the defaults change in code. It discards admin edits.
- Admins then edit either wording from `/admin/experience` (click a prompt). Images are generated from the **English** prompt; the French wording is only what French visitors read.
- The highlighted words are not stored: the page marks the words of a prompt that are not in its parent prompt (word-level diff), so edits keep their highlight.
- `bin/rails experience:prompts` prints every prompt as CSV from the database; the default wording is committed as `docs/experience-prompts.csv`.

| Depth | Prompts | Example |
|---|---|---|
| 0 | 1 | Create a photo of a person. |
| 1 | 3 | Create a photo of a young person. |
| 2 | 12 | Create a photo of a young Black person. |
| 3 | 36 | Create a photo of a young Black doctor. |
| 4 | 72 | Create a photo of a young Black female doctor. |
| **Total** | **124 prompts** | **1,860 images** |

Every extra option multiplies the levels below it: one more profession costs 36 prompts (540 images), one more origin 3 + 9 + 18 = 30 prompts (450 images). At GPT Image 2's listed portrait prices (1024 × 1536) the full tree costs about $9 (low), $76 (medium) or $305 (high); with the first prompt uploaded, 123 prompts are left to generate. At 4 images at a time and about 1.5 min per image, a full run takes around 12 hours.

Wording choices: prompts are written the way people actually type them. *white* rather than *Caucasian* (a term from 18th-century race classification that US style guides advise against), *Arab* for people (*Arabic* is the language). Highlights ignore *a/an* and *un/une* swaps and French agreement (*noire*, *noir·e* and *noir* count as the same word), so only the word a step adds lights up.

There is deliberately no body (or beauty, or character) step: after age and origin the images still show the default body, health and looks without anyone asking for them, which is the point, and pairing an ethnicity with *fat*, *ugly* or *angry* on a public screen is a risk not worth taking. Body is still a platform dimension; it is just not prompted here.

## Generation

- `ExperiencePrompt` is one node of the tree (`path` such as `person/young/black/doctor/female`, English `prompt`, French `prompt_fr`, `depth`, `position` in tree order).
- `ExperienceImage` is one run of a prompt (`position` 1–15) with its own `status` (`pending → queued → generating → succeeded | failed`), `attempts`, `error`, the `prompt` and `model` used, and the image as an Active Storage attachment (`file`) with a preprocessed WebP `display` variant (600 × 800 max).
- `GenerateExperiencePromptJob` creates the 15 rows of a prompt and enqueues one `GenerateExperienceImageJob` per image that is pending, failed, or **outdated** (made from an older English prompt). Finished, queued and running images are left alone, so the button is safe to press twice. Outdated images are hidden from the public page until they are replaced.
- `GenerateExperienceImageJob` calls the OpenAI Images API (`ImageGeneration::OpenaiClient`, `POST /v1/images/generations`, one image per call). Rate limits, server errors and timeouts are retried with backoff (6 attempts) and then marked failed; other errors (content policy, bad request, missing key) fail at once with the API's message. `limits_concurrency` keeps at most `image_generation_concurrency` calls in flight.
- Settings in `config/unbias.yml`: `experience_images_per_prompt` (15), `image_generation_model` (`gpt-image-2`, overridable with `OPENAI_IMAGE_MODEL`), `image_generation_size` (1024x1536, portrait; the page crops to 3:4), `image_generation_quality` (medium), `image_generation_format` (webp), `image_generation_concurrency` (4). Set `OPENAI_API_KEY` in the environment of the `worker` process.

## Admin

`/admin/experience` (admins only) lists every prompt in tree order, indented by depth, with its French wording below, a strip of 15 status squares (done ink, outdated lime, generating hatched, queued peach, failed signal, not started cream), the done count and a Generate (Retry failed, or Update outdated) button. "Generate everything missing" queues every prompt at once. Clicking a prompt opens its English and French wording for editing and its 15 images with their status and error; Regenerate replaces a single image, Remove empties its spot. The list refreshes every `stats_poll_seconds`.

### Your own images

A prompt can use images made outside the app (for example the ones already used on posters and flyers). Open the prompt in `/admin/experience` and drop files on the dashed zone, or pick them with Choose files: each file goes to the next free spot, one request per file (`POST /api/admin/experience_prompts/:id/upload`), and files beyond the free spots are refused with a notice. Dropping one file on a single spot replaces that spot. JPEG, PNG or WebP up to `max_file_bytes`; the page crops them to 3:4.

Uploaded images are stored like generated ones but with `source: uploaded`: they are never marked outdated when the English wording changes, Generate leaves them alone, and Regenerate or Remove turns the spot back into a normal generated one.

## Serving

`GET /api/public/experience` returns the whole tree: for each prompt its `path`, `parent`, `step`, wording as segments in `en` and `fr` (`added: true` on the words not in the parent prompt) and 15 image paths (`null` where the image is not finished or outdated). Paths go through Active Storage's proxy route (`/rails/active_storage/representations/proxy/…`): images are served from the app's own domain, so the S3 bucket stays private and the service worker can cache them. The response is cached in Solid Cache and served with an ETag that changes when a prompt or an image changes. The page preloads a prompt's images before turning the tiles, and the next choices' images once the wave has finished.

## Offline

`public/sw.js` covers `/experience` like the dashboard pages: the page, `/api/public/experience`, settings, the QR code and the built assets are served from cache when the network is slow (4 s) or gone. Images use a separate, unversioned cache (`unbias-experience-images`), cache first, since their URLs change whenever an image changes.

- **Exhibition (`?present=true`):** once the tree loads, the page asks the worker to download every finished image (6 at a time) and to delete cached images no longer in the tree. 1,860 images at 600 × 800 WebP is in the order of 110 MB. Open the page online once on the day, wait for the download to finish, and the whole tree then plays without network.
- **Online:** only images the visitor has already seen are kept, so phones never download the whole tree.

The service worker is registered in production builds only.
