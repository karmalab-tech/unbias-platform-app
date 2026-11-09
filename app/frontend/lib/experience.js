// Pure helpers for the bias experience. The tree itself comes from /api/public/experience.

export const GRID_COLUMNS = 5;

export function indexTree(payload) {
  const byPath = new Map();
  const children = new Map();
  for (const prompt of payload.prompts) {
    byPath.set(prompt.path, prompt);
    if (prompt.parent) {
      if (!children.has(prompt.parent)) children.set(prompt.parent, []);
      children.get(prompt.parent).push(prompt);
    }
  }
  const root = payload.prompts.find((prompt) => !prompt.parent) ?? null;
  return { root, byPath, children, imagesPerPrompt: payload.images_per_prompt };
}

// Root first, down to the prompt at `path`.
export function lineage(tree, path) {
  const chain = [];
  for (
    let node = tree.byPath.get(path);
    node;
    node = tree.byPath.get(node.parent)
  ) {
    chain.unshift(node);
  }
  return chain;
}

export function segmentsFor(prompt, locale) {
  return prompt.segments[locale] ?? prompt.segments.en;
}

// Diagonal wave from the top-left tile to the bottom-right one.
export function waveDelay(index, stepMs, columns = GRID_COLUMNS) {
  return (Math.floor(index / columns) + (index % columns)) * stepMs;
}

// Each tile drifts on its own rhythm so the grid never moves in unison.
export function floatTiming(index) {
  const duration = 5.5 + ((index * 37) % 31) / 10;
  return { duration, delay: -((index * 1.9) % duration) };
}
