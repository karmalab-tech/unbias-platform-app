import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { t } from "~/i18n";

export default function StepShell({
  label,
  back,
  title,
  intro,
  children,
  footer,
  wide = false,
}) {
  const navigate = useNavigate();
  const width = wide ? "max-w-3xl" : "max-w-lg";

  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col">
      <header className="border-hairline bg-canvas/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className={`mx-auto flex h-14 ${width} items-center gap-2 px-4`}>
          {back !== false && (
            <button
              type="button"
              onClick={() =>
                typeof back === "string" ? navigate(back) : navigate(-1)
              }
              className="text-ink-72 hover:bg-surface -ml-2 flex h-10 w-10 items-center justify-center rounded-full"
              aria-label={t("common.back")}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}
          {label && (
            <p className="text-ink-60 flex-1 truncate text-center text-[13px] font-semibold tracking-[0.08em] uppercase">
              {label}
            </p>
          )}
          {back !== false && <span className="w-10" aria-hidden="true" />}
        </div>
      </header>

      <main className={`mx-auto w-full ${width} flex-1 px-4 pt-6 pb-32`}>
        {title && (
          <h1 className="font-display text-[30px] leading-[1.05] font-bold tracking-[-0.025em]">
            {title}
          </h1>
        )}
        {intro && (
          <p className="text-ink-60 mt-3 text-[15.5px] leading-[1.5]">
            {intro}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </main>

      {footer && (
        <footer className="border-hairline bg-canvas/95 fixed inset-x-0 bottom-0 z-10 border-t backdrop-blur-sm">
          <div className={`mx-auto flex ${width} flex-col gap-2 px-4 py-3`}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}
