import { Link } from "react-router-dom";
import { t } from "~/i18n";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col px-4">
      <header className="mx-auto flex h-14 w-full max-w-md items-center">
        <Link
          to="/"
          className="font-display text-[17px] font-bold tracking-[-0.01em]"
        >
          {t("home.title")}
        </Link>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 pt-10">
        <h1 className="font-display text-[30px] leading-[1.05] font-bold tracking-[-0.025em]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ink-60 mt-3 text-[15.5px] leading-[1.5]">
            {subtitle}
          </p>
        )}
        <div className="mt-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}

export const fieldClass =
  "block w-full rounded-btn border border-ink/20 bg-white/60 px-4 py-3 text-[15.5px] text-ink focus:border-ink focus:outline-none";

export const buttonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-[22px] py-[14px] text-[15.5px] font-semibold text-white hover:bg-accent-hover disabled:opacity-40";
