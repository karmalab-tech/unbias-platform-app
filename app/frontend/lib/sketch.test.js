import { describe, expect, it } from "vitest";
import { seedFrom } from "~/lib/sketch";

describe("seedFrom", () => {
  it("is stable for the same key", () => {
    expect(seedFrom("consent-submit")).toBe(seedFrom("consent-submit"));
  });

  it("separates keys that differ", () => {
    expect(seedFrom("consent-training")).not.toBe(seedFrom("consent-display"));
  });

  it("stays inside the uint32 range drawably seeds with", () => {
    for (const key of ["", "a", "permission-adults", "x".repeat(200)]) {
      const seed = seedFrom(key);
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(0xffffffff);
    }
  });
});
