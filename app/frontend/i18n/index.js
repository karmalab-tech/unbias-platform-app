// Lightweight, dependency-free internationalization helper.
//
// The locale is resolved once from the browser's language preferences:
// French browsers get French, everyone else falls back to English. All
// user-facing strings in the React frontend go through `t()`.

import { en } from "~/i18n/locales/en";
import { fr } from "~/i18n/locales/fr";

const translations = { en, fr };
const DEFAULT_LOCALE = "en";
const STORAGE_KEY = "unbias.locale";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

function detectLocale() {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;

  // Allow forcing a locale via ?lang=fr / ?lang=en for testing & kiosks.
  // A forced locale is remembered so the footer switcher survives reloads.
  try {
    const forced = new URLSearchParams(window.location.search).get("lang");
    const code = forced && forced.toLowerCase().slice(0, 2);
    if (code && translations[code]) {
      localStorage.setItem(STORAGE_KEY, code);
      return code;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
  } catch {
    // window or storage may be unavailable; ignore and fall back to navigator.
  }

  const preferred =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || DEFAULT_LOCALE];

  for (const lang of preferred) {
    const code = String(lang).toLowerCase().slice(0, 2);
    if (translations[code]) return code;
  }

  return DEFAULT_LOCALE;
}

export const locale = detectLocale();

export function hasStoredLocale() {
  try {
    return Boolean(translations[localStorage.getItem(STORAGE_KEY)]);
  } catch {
    return false;
  }
}

// Locale is resolved at import time, so applying a choice reloads the page.
export function chooseLocale(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // storage unavailable: fall back to a forced query parameter below.
  }
  const url = new URL(window.location.href);
  url.searchParams.set("lang", code);
  window.location.replace(url);
}

if (typeof document !== "undefined") {
  document.documentElement.lang = locale;
}

// Resolve a dotted key (e.g. "video.delete") against the active locale,
// falling back to English, then to the raw key if nothing is found.
function resolve(dict, key) {
  return key.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) return acc[part];
    return undefined;
  }, dict);
}

function pluralize(value, vars) {
  if (typeof value !== "object" || value === null) return value;
  const count = Number(vars?.count ?? 0);
  if (count === 0 && value.zero !== undefined) return value.zero;
  return count === 1 ? value.one : value.other;
}

export function t(key, vars) {
  const active = translations[locale] || translations[DEFAULT_LOCALE];
  let value = resolve(active, key);
  if (value === undefined) value = resolve(translations[DEFAULT_LOCALE], key);
  if (value === undefined) return key;
  value = pluralize(value, vars);
  if (typeof value !== "string") return key;

  if (vars) {
    return Object.entries(vars).reduce(
      (str, [name, replacement]) =>
        str.replaceAll(`{${name}}`, String(replacement)),
      value
    );
  }

  return value;
}
