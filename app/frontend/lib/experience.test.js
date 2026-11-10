import { describe, expect, it } from "vitest";
import {
  floatTiming,
  imagePaths,
  indexTree,
  lineage,
  randomMosaic,
  segmentsFor,
  waveDelay,
} from "~/lib/experience";

const payload = {
  images_per_prompt: 20,
  prompts: [
    { path: "person", parent: null, segments: { en: [{ text: "A" }] } },
    {
      path: "person/woman",
      parent: "person",
      segments: { en: [], fr: [{ text: "F" }] },
    },
    { path: "person/man", parent: "person", segments: { en: [] } },
    {
      path: "person/woman/young",
      parent: "person/woman",
      segments: { en: [] },
    },
  ],
};

describe("experience tree", () => {
  it("indexes the tree by path and parent", () => {
    const tree = indexTree(payload);
    expect(tree.root.path).toBe("person");
    expect(tree.imagesPerPrompt).toBe(20);
    expect(tree.children.get("person").map((p) => p.path)).toEqual([
      "person/woman",
      "person/man",
    ]);
  });

  it("walks from the root to a prompt", () => {
    const tree = indexTree(payload);
    expect(lineage(tree, "person/woman/young").map((p) => p.path)).toEqual([
      "person",
      "person/woman",
      "person/woman/young",
    ]);
    expect(lineage(tree, "nowhere")).toEqual([]);
  });

  it("lists every finished image of the tree", () => {
    expect(
      imagePaths({
        prompts: [{ images: ["/a", null] }, { images: [null, "/b"] }],
      })
    ).toEqual(["/a", "/b"]);
  });

  it("builds a starting mosaic with at most one image per prompt", () => {
    const prompts = Array.from({ length: 30 }, (_, p) => ({
      images: [`/${p}/1`, null, `/${p}/3`],
    }));
    const mosaic = randomMosaic(prompts, 15);
    expect(mosaic).toHaveLength(15);
    expect(new Set(mosaic.map((url) => url.split("/")[1])).size).toBe(15);
  });

  it("leaves tiles empty when fewer prompts have images", () => {
    const prompts = [
      { images: ["/a"] },
      { images: [null] },
      { images: ["/b"] },
    ];
    const mosaic = randomMosaic(prompts, 4);
    expect(mosaic.filter(Boolean).sort()).toEqual(["/a", "/b"]);
    expect(mosaic.slice(2)).toEqual([null, null]);
  });

  it("falls back to English wording", () => {
    const tree = indexTree(payload);
    expect(segmentsFor(tree.byPath.get("person/woman"), "fr")).toEqual([
      { text: "F" },
    ]);
    expect(segmentsFor(tree.root, "fr")).toEqual([{ text: "A" }]);
  });

  it("flips tiles in a diagonal wave", () => {
    expect(waveDelay(0, 70)).toBe(0);
    expect(waveDelay(1, 70)).toBe(70);
    expect(waveDelay(5, 70)).toBe(70);
    expect(waveDelay(19, 70)).toBe(7 * 70);
  });

  it("gives tiles different floating rhythms", () => {
    const timings = Array.from({ length: 20 }, (_, i) => floatTiming(i));
    expect(new Set(timings.map((t) => t.duration)).size).toBeGreaterThan(10);
    timings.forEach(({ duration, delay }) => {
      expect(delay).toBeLessThanOrEqual(0);
      expect(-delay).toBeLessThan(duration);
    });
  });
});
