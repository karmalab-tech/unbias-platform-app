import { Link, useLocation } from "react-router-dom";
import { LANGUAGES, locale, t } from "~/i18n";

export default function PublicFooter() {
  const { pathname, search, hash } = useLocation();

  // Locale is resolved at import time, so switching is a full reload with ?lang=.
  const languageHref = (code) => {
    const params = new URLSearchParams(search);
    params.set("lang", code);
    return `${pathname}?${params}${hash}`;
  };

  return (
    <footer className="border-ink border-t-2">
      <div className="mono-caps md:px-gutter mx-auto flex max-w-[1512px] flex-col gap-4 px-4 py-5 text-[12px] md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>Unbias — {t("footer.platform")}</span>
          <span aria-hidden="true">·</span>
          <Link to="/about" className="hover:underline">
            {t("nav.whatIsThis")}
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/about#faq" className="hover:underline">
            {t("footer.faq")}
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/contribute" className="hover:underline">
            {t("nav.contribute")}
          </Link>
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/karmalab-tech"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {t("footer.source")}
          </a>
        </nav>
        <ul
          className="flex items-center gap-1"
          aria-label={t("footer.language")}
        >
          {LANGUAGES.map(({ code, label }) => (
            <li key={code}>
              <a
                href={languageHref(code)}
                lang={code}
                hrefLang={code}
                aria-current={code === locale ? "true" : undefined}
                className={`border-ink flex min-h-11 items-center border-2 px-3 ${code === locale ? "bg-ink text-cream" : "hover:bg-peach"}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
