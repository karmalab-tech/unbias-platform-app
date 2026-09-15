import { useEffect, useState } from "react";
import { api } from "~/lib/api";

let cached = null;

export function loadSettings() {
  cached ||= api.get("/api/public/settings");
  return cached;
}

export function useSettings() {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);
  return settings;
}
