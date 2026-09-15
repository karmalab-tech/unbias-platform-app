import { Link } from "react-router-dom";
import { ArrowRightIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { locale } from "~/i18n";

const TINTS = ["bg-tint-age", "bg-tint-skin", "bg-tint-body"];

// Admin-written requests, not metrics. Every card leads to the contribute flow.
export default function NeedCards({ needs }) {
  if (!needs?.length) return null;

  return (
    <section className="border-hairline border-t">
      <div className="md:px-gutter mx-auto grid max-w-[1512px] gap-4 px-5 pt-[30px] pb-8 md:grid-cols-3 md:gap-6">
        {needs.slice(0, 3).map((need, index) => (
          <Link
            key={need.id}
            to="/contribute"
            className={`rounded-card flex items-center gap-5 px-6 py-[22px] ${TINTS[index % TINTS.length]} hover:brightness-[0.98]`}
          >
            <UserPlusIcon
              className="h-[42px] w-[42px] shrink-0"
              strokeWidth={1.2}
            />
            <span className="font-display flex-1 text-[21px] leading-[1.25] font-bold tracking-[-0.015em] text-pretty">
              {need.caption[locale] || need.caption.en}
            </span>
            <ArrowRightIcon className="h-5 w-5 shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
