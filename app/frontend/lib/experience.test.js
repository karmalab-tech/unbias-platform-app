import { describe, expect, it } from "vitest";
import {
  IMAGES_PER_PROMPT,
  STEPS,
  allSelections,
  imageUrls,
  nextStep,
  nodeId,
  promptSegments,
  promptText,
  suggestions,
  waveDelay,
} from "~/lib/experience";

describe("experience tree", () => {
  it("starts from the plain prompt", () => {
    expect(promptText([])).toBe("Create a photo of a person.");
    expect(promptText([], "fr")).toBe("Crée une photo d’une personne.");
    expect(nodeId([])).toBe("person");
  });

  it("adds one detail per step", () => {
    expect(promptText(["woman"])).toBe("Create a photo of a woman.");
    expect(promptText(["woman", "young"])).toBe(
      "Create a photo of a young woman."
    );
    expect(promptText(["man", "old", "east_asian", "glasses"])).toBe(
      "Create a photo of an old East Asian man who wears glasses."
    );
    expect(promptText(["non_binary", "middle_aged", "black"], "fr")).toBe(
      "Crée une photo d’une personne non binaire noire d’âge mûr."
    );
    expect(promptText(["man", "old", "white", "wheelchair"], "fr")).toBe(
      "Crée une photo d’un homme blanc âgé en fauteuil roulant."
    );
  });

  it("marks the words each step added", () => {
    const marked = promptSegments(["woman", "young", "black"])
      .filter((segment) => segment.step)
      .map((segment) => [segment.step, segment.text]);
    expect(marked).toEqual([
      ["age", "young"],
      ["origin", "Black"],
      ["gender", "woman"],
    ]);
  });

  it("offers the next step's options until the last step", () => {
    expect(nextStep([]).key).toBe("gender");
    expect(suggestions(["woman"]).map(nodeId)).toEqual([
      "person/woman/young",
      "person/woman/middle_aged",
      "person/woman/old",
    ]);
    expect(suggestions(["woman", "young", "black", "glasses"])).toEqual([]);
  });

  it("lists every prompt to generate once", () => {
    const expected = STEPS.reduce(
      ({ total, level }, step) => ({
        total: total + level * step.options.length,
        level: level * step.options.length,
      }),
      { total: 1, level: 1 }
    ).total;
    const ids = allSelections().map(nodeId);
    expect(ids).toHaveLength(expected);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(allSelections().map((s) => promptText(s))).size).toBe(
      ids.length
    );
  });

  it("builds one image URL per run under the node folder", () => {
    const urls = imageUrls(["woman"], "https://cdn.example/exp/");
    expect(urls).toHaveLength(IMAGES_PER_PROMPT);
    expect(urls[0]).toBe("https://cdn.example/exp/person/woman/01.webp");
    expect(urls[19]).toBe("https://cdn.example/exp/person/woman/20.webp");
  });

  it("flips tiles in a diagonal wave", () => {
    expect(waveDelay(0, 70)).toBe(0);
    expect(waveDelay(1, 70)).toBe(70);
    expect(waveDelay(5, 70)).toBe(70);
    expect(waveDelay(19, 70)).toBe(7 * 70);
  });
});
