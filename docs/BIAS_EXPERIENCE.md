# Bias Experience

An interactive page that shows what an image model does with the same sentence run many times: it does not return a random person, it returns the average one. Each step lets the visitor remove one bias from the prompt, and the twenty results show that everything left unsaid still falls back to the default.

- **Online:** `/experience`, under the public header. The introduction before it and the "what we can do" ending after it (leading to the dashboard and the contribute button) come later.
- **Exhibition:** `/experience?present=true`, full screen, no navigation, touch first, back to the blank first screen after `experience_idle_seconds` (config/unbias.yml, default 90) without a touch.

## The experience

A dark stage (`bg-ink`). Left: the prompts. Right: the twenty images of the current prompt. Nothing else: no titles, no steps, no buttons besides the prompts, and one small `mono-caps` line, "Pick a prompt", above the choices.

1. Only the base prompt is offered: *Create a photo of a person.* The grid is twenty faint empty tiles.
2. Picking it turns the twenty tiles one by one, in a diagonal wave from top left to bottom right, onto its results.
3. The picked prompt becomes the current one and the next prompts appear below it, the added words highlighted: *…of a woman / man / non-binary person.*
4. Picking one adds it to the list, the other choices disappear, the grid turns again and the next choices appear. After the last step there are no more choices.
5. Any earlier prompt in the list can be tapped to go back to it.

Three levels of emphasis, from loudest to quietest:

| Element | Look |
|---|---|
| Current prompt | Cream text, 2px cream border, signal hard shadow; its added words on a signal block |
| Next prompts | Cream at 80%, cream border at 40%; added words in lime. Full cream on hover, signal border while loading |
| Earlier prompts | Cream at 35%, border at 10%; added words slightly brighter |

The images have no border and no shadow. Every tile floats on its own slow rhythm (`animate-float`, a few pixels up and down with a slight tilt, different duration and phase per tile), and the flip wave runs on top of that motion. Both stop under `prefers-reduced-motion`.

Each step covers one of the platform's dimensions:

| Step | Dimension | Choices |
|---|---|---|
| 1 | — | person |
| 2 | gender | woman, man, non-binary person |
| 3 | age | young, middle-aged, old |
| 4 | skin tone (prompted as origin) | Black, East Asian, South Asian, white |
| 5 | body | thin, plus-size |

## The prompt tree

`ExperienceTree` (`app/models/experience_tree.rb`) holds the steps and the English and French wording. Images are generated from the **English** prompt with identical settings; the French wording is only what French visitors read. `bin/rails experience:prompts` prints every prompt as CSV; the output is committed as `docs/experience-prompts.csv`.

| Depth | Prompts | Example |
|---|---|---|
| 0 | 1 | Create a photo of a person. |
| 1 | 3 | Create a photo of a woman. |
| 2 | 9 | Create a photo of a young woman. |
| 3 | 36 | Create a photo of a young Black woman. |
| 4 | 72 | Create a photo of a young Black woman who is plus-size. |
| **Total** | **121 prompts** | **2,420 images** |

One more body option costs 36 prompts (720 images); one more origin costs 9 + 18 = 27 prompts (540 images).

## Generation

- `ExperiencePrompt` is one node of the tree (`path` such as `person/woman/young`, English `prompt`, `depth`, `position` in tree order). `ExperiencePrompt.sync!` mirrors the tree: it creates new nodes, updates wording, and marks removed nodes `in_tree: false` without deleting their images. It runs in the seeds and whenever the admin page loads.
- `ExperienceImage` is one run of a prompt (`position` 1–20) with its own `status` (`pending → queued → generating → succeeded | failed`), `attempts`, `error`, the `prompt` and `model` used, and the image as an Active Storage attachment (`file`) with a preprocessed 640px WebP `display` variant.
- `GenerateExperiencePromptJob` creates the 20 rows of a prompt and enqueues one `GenerateExperienceImageJob` per image that is pending or failed. Finished, queued and running images are left alone, so the button is safe to press twice.
- `GenerateExperienceImageJob` calls the OpenAI Images API (`ImageGeneration::OpenaiClient`, `POST /v1/images/generations`, one image per call). Rate limits, server errors and timeouts are retried with backoff (6 attempts) and then marked failed; other errors (content policy, bad request, missing key) fail at once with the API's message. `limits_concurrency` keeps at most `image_generation_concurrency` calls in flight.
- Settings in `config/unbias.yml`: `experience_images_per_prompt` (20), `image_generation_model` (`gpt-image-2`, overridable with `OPENAI_IMAGE_MODEL`), `image_generation_size` (1024x1024), `image_generation_quality` (medium), `image_generation_format` (webp), `image_generation_concurrency` (4). Set `OPENAI_API_KEY` in the environment of the `worker` process.

## Admin

`/admin/experience` (admins only) lists every prompt in tree order, indented by depth, with a strip of 20 status squares (done ink, generating hatched, queued peach, failed signal, not started cream), the done count and a Generate (or Retry failed) button. "Generate everything missing" queues every prompt at once. Clicking a prompt shows its 20 images with their status and error, and Regenerate replaces a single image. The list refreshes every `stats_poll_seconds`.

## Serving

`GET /api/public/experience` returns the whole tree: for each prompt its `path`, `parent`, `step`, wording as segments in `en` and `fr` (`step` marks the words that step added) and 20 image paths (`null` where the image is not finished). Paths go through Active Storage's representation redirect, so the S3 bucket stays private. The response is cached in Solid Cache and served with an ETag that changes when an image changes. The page preloads a prompt's images before turning the tiles, and the next choices' images once the wave has finished.
