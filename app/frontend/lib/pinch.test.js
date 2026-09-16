import { describe, expect, it } from "vitest";
import { clampPan, distance, midpoint, zoomAround } from "~/lib/pinch";

const IDENTITY = { scale: 1, x: 0, y: 0 };
const viewport = { width: 400, height: 800 };
const base = { width: 400, height: 600 };

describe("distance and midpoint", () => {
  it("measures between two points", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(midpoint({ x: 0, y: 0 }, { x: 4, y: 10 })).toEqual({ x: 2, y: 5 });
  });
});

describe("zoomAround", () => {
  it("keeps the anchored point under the fingers", () => {
    const zoomed = zoomAround(IDENTITY, { x: 100, y: 50 }, 2);
    expect(zoomed).toEqual({ scale: 2, x: -100, y: -50 });
  });

  it("follows the fingers when they also move", () => {
    const zoomed = zoomAround(IDENTITY, { x: 100, y: 50 }, 2, {
      x: 120,
      y: 50,
    });
    expect(zoomed.x).toBe(-80);
  });

  it("scales again from an already zoomed transform", () => {
    const once = zoomAround(IDENTITY, { x: 100, y: 0 }, 2);
    const twice = zoomAround(once, { x: 100, y: 0 }, 4);
    expect(twice).toEqual({ scale: 4, x: -300, y: 0 });
  });
});

describe("clampPan", () => {
  it("recentres an image that fits the viewport", () => {
    const panned = clampPan({ scale: 1, x: 120, y: -80 }, base, viewport);
    expect(panned.scale).toBe(1);
    expect(Math.abs(panned.x)).toBe(0);
    expect(Math.abs(panned.y)).toBe(0);
  });

  it("allows panning only over the part that overflows", () => {
    const panned = clampPan({ scale: 2, x: 900, y: 900 }, base, viewport);
    expect(panned).toEqual({ scale: 2, x: 200, y: 200 });
  });

  it("leaves a pan inside the bounds alone", () => {
    const panned = clampPan({ scale: 2, x: -50, y: 30 }, base, viewport);
    expect(panned).toEqual({ scale: 2, x: -50, y: 30 });
  });
});
