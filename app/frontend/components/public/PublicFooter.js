import { Link } from "react-router-dom";
import LanguageSwitch from "~/components/public/LanguageSwitch";
import { t } from "~/i18n";

export default function PublicFooter() {
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
        <LanguageSwitch />
      </div>
    </footer>
  );
}
