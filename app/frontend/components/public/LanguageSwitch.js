import { useLocation } from "react-router-dom";
import { LANGUAGES, locale, t } from "~/i18n";

const TONES = {
  light: {
    item: "border-ink min-h-11 px-3",
    on: "bg-ink text-cream",
    off: "hover:bg-peach",
  },
  dark: {
    item: "border-cream/40 min-h-9 px-2 md:px-2.5",
    on: "border-cream bg-cream text-ink",
    off: "text-peach hover:border-cream hover:text-cream",
  },
};

export default function LanguageSwitch({ tone = "light", short = false }) {
  const { pathname, search, hash } = useLocation();
  const styles = TONES[tone];

  // Locale is resolved at import time, so switching is a full reload with ?lang=.
  const languageHref = (code) => {
    const params = new URLSearchParams(search);
    params.set("lang", code);
    return `${pathname}?${params}${hash}`;
  };

  return (
    <ul className="flex items-center gap-1" aria-label={t("footer.language")}>
      {LANGUAGES.map(({ code, label }) => (
        <li key={code}>
          <a
            href={languageHref(code)}
            lang={code}
            hrefLang={code}
            aria-label={short ? label : undefined}
            aria-current={code === locale ? "true" : undefined}
            className={`flex items-center border-2 ${styles.item} ${code === locale ? styles.on : styles.off}`}
          >
            {short ? code.toUpperCase() : label}
          </a>
        </li>
      ))}
    </ul>
  );
}
