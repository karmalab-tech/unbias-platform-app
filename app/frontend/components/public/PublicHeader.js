import { Link } from "react-router-dom";
import { PlayCircleIcon } from "@heroicons/react/24/outline";
import { t } from "~/i18n";

export default function PublicHeader({ onWatchVideo, hasVideo }) {
  return (
    <header className="border-hairline border-b">
      <div className="md:px-gutter mx-auto flex h-16 max-w-[1512px] items-center justify-between px-5">
        <Link
          to="/"
          className="font-display text-[17px] font-bold tracking-[-0.01em]"
        >
          {t("home.title")}
        </Link>
        <nav className="text-ink-72 flex items-center gap-4 text-[14.5px] font-medium md:gap-7">
          <Link to="/about" className="hover:text-ink">
            {t("nav.whatIsThis")}
          </Link>
          {hasVideo && (
            <button
              type="button"
              onClick={onWatchVideo}
              className="hover:text-ink flex items-center gap-1.5"
            >
              <PlayCircleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{t("nav.watchVideo")}</span>
            </button>
          )}
          <Link
            to="/contribute"
            className="rounded-btn bg-ink text-canvas hover:bg-shell px-4 py-2 text-[14px] font-semibold"
          >
            {t("nav.contribute")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
