import { Link } from "react-router-dom";
import { locale } from "~/i18n";

const TONES = ["bg-lime", "bg-peach", "bg-cream"];

// Admin-written requests, not metrics. Every card leads to the contribute flow.
export default function NeedCards({
  needs,
  containerClass = "max-w-[1512px]",
  compact = false,
}) {
  if (!needs?.length) return null;

  return (
    <section>
      <div
        className={`md:px-gutter mx-auto grid ${containerClass} gap-5 px-4 ${compact ? "py-6" : "pt-2 pb-10"} md:grid-cols-3 md:gap-8`}
      >
        {needs.slice(0, 3).map((need, index) => (
          <Link
            key={need.id}
            to="/contribute"
            className={`press border-ink text-ink flex items-center gap-5 border-2 px-5 ${compact ? "py-3" : "py-5"} ${TONES[index % TONES.length]}`}
          >
            <span className="font-mono text-[13px] font-bold tracking-widest">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[19px] leading-[1.25] font-semibold text-pretty">
              {need.caption[locale] || need.caption.en}
            </span>
            <span aria-hidden="true" className="font-mono text-[18px]">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
