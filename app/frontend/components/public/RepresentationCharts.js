import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import {
  LabelAboveRows,
  LabelledRows,
  SwatchColumns,
} from "~/components/public/Bars";
import { groupBuckets } from "~/lib/coverage";
import { formatNumber } from "~/lib/format";
import { t } from "~/i18n";

const COLUMN_WIDTHS = "xl:grid-cols-[1fr_1.12fr_1fr_1fr_1.16fr]";

export default function RepresentationCharts({
  buckets,
  loading,
  containerClass = "max-w-[1512px]",
  compact = false,
}) {
  const dimensions = groupBuckets(buckets);
  const padLeft = compact ? "xl:pl-4" : "xl:pl-[30px]";
  const padRight = compact ? "xl:pr-4" : "xl:pr-[30px]";

  return (
    <section className="border-hairline border-t">
      <div
        className={`md:px-gutter mx-auto ${containerClass} px-5 ${compact ? "py-6" : "py-8"}`}
      >
        {!compact && (
          <div
            className={`${compact ? "mb-4" : "mb-7"} flex flex-wrap items-end justify-between gap-x-6 gap-y-3`}
          >
            <h2 className="font-display text-[30px] leading-none font-bold tracking-[-0.025em]">
              {t("dashboard.representation")}
            </h2>
            <ul className="text-ink-60 flex gap-[26px] text-[13px]">
              <li className="flex items-center gap-2">
                <span className="bg-data-approved inline-block h-3 w-3 rounded-[2px]" />{" "}
                {t("dashboard.approved")}
              </li>
              <li className="flex items-center gap-2">
                <span className="hatch inline-block h-3 w-3 rounded-[2px]" />{" "}
                {t("dashboard.pending")}
              </li>
            </ul>
          </div>
        )}

        <div
          className={`grid gap-y-10 md:grid-cols-2 ${compact ? "md:gap-x-4" : "md:gap-x-[30px]"} ${COLUMN_WIDTHS} xl:gap-y-0`}
        >
          {dimensions.map((dimension, index) => (
            <div
              key={dimension.id}
              className={`border-hairline ${index > 0 ? `border-t pt-8 md:border-t-0 md:pt-0 xl:border-l ${padLeft}` : ""} ${index < dimensions.length - 1 ? padRight : ""}`}
            >
              <div className="mb-[22px] flex items-start gap-x-[9px]">
                {!compact && (
                  <span
                    className="mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full"
                    style={{ background: dimension.key }}
                  />
                )}
                <h3 className="font-display text-[17px] leading-tight font-bold tracking-[-0.01em]">
                  {dimension.id === "disability"
                    ? t("taxonomy.disability.short")
                    : dimension.title}
                </h3>
                <TargetNote buckets={dimension.buckets} />
              </div>
              <Chart dimension={dimension} loading={loading} />
              {dimension.id === "skin_tone" && (
                <a
                  href="https://en.wikipedia.org/wiki/Monk_Skin_Tone_Scale"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-55 hover:text-accent mt-[9px] inline-flex items-center gap-1 text-[11.5px]"
                >
                  {t("dashboard.usingThe")} <em>{t("dashboard.monkScale")}</em>
                  <ArrowUpRightIcon className="h-[9px] w-[9px]" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Targets drive bar length but are printed once per column, never per row.
function TargetNote({ buckets }) {
  if (!buckets.length) return null;
  const targets = [...new Set(buckets.map((b) => b.target))];
  const text =
    targets.length === 1
      ? t("dashboard.targetEach", { target: formatNumber(targets[0]) })
      : t("dashboard.targets", {
          targets: (buckets.length <= 3
            ? buckets.map((b) => b.target)
            : targets
          )
            .map(formatNumber)
            .join(" / "),
        });
  return (
    <span className="text-ink-45 tabular ml-auto shrink-0 pl-2 text-[11.5px] whitespace-nowrap">
      {text}
    </span>
  );
}

function Chart({ dimension, loading }) {
  switch (dimension.form) {
    case "columns":
      return <SwatchColumns buckets={dimension.buckets} loading={loading} />;
    case "label-above":
      return (
        <LabelAboveRows
          buckets={dimension.buckets}
          loading={loading}
          gap={dimension.id === "body" ? 18 : 21}
        />
      );
    default:
      return (
        <LabelledRows
          buckets={dimension.buckets}
          loading={loading}
          labelWidth={dimension.id === "disability" ? 140 : 44}
          valueWidth={dimension.id === "disability" ? 50 : 52}
          gap={dimension.id === "disability" ? 7 : 14}
        />
      );
  }
}
