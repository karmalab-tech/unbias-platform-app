import { Link } from "react-router-dom";
import { t } from "~/i18n";

export default function PublicFooter() {
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
        <p>{t("footer.credits")}</p>
      </div>
    </footer>
  );
}
