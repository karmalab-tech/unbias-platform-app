import { describe, expect, it } from "vitest";
import {
  filterDetections,
  iou,
  matchFaces,
  nearestMonk,
  orderPeople,
  proposePeople,
  suppressOverlaps,
} from "~/lib/detection";

const MONK = [
  "#f6ede4",
  "#f3e7db",
  "#f7ead0",
  "#eadaba",
  "#d7bd96",
  "#a07e56",
  "#825c43",
  "#604134",
  "#3a312a",
  "#292420",
];
const det = (x, y, w, h, score = 0.9) => ({ region: { x, y, w, h }, score });

describe("filterDetections", () => {
  it("drops low scores and tiny background people", () => {
    const kept = filterDetections([
      det(0, 0, 0.5, 0.5, 0.9),
      det(0, 0, 0.5, 0.5, 0.2),
      det(0, 0, 0.1, 0.1, 0.9),
    ]);
    expect(kept).toHaveLength(1);
  });

  it("uses the configured area threshold", () => {
    const kept = filterDetections([det(0, 0, 0.1, 0.1, 0.9)], {
      minScore: 0.3,
      minAreaRatio: 0.005,
    });
    expect(kept).toHaveLength(1);
  });
});

describe("suppressOverlaps", () => {
  it("keeps the strongest of two overlapping boxes and drops contained ones", () => {
    const a = det(0.1, 0.1, 0.4, 0.8, 0.9);
    const b = det(0.12, 0.1, 0.4, 0.8, 0.6);
    const inner = det(0.2, 0.3, 0.1, 0.3, 0.8);
    const far = det(0.6, 0.1, 0.3, 0.8, 0.7);
    expect(iou(a.region, b.region)).toBeGreaterThan(0.5);
    expect(suppressOverlaps([a, b, inner, far])).toEqual([a, far]);
  });
});

describe("matchFaces and ordering", () => {
  it("attaches the face inside each person box and numbers left to right", () => {
    const right = det(0.55, 0.1, 0.4, 0.8);
    const left = det(0.05, 0.1, 0.4, 0.8);
    const faceLeft = {
      region: { x: 0.15, y: 0.15, w: 0.15, h: 0.15 },
      score: 0.9,
      skin: { r: 100, g: 70, b: 50 },
    };
    const faceNowhere = {
      region: { x: 0.47, y: 0.9, w: 0.05, h: 0.05 },
      score: 0.9,
      skin: null,
    };
    const matched = orderPeople(
      matchFaces([right, left], [faceLeft, faceNowhere])
    );
    expect(matched[0].region).toEqual(left.region);
    expect(matched[0].face).toBe(faceLeft);
    expect(matched[1].face).toBeNull();
  });
});

describe("nearestMonk", () => {
  it("maps each reference swatch to itself", () => {
    MONK.forEach((hex, index) => {
      const rgb = {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      };
      expect(nearestMonk(rgb, MONK)).toBe(index + 1);
    });
  });

  it("returns null for unusable samples", () => {
    expect(nearestMonk(null, MONK)).toBeNull();
    expect(nearestMonk({ r: 0, g: 0, b: 0 }, MONK)).toBeNull();
    expect(nearestMonk({ r: 255, g: 255, b: 255 }, MONK)).toBeNull();
  });
});

describe("proposePeople", () => {
  it("builds the annotation list with provenance and a suggested tone", () => {
    const result = {
      people: [det(0.1, 0.1, 0.4, 0.8, 0.9), det(0.5, 0.2, 0.02, 0.02, 0.9)],
      faces: [
        {
          region: { x: 0.2, y: 0.15, w: 0.15, h: 0.15 },
          score: 0.9,
          skin: { r: 130, g: 92, b: 67 },
        },
      ],
    };
    const people = proposePeople(result, MONK);
    expect(people).toHaveLength(1);
    expect(people[0]).toMatchObject({
      detection_source: "detector",
      disability_tags: [],
    });
    expect(people[0].skin_tone_auto).toBe(7);
  });
});
