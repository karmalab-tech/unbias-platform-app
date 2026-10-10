import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

const COLOURS =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

// Signal / Edge only: see docs/DESIGN_LANGUAGE.md.
const FORBIDDEN = [
  [/\brounded(?:-[\w[\]./]+)?(?=[\s"'`])/, "rounded corners"],
  [
    new RegExp(
      `\\b(?:bg|text|border|ring|outline|fill|stroke|divide|from|to|via)-(?:${COLOURS})-\\d`
    ),
    "Tailwind default colour",
  ],
  [/\b(?:bg|text|border|divide|ring)-(?:white|black)\b/, "white or black"],
  [/\boutline-none\b/, "removed focus outline"],
  [/\bshadow-(?:xs|sm|md|lg|xl|2xl)\b/, "soft shadow"],
  [/\bbackdrop-blur/, "blur"],
  [/\b(?:bg|text)-gradient|\bfrom-\w+|\bvia-\w+/, "gradient"],
  [/\bfont-(?:sans|serif)\b/, "other typeface"],
  [/Instrument Sans|fonts\.googleapis/i, "other typeface"],
  [/\b(?:bg|text|border)-(?:accent|hairline|shell|on-dark)\b/, "old token"],
  [/#[0-9a-fA-F]{6}\b/, "hex colour in a component"],
];

const ROOT = new URL("../../..", import.meta.url).pathname;

function files(dir, extensions) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, extensions);
    return extensions.some((ext) => name.endsWith(ext)) &&
      !name.endsWith(".test.js")
      ? [path]
      : [];
  });
}

const sources = [
  ...files(join(ROOT, "app/frontend/components"), [".js"]),
  ...files(join(ROOT, "app/frontend/pages"), [".js"]),
  ...files(join(ROOT, "app/views/gate"), [".erb"]),
];

describe("design language", () => {
  it("finds sources to check", () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it.each(sources.map((path) => [path.replace(ROOT, ""), path]))(
    "%s stays inside Signal / Edge",
    (_name, path) => {
      const text = readFileSync(path, "utf8");
      const found = FORBIDDEN.filter(([pattern]) => pattern.test(text)).map(
        ([, label]) => label
      );
      expect(found).toEqual([]);
    }
  );
});
