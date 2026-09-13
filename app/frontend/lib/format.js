import { locale } from "~/i18n";

const intlLocale = locale === "fr" ? "fr-FR" : "en-US";

export function formatNumber(value) {
  return Number(value ?? 0).toLocaleString(intlLocale);
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(intlLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
