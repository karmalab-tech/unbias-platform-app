import { useEffect } from "react";

const DASHBOARD_PAGES = ["/", "/installation", "/video"];

// Caches the dashboard so a refresh without network still shows the last numbers.
export function useOfflineDashboard() {
  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    let cancelled = false;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        const { active } = await navigator.serviceWorker.ready;
        if (cancelled || !active) return;
        active.postMessage({
          type: "precache",
          page: DASHBOARD_PAGES.includes(location.pathname)
            ? location.pathname
            : null,
          assets: performance
            .getEntriesByType("resource")
            .map((entry) => entry.name),
        });
      } catch {
        // Offline support is an enhancement; the dashboard works without it.
      }
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", register);
    };
  }, []);
}
