import { useEffect } from "react";

const EDITABLE = new Set(["INPUT", "TEXTAREA", "SELECT"]);

// Global key handler that stays out of the way of form fields.
export default function useShortcuts(handler, deps) {
  useEffect(() => {
    const onKey = (event) => {
      if (
        EDITABLE.has(event.target?.tagName) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      handler(event);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, deps);
}
