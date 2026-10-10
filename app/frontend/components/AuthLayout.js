import { Link } from "react-router-dom";
import iconEye from "~/images/icons/icon_eye.png";
import { inputClass } from "~/components/ui/Field";
import { t } from "~/i18n";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="bg-canvas text-ink flex min-h-dvh flex-col">
      <header className="bg-ink text-cream border-ink border-b-2">
        <div className="mx-auto flex min-h-19 w-full max-w-md items-center px-4">
          <Link
            to="/"
            aria-label={t("home.title")}
            className="flex items-center gap-3"
          >
            <img src={iconEye} alt="" className="h-13 w-13" />
            <span className="display-caps text-[30px] leading-none tracking-[0.04em]">
              Unbias
            </span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-10">
        <h1 className="display-caps text-[34px] leading-[0.95]">{title}</h1>
        {subtitle && (
          <p className="text-ink-72 mt-3 text-[15.5px] leading-[1.5]">
            {subtitle}
          </p>
        )}
        <div className="mt-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}

export const fieldClass = inputClass;

export const buttonClass =
  "press border-ink bg-signal text-ink mono-caps inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 border-2 px-[22px] text-[14px] font-bold disabled:bg-peach disabled:shadow-none";
