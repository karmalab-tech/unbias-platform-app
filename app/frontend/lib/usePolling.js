import { useEffect, useRef, useState } from "react";
import { api } from "~/lib/api";

// Re-fetches a JSON endpoint on an interval while the tab is visible.
export default function usePolling(url, seconds) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await api.get(url);
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      }
    };

    const schedule = () => {
      clearInterval(timer.current);
      if (document.visibilityState === "visible") {
        timer.current = setInterval(load, Math.max(seconds, 2) * 1000);
      }
    };

    load();
    schedule();
    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [url, seconds]);

  return { data, error };
}
