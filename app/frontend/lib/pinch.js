// Geometry for the pinch-to-zoom viewer. A transform is { scale, x, y }, applied
// as `translate(x, y) scale(scale)` around the element's centre.

export const IDENTITY = { scale: 1, x: 0, y: 0 };
export const MIN_SCALE = 1;
export const MAX_SCALE = 5;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

// Scales `from` so that the content under `anchor` ends up under `moved`.
export function zoomAround(from, anchor, scale, moved = anchor) {
  return {
    scale,
    x: moved.x - ((anchor.x - from.x) * scale) / from.scale,
    y: moved.y - ((anchor.y - from.y) * scale) / from.scale,
  };
}

// Panning stops where the scaled image would leave the viewport, which also
// recentres it as soon as it fits again.
export function clampPan(transform, base, viewport) {
  const overflow = (size, available) =>
    Math.max(0, (size * transform.scale - available) / 2);
  const maxX = overflow(base.width, viewport.width);
  const maxY = overflow(base.height, viewport.height);
  return {
    scale: transform.scale,
    x: clamp(transform.x, -maxX, maxX),
    y: clamp(transform.y, -maxY, maxY),
  };
}
