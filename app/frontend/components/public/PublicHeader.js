import { Link, NavLink } from "react-router-dom";
import LanguageSwitch from "~/components/public/LanguageSwitch";
import iconEye from "~/images/icons/icon_eye.png";
import { t } from "~/i18n";
import { INSTAGRAM_URL } from "~/lib/social";

const navItem =
  "px-2 py-2.5 whitespace-nowrap md:px-3.5 text-peach hover:text-cream aria-[current=page]:bg-signal aria-[current=page]:font-bold aria-[current=page]:text-ink";

export default function PublicHeader({ onWatchVideo, hasVideo }) {
  return (
    <header className="bg-ink text-cream border-ink border-b-2">
      <div className="md:px-gutter mx-auto grid min-h-19 max-w-[1512px] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 md:flex md:gap-x-8">
        <Link
          to="/"
          aria-label={t("home.title")}
          className="text-cream order-1 flex items-center gap-2 md:order-none md:gap-3"
        >
          <img src={iconEye} alt="" className="h-10 w-10 md:h-13 md:w-13" />
          <span className="display-caps text-[24px] leading-none tracking-[0.04em] md:text-[30px]">
            Unbias
          </span>
        </Link>
        <div className="order-3 col-span-2 flex items-center justify-between md:contents">
          <nav
            aria-label={t("nav.main")}
            className="mono-caps -ml-2 flex items-center text-[12px] tracking-[0.08em] md:ml-0 md:flex-1 md:gap-1 md:text-[13px]"
          >
            <NavLink to="/about" className={navItem}>
              {t("nav.whatIsThis")}
            </NavLink>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={navItem}
            >
              {t("nav.instagram")}
            </a>
          </nav>
          <LanguageSwitch tone="dark" short />
        </div>
        <Link
          to="/contribute"
          className="press press-sm press-lime border-lime bg-signal text-ink mono-caps order-2 flex min-h-11 items-center gap-2 border-2 px-3 text-[12px] font-bold md:order-none md:gap-3 md:px-4 md:text-[13px]"
        >
          {t("nav.contribute")}
          <span aria-hidden="true">+</span>
        </Link>
      </div>
    </header>
  );
}
