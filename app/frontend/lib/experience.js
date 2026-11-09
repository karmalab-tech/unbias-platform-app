// Prompt tree of the bias experience. Each step refines one platform dimension (`dimensions`). Every node is generated IMAGES_PER_PROMPT times, ahead of time,
// with the English prompt and identical settings. Pure module: bin/experience-prompts imports it from Node.

export const IMAGES_PER_PROMPT = 20;
export const GRID_COLUMNS = 5;
export const ROOT_ID = "person";

export const STEPS = [
  {
    key: "gender",
    dimensions: ["gender"],
    options: ["woman", "man", "non_binary"],
  },
  { key: "age", dimensions: ["age"], options: ["young", "middle_aged", "old"] },
  {
    key: "origin",
    dimensions: ["skin_tone"],
    options: ["black", "east_asian", "south_asian", "white"],
  },
  {
    key: "body",
    dimensions: ["body", "disability"],
    options: ["plus_size", "glasses", "hearing_aid", "wheelchair"],
  },
];

const EN = {
  gender: { woman: "woman", man: "man", non_binary: "non-binary person" },
  age: { young: "young", middle_aged: "middle-aged", old: "old" },
  origin: {
    black: "Black",
    east_asian: "East Asian",
    south_asian: "South Asian",
    white: "white",
  },
  body: {
    plus_size: "who is plus-size",
    glasses: "who wears glasses",
    hearing_aid: "who wears a hearing aid",
    wheelchair: "who uses a wheelchair",
  },
};

const FR_FEMININE = { woman: true, man: false, non_binary: true };

const FR = {
  gender: { woman: "femme", man: "homme", non_binary: "personne non binaire" },
  origin: {
    black: ["noire", "noir"],
    east_asian: ["est-asiatique", "est-asiatique"],
    south_asian: ["sud-asiatique", "sud-asiatique"],
    white: ["blanche", "blanc"],
  },
  old: ["âgée", "âgé"],
  body: {
    plus_size: "de forte corpulence",
    glasses: "qui porte des lunettes",
    hearing_aid: "qui porte un appareil auditif",
    wheelchair: "en fauteuil roulant",
  },
};

// A selection is the list of chosen option keys, one per step, in step order.
export function nodeId(selection) {
  return [ROOT_ID, ...selection].join("/");
}

export function nextStep(selection) {
  return STEPS[selection.length] ?? null;
}

export function suggestions(selection) {
  const step = nextStep(selection);
  return step ? step.options.map((option) => [...selection, option]) : [];
}

function chosen(selection) {
  return Object.fromEntries(
    selection.map((option, index) => [STEPS[index].key, option])
  );
}

function englishSegments(selection) {
  const pick = chosen(selection);
  const words = [
    pick.age && { text: EN.age[pick.age], step: "age" },
    pick.origin && { text: EN.origin[pick.origin], step: "origin" },
    pick.gender
      ? { text: EN.gender[pick.gender], step: "gender" }
      : { text: "person" },
  ].filter(Boolean);
  const article = /^[aeiou]/i.test(words[0].text) ? "an" : "a";
  const segments = [{ text: `Create a photo of ${article}` }];
  words.forEach((word) => segments.push({ text: " " }, word));
  if (pick.body)
    segments.push({ text: " " }, { text: EN.body[pick.body], step: "body" });
  segments.push({ text: "." });
  return segments;
}

function frenchSegments(selection) {
  const pick = chosen(selection);
  const feminine = pick.gender ? FR_FEMININE[pick.gender] : true;
  const form = feminine ? 0 : 1;
  const segments = [{ text: `Crée une photo d’${feminine ? "une" : "un"} ` }];
  if (pick.age === "young")
    segments.push({ text: "jeune", step: "age" }, { text: " " });
  segments.push(
    pick.gender
      ? { text: FR.gender[pick.gender], step: "gender" }
      : { text: "personne" }
  );
  if (pick.origin)
    segments.push(
      { text: " " },
      { text: FR.origin[pick.origin][form], step: "origin" }
    );
  if (pick.age === "middle_aged")
    segments.push({ text: " " }, { text: "d’âge mûr", step: "age" });
  if (pick.age === "old")
    segments.push({ text: " " }, { text: FR.old[form], step: "age" });
  if (pick.body)
    segments.push({ text: " " }, { text: FR.body[pick.body], step: "body" });
  segments.push({ text: "." });
  return segments;
}

// Prompt split into segments; `step` marks the words each step added, so the UI can highlight them.
export function promptSegments(selection, locale = "en") {
  return locale === "fr"
    ? frenchSegments(selection)
    : englishSegments(selection);
}

export function promptText(selection, locale = "en") {
  return promptSegments(selection, locale)
    .map((segment) => segment.text)
    .join("");
}

export function imageUrls(selection, baseUrl) {
  const base = String(baseUrl ?? "").replace(/\/+$/, "");
  return Array.from(
    { length: IMAGES_PER_PROMPT },
    (_, index) =>
      `${base}/${nodeId(selection)}/${String(index + 1).padStart(2, "0")}.webp`
  );
}

// Diagonal wave from the top-left tile to the bottom-right one.
export function waveDelay(index, stepMs, columns = GRID_COLUMNS) {
  return (Math.floor(index / columns) + (index % columns)) * stepMs;
}

// Every node of the tree, depth first, for the generation manifest.
export function allSelections(selection = []) {
  return [
    selection,
    ...suggestions(selection).flatMap((child) => allSelections(child)),
  ];
}
