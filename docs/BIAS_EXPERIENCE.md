# Bias Experience

An interactive page that shows what an image model does with the same sentence run many times: it does not return a random person, it returns the average one. Each step lets the visitor remove one bias from the prompt, and the twenty results show that everything left unsaid still falls back to the default.

- **Online:** `/experience`, under the public header. The introduction before it and the "what we can do" ending after it (leading to the dashboard and the contribute button) come later.
- **Exhibition:** `/experience?present=true`, full screen, no navigation, touch first, back to the first step after `experience_idle_seconds` (config/unbias.yml, default 90) without a touch.

## The experience

Left: the prompt being built. Right: the twenty images that prompt produced.

1. Only the base prompt is shown, waiting to be run: *Create a photo of a person.* The grid is twenty hatched wells.
2. Running it turns the twenty tiles one by one, in a diagonal wave from top left to bottom right, to show the twenty results.
3. The run prompt stays in the list in ink, and the next step's suggestions appear below it, the added words highlighted: *…of a woman / man / non-binary person.*
4. Choosing one adds it to the list, the other suggestions disappear, the grid flips to its twenty results and the next suggestions appear.
5. After the last step the page says the result is still the default and offers to start again. Any earlier prompt in the list can be tapped to go back to it.

Each step covers one of the platform's dimensions:

| Step | Dimension on the platform | Suggestions |
|---|---|---|
| 1 | — | person |
| 2 | gender | woman, man, non-binary person |
| 3 | age | young, middle-aged, old |
| 4 | skin tone (prompted as origin) | Black, East Asian, South Asian, white |
| 5 | body and disability | plus-size, wears glasses, wears a hearing aid, uses a wheelchair |

Body and visible disability share the last step so the tree stays small enough to generate (see below).

## Prompts to generate

The tree lives in `app/frontend/lib/experience.js` (`STEPS`, plus the English and French wording). Every node is run **20 times** with the **English** prompt and identical settings (same model, size, quality, no seed or style changes). The French wording is only what French visitors read.

`bin/experience-prompts` prints the full manifest as CSV (folder, depth, images, prompt, French prompt); it is committed as `docs/experience-prompts.csv`. Regenerate it after changing the tree.

| Depth | Prompts | Example |
|---|---|---|
| 0 | 1 | Create a photo of a person. |
| 1 | 3 | Create a photo of a woman. |
| 2 | 9 | Create a photo of a young woman. |
| 3 | 36 | Create a photo of a young Black woman. |
| 4 | 144 | Create a photo of a young Black woman who wears glasses. |
| **Total** | **193 prompts** | **3,860 images** |

Adding one option to the last step costs 36 prompts (720 images); one more origin costs 9 + 36 = 45 prompts (900 images). Remove an option from `STEPS` to trim the tree; the page and the manifest follow.

## Image layout

Images are served from `experience_images_url` (`EXPERIENCE_IMAGES_URL`, default `/experience-images`, i.e. the gitignored `public/experience-images`). Each node is a folder named by its path in the tree, holding `01.webp` … `20.webp`, square:

```
person/01.webp … 20.webp
person/woman/01.webp …
person/woman/young/black/glasses/01.webp …
```

In production, upload the folders to S3 (public-read or behind the CDN) and set `EXPERIENCE_IMAGES_URL`. Generated images never go into git. A missing image shows its run number in a plain tile, so the page works before generation is done.
