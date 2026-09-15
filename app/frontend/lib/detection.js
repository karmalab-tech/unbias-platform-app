// Browser-side people detection: proposes annotation targets, never identities.
// Pure helpers are exported for tests; the worker glue lives at the bottom.

export const DEFAULT_THRESHOLDS = {
  minScore: 0.35,
  minAreaRatio: 0.05,
  iou: 0.5,
  containment: 0.8,
};

export function area(region) {
  return Math.max(0, region.w) * Math.max(0, region.h);
}

export function intersection(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const w = Math.min(a.x + a.w, b.x + b.w) - x;
  const h = Math.min(a.y + a.h, b.y + b.h) - y;
  return w > 0 && h > 0 ? w * h : 0;
}

export function iou(a, b) {
  const inter = intersection(a, b);
  const union = area(a) + area(b) - inter;
  return union > 0 ? inter / union : 0;
}

// Drops low-confidence and incidental background people.
export function filterDetections(detections, thresholds = DEFAULT_THRESHOLDS) {
  return detections.filter(
    (d) =>
      d.score >= thresholds.minScore &&
      area(d.region) >= thresholds.minAreaRatio
  );
}

// Greedy suppression: keeps the strongest box, drops overlapping or mostly-contained duplicates.
export function suppressOverlaps(detections, thresholds = DEFAULT_THRESHOLDS) {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const kept = [];
  for (const candidate of sorted) {
    const duplicate = kept.some((k) => {
      const inter = intersection(k.region, candidate.region);
      const contained = inter / Math.max(area(candidate.region), 1e-9);
      return (
        iou(k.region, candidate.region) >= thresholds.iou ||
        contained >= thresholds.containment
      );
    });
    if (!duplicate) kept.push(candidate);
  }
  return kept;
}

export function center(region) {
  return { x: region.x + region.w / 2, y: region.y + region.h / 2 };
}

export function contains(region, point) {
  return (
    point.x >= region.x &&
    point.x <= region.x + region.w &&
    point.y >= region.y &&
    point.y <= region.y + region.h
  );
}

// Attaches to each person the highest-scoring face whose centre falls inside the person box.
export function matchFaces(people, faces) {
  const used = new Set();
  return people.map((person) => {
    const candidates = faces
      .map((face, index) => ({ face, index }))
      .filter(
        ({ face, index }) =>
          !used.has(index) && contains(person.region, center(face.region))
      )
      .sort((a, b) => b.face.score - a.face.score);
    if (!candidates.length) return { ...person, face: null };
    used.add(candidates[0].index);
    return { ...person, face: candidates[0].face };
  });
}

// Reading order: left to right, then top to bottom, so numbering feels natural.
export function orderPeople(people) {
  return [...people].sort((a, b) => {
    const ca = center(a.region);
    const cb = center(b.region);
    return Math.abs(ca.y - cb.y) > 0.25 ? ca.y - cb.y : ca.x - cb.x;
  });
}

export function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export function rgbToLab({ r, g, b }) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  let x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  let y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  let z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  [x, y, z] = [f(x), f(y), f(z)];
  return { L: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

// Lightness carries most of the Monk scale; chroma shifts from lighting and JPEG count for less.
export function deltaE(lab1, lab2) {
  return Math.hypot(
    lab1.L - lab2.L,
    0.5 * (lab1.a - lab2.a),
    0.5 * (lab1.b - lab2.b)
  );
}

// Nearest Monk tone (1-10) to a sampled skin colour, or null when the sample is unusable.
export function nearestMonk(rgb, swatches) {
  if (!rgb) return null;
  const lab = rgbToLab(rgb);
  if (lab.L < 8 || lab.L > 97) return null;
  let best = null;
  swatches.forEach((hex, index) => {
    const distance = deltaE(lab, rgbToLab(hexToRgb(hex)));
    if (!best || distance < best.distance) best = { tone: index + 1, distance };
  });
  return best?.tone ?? null;
}

// Turns raw worker output into the people list the UI uses.
export function proposePeople(
  result,
  swatches,
  thresholds = DEFAULT_THRESHOLDS
) {
  const people = suppressOverlaps(
    filterDetections(result.people, thresholds),
    thresholds
  );
  return orderPeople(matchFaces(people, result.faces)).map((person) => ({
    detection_region: person.region,
    detection_source: "detector",
    skin_tone_auto: person.face
      ? nearestMonk(person.face.skin, swatches)
      : null,
    disability_tags: [],
  }));
}

let worker = null;
let nextId = 1;
const pending = new Map();

export function detectionSupported() {
  return (
    typeof Worker !== "undefined" &&
    typeof createImageBitmap === "function" &&
    typeof OffscreenCanvas !== "undefined"
  );
}

function getWorker() {
  if (worker) return worker;
  // Classic worker on purpose: MediaPipe loads its wasm glue through importScripts.
  worker = new Worker(
    new URL("../workers/detection.worker.js", import.meta.url)
  );
  worker.onmessage = ({ data }) => {
    const entry = pending.get(data.id);
    if (!entry) return;
    pending.delete(data.id);
    if (data.type === "error") entry.reject(new Error(data.message));
    else entry.resolve(data);
  };
  worker.onerror = (event) => {
    pending.forEach((entry) =>
      entry.reject(event.error ?? new Error("detector failed"))
    );
    pending.clear();
  };
  return worker;
}

export function warmDetector() {
  if (!detectionSupported()) return;
  try {
    getWorker().postMessage({ type: "warm" });
  } catch {
    // Detection is optional; the flow works without it.
  }
}

async function toBitmap(blob, maxSide = 1024) {
  const probe = await createImageBitmap(blob);
  const scale = Math.min(1, maxSide / Math.max(probe.width, probe.height));
  if (scale === 1) return probe;
  const bitmap = await createImageBitmap(probe, {
    resizeWidth: Math.round(probe.width * scale),
    resizeHeight: Math.round(probe.height * scale),
    resizeQuality: "high",
  });
  probe.close();
  return bitmap;
}

// Resolves with the raw detections; rejects on failure or after the timeout.
export async function detectRaw(blob, { timeoutMs = 20000 } = {}) {
  if (!detectionSupported()) throw new Error("detection unsupported");
  const bitmap = await toBitmap(blob);
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("detection timeout"));
    }, timeoutMs);
    pending.set(id, {
      resolve: (data) => {
        clearTimeout(timer);
        resolve(data);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    getWorker().postMessage({ type: "detect", id, bitmap }, [bitmap]);
  });
}
