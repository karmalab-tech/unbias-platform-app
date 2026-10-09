import { Link, NavLink } from "react-router-dom";
import iconEye from "~/images/icons/icon_eye.png";
import { t } from "~/i18n";

const navItem =
  "px-3.5 py-2.5 text-peach hover:text-cream aria-[current=page]:bg-signal aria-[current=page]:font-bold aria-[current=page]:text-ink";

export default function PublicHeader({ onWatchVideo, hasVideo }) {
  return (
    <header className="bg-ink text-cream border-ink border-b-2">
      <div className="md:px-gutter mx-auto flex min-h-19 max-w-[1512px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
        <Link
          to="/"
          aria-label={t("home.title")}
          className="text-cream flex items-center gap-3"
        >
          <img src={iconEye} alt="" className="h-13 w-13" />
          <span className="display-caps text-[30px] leading-none tracking-[0.04em]">
            Unbias
          </span>
        </Link>
        <nav
          aria-label={t("nav.main")}
          className="mono-caps flex flex-1 flex-wrap items-center gap-1 text-[13px] tracking-[0.08em]"
        >
          <NavLink to="/about" className={navItem}>
            {t("nav.whatIsThis")}
          </NavLink>
          {hasVideo && (
            <button
              type="button"
              onClick={onWatchVideo}
              className={`${navItem} cursor-pointer uppercase`}
            >
              {t("nav.watchVideo")}
            </button>
          )}
        </nav>
        <Link
          to="/contribute"
          className="press press-sm press-lime border-lime bg-signal text-ink mono-caps flex min-h-11 items-center gap-3 border-2 px-4 text-[13px] font-bold"
        >
          {t("nav.contribute")}
          <span aria-hidden="true">+</span>
        </Link>
      </div>
    </header>
  );
}
