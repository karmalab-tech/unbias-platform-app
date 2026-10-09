import { useEffect, useState } from "react";

const CACHE = "unbias-video-v1";
const downloads = new Map();

// Plays the intro from Cache Storage when present; otherwise streams it and stores a copy for offline use.
export function useCachedVideo(url) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!url) return undefined;
    if (!("caches" in window)) {
      setSrc(url);
      return undefined;
    }
    let cancelled = false;
    let objectUrl = null;

    const load = async () => {
      try {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(url);
        if (cached) {
          const blob = await cached.blob();
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
          return;
        }
        if (!cancelled) setSrc(url);
        if (!downloads.has(url)) {
          downloads.set(
            url,
            download(cache, url).finally(() => downloads.delete(url))
          );
        }
        await downloads.get(url);
      } catch {
        if (!cancelled) setSrc(url);
      }
    };
    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return src;
}

async function download(cache, url) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok || response.status !== 200) return;
  await cache.put(url, response);
  navigator.storage?.persist?.();
  for (const request of await cache.keys()) {
    if (request.url !== url) await cache.delete(request);
  }
}
