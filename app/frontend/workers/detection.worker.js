import {
  FaceDetector,
  FilesetResolver,
  ObjectDetector,
} from "@mediapipe/tasks-vision";

// Runs MediaPipe person + face detection off the main thread. Nothing leaves the browser.
let loading = null;

function load() {
  loading ||= (async () => {
    const vision = await FilesetResolver.forVisionTasks("/models/wasm");
    const [people, faces] = await Promise.all([
      ObjectDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "/models/efficientdet_lite0.tflite" },
        runningMode: "IMAGE",
        scoreThreshold: 0.2,
        categoryAllowlist: ["person"],
        maxResults: 12,
      }),
      FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/blaze_face_short_range.tflite",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.4,
      }),
    ]);
    return { people, faces };
  })();
  return loading;
}

const box = (b, width, height) => ({
  x: b.originX / width,
  y: b.originY / height,
  w: b.width / width,
  h: b.height / height,
});

// Cheek and forehead patches, skin-like pixels only, mid-to-upper luminance band: avoids lips,
// eyes, brows and shadows, which otherwise drag the sample several Monk steps too dark.
const PATCHES = [
  [0.15, 0.45, 0.25, 0.25],
  [0.6, 0.45, 0.25, 0.25],
  [0.3, 0.12, 0.4, 0.18],
];

function skinSample(context, b) {
  const pixels = [];
  for (const [px, py, pw, ph] of PATCHES) {
    const x = Math.round(b.originX + b.width * px);
    const y = Math.round(b.originY + b.height * py);
    const w = Math.max(1, Math.round(b.width * pw));
    const h = Math.max(1, Math.round(b.height * ph));
    const { data } = context.getImageData(x, y, w, h);
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, bl] = [data[i], data[i + 1], data[i + 2]];
      const skinLike = r >= g && g >= bl - 10 && r - bl > 8;
      if (skinLike)
        pixels.push({ r, g, b: bl, l: 0.2126 * r + 0.7152 * g + 0.0722 * bl });
    }
  }
  if (pixels.length < 32) return null;
  pixels.sort((p, q) => p.l - q.l);
  const kept = pixels.slice(
    Math.floor(pixels.length * 0.4),
    Math.ceil(pixels.length * 0.85)
  );
  const median = (key) =>
    kept.map((p) => p[key]).sort((a, c) => a - c)[Math.floor(kept.length / 2)];
  return { r: median("r"), g: median("g"), b: median("b") };
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === "warm") {
      await load();
      self.postMessage({ type: "ready" });
      return;
    }
    if (data.type !== "detect") return;

    const bitmap = data.bitmap;
    const { people, faces } = await load();
    const { width, height } = bitmap;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);

    const peopleResult = people.detect(bitmap);
    const facesResult = faces.detect(bitmap);
    bitmap.close();

    self.postMessage({
      type: "result",
      id: data.id,
      people: peopleResult.detections.map((d) => ({
        region: box(d.boundingBox, width, height),
        score: d.categories[0]?.score ?? 0,
      })),
      faces: facesResult.detections.map((d) => ({
        region: box(d.boundingBox, width, height),
        score: d.categories[0]?.score ?? 0,
        skin: skinSample(context, d.boundingBox),
      })),
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      id: data.id,
      message: error?.message ?? String(error),
    });
  }
};
