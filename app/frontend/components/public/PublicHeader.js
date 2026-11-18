import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import InstagramIcon from "~/components/ui/InstagramIcon";
import iconEye from "~/images/icons/icon_eye.png";
import { t } from "~/i18n";
import { INSTAGRAM_URL } from "~/lib/social";

const navItem =
  "px-3.5 py-2.5 whitespace-nowrap text-peach hover:text-cream aria-[current=page]:bg-signal aria-[current=page]:font-bold aria-[current=page]:text-ink";
const drawerItem =
  "border-cream/20 flex min-h-14 items-center gap-3 border-b-2 px-6 text-[15px] text-peach hover:text-cream aria-[current=page]:bg-signal aria-[current=page]:font-bold aria-[current=page]:text-ink";

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const panel = useRef(null);
  const toggle = useRef(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const button = toggle.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      button?.focus();
    };
  }, [open]);

  return (
    <header className="bg-ink text-cream border-ink border-b-2">
      <div className="md:px-gutter mx-auto flex min-h-19 max-w-[1512px] items-center gap-x-3 px-4 py-3 max-[359px]:gap-x-2 max-[359px]:px-3 md:gap-x-8">
        <Link
          to="/"
          aria-label={t("home.title")}
          className="text-cream flex items-center gap-2 md:gap-3"
        >
          <img
            src={iconEye}
            alt=""
            className="h-10 w-10 max-[359px]:h-9 max-[359px]:w-9 md:h-13 md:w-13"
          />
          <span className="display-caps flex flex-col text-[17px] leading-[0.95] tracking-[0.04em] max-[359px]:text-[14px] md:text-[26px]">
            <span>{t("brand.line1")}</span>
            <span>{t("brand.line2")}</span>
          </span>
        </Link>
        <nav
          aria-label={t("nav.main")}
          className="mono-caps hidden flex-1 items-center gap-1 text-[13px] tracking-[0.08em] md:flex"
        >
          <NavLink to="/about" className={navItem}>
            {t("nav.whatIsThis")}
          </NavLink>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${navItem} flex items-center gap-2`}
          >
            <InstagramIcon className="h-4 w-4" />
            {t("nav.instagram")}
          </a>
        </nav>
        <Link
          to="/contribute"
          className="press press-sm press-lime border-lime bg-signal text-ink mono-caps ml-auto flex min-h-11 items-center gap-2 border-2 px-3 text-[12px] font-bold max-[359px]:px-2 max-[359px]:text-[11px] md:ml-0 md:gap-3 md:px-4 md:text-[13px]"
        >
          {t("nav.contribute")}
          <span aria-hidden="true" className="max-[359px]:hidden">
            +
          </span>
        </Link>
        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("nav.openMenu")}
          aria-expanded={open}
          aria-controls="public-drawer"
          className="border-cream/40 hover:border-cream flex h-11 w-11 shrink-0 items-center justify-center border-2 md:hidden"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div
          className="bg-night/80 fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            id="public-drawer"
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.main")}
            onClick={(event) => event.stopPropagation()}
            className="bg-ink text-cream border-cream/40 absolute inset-y-0 right-0 flex w-[min(320px,85vw)] flex-col border-l-2"
          >
            <div className="border-cream/20 flex min-h-19 items-center justify-between border-b-2 px-6">
              <span className="mono-caps text-peach text-[12px] tracking-[0.14em]">
                {t("nav.menu")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("common.close")}
                className="border-cream/40 hover:border-cream flex h-11 w-11 items-center justify-center border-2"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav
              aria-label={t("nav.main")}
              className="mono-caps flex flex-col tracking-[0.08em]"
            >
              <NavLink to="/about" className={drawerItem}>
                {t("nav.whatIsThis")}
              </NavLink>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={drawerItem}
              >
                <InstagramIcon />
                {t("nav.instagram")}
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
