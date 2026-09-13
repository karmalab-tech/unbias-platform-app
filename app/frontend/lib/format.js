import { locale } from "~/i18n";

const intlLocale = locale === "fr" ? "fr-FR" : "en-US";

export function formatNumber(value) {
  return Number(value ?? 0).toLocaleString(intlLocale);
}
