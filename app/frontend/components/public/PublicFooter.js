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
    <footer className="border-hairline border-t">
      <div className="text-ink-60 md:px-gutter mx-auto flex max-w-[1512px] flex-col gap-4 px-5 py-8 text-[14px] md:flex-row md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/about" className="hover:text-ink">
            {t("nav.whatIsThis")}
          </Link>
          <Link to="/about#faq" className="hover:text-ink">
            {t("footer.faq")}
          </Link>
          <Link to="/contribute" className="hover:text-ink">
            {t("nav.contribute")}
          </Link>
          <a
            href="https://github.com/karmalab-tech"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            {t("footer.source")}
          </a>
        </nav>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul
            className="flex items-center gap-x-2"
            aria-label={t("footer.language")}
          >
            {LANGUAGES.map(({ code, label }, index) => (
              <li key={code} className="flex items-center gap-x-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                <a
                  href={languageHref(code)}
                  lang={code}
                  hrefLang={code}
                  aria-current={code === locale ? "true" : undefined}
                  className={code === locale ? "text-ink" : "hover:text-ink"}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
