import { useEffect } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import { t } from "~/i18n";

export default function StepShell({
  label,
  back,
  media,
  title,
  intro,
  children,
  footer,
  wide = false,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const width = wide ? "max-w-3xl" : "max-w-lg";

  // Every step starts at its own top, not where the previous one was scrolled to.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col">
      <header className="border-ink bg-canvas sticky top-0 z-10 border-b-2">
        <div className={`mx-auto flex h-14 ${width} items-center gap-2 px-4`}>
          {back !== false && (
            <button
              type="button"
              onClick={() =>
                typeof back === "string" ? navigate(back) : navigate(-1)
              }
              className="text-ink border-ink hover:bg-peach -ml-2 flex h-10 w-10 items-center justify-center border-2"
              aria-label={t("common.back")}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
          {label && (
            <p className="mono-caps flex-1 truncate text-center text-[12px] font-bold tracking-[0.12em]">
              {label}
            </p>
          )}
          {back !== false && <span className="w-10" aria-hidden="true" />}
        </div>
      </header>

      <main className={`mx-auto w-full ${width} flex-1 px-4 pt-6 pb-32`}>
        {media && <div className="mb-8">{media}</div>}
        {title && (
          <h1 className="display-caps text-[34px] leading-[0.95]">{title}</h1>
        )}
        {intro && (
          <p
            className="text-ink-72 mt-3 text-[15.5px] leading-[1.5]"
            aria-live="polite"
          >
            {intro}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </main>

      {footer && (
        <footer className="border-ink bg-canvas fixed inset-x-0 bottom-0 z-10 border-t-2">
          <div className={`mx-auto flex ${width} flex-col gap-2 px-4 py-3`}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}
