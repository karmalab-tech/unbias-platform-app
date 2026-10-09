import {
  LabelAboveRows,
  LabelledRows,
  SwatchColumns,
} from "~/components/public/Bars";
import { groupBuckets } from "~/lib/coverage";
import { formatNumber } from "~/lib/format";
import { t } from "~/i18n";

const COLUMN_WIDTHS =
  "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.16fr)]";

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
    <section className="border-ink border-t-2">
      <div
        className={`md:px-gutter mx-auto ${containerClass} px-4 ${compact ? "py-6" : "py-10"}`}
      >
        {!compact && (
          <div className="border-ink mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 pb-3">
            <h2 className="display-caps text-[40px] leading-none">
              {t("dashboard.representation")}
            </h2>
            <ChartLegend />
          </div>
        )}

        <div
          className={`grid gap-y-10 md:grid-cols-2 ${compact ? "md:gap-x-4" : "md:gap-x-[30px]"} ${COLUMN_WIDTHS} xl:gap-y-0`}
        >
          {dimensions.map((dimension, index) => (
            <div
              key={dimension.id}
              className={`border-ink ${index > 0 ? `border-t-2 pt-8 md:border-t-0 md:pt-0 xl:border-l-2 ${padLeft}` : ""} ${index < dimensions.length - 1 ? padRight : ""}`}
            >
              <div className="mb-5 flex flex-wrap items-start gap-x-2.5 gap-y-1">
                {!compact && (
                  <span className="font-mono text-[12px] font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
                <h3 className="mono-caps text-[13px] leading-tight font-bold tracking-[0.12em]">
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
                  className="mono-caps mt-2.5 inline-flex items-center gap-1 text-[11px] tracking-[0.06em] hover:underline"
                >
                  {t("dashboard.usingThe")} {t("dashboard.monkScale")}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ChartLegend({ className = "" }) {
  return (
    <ul
      className={`mono-caps flex flex-wrap gap-x-5 gap-y-2 text-[12px] tracking-[0.08em] ${className}`}
    >
      <li className="flex items-center gap-2">
        <span className="bg-data-approved border-ink inline-block h-3.5 w-3.5 border-2" />
        {t("dashboard.approved")}
      </li>
      <li className="flex items-center gap-2">
        <span className="hatch border-ink inline-block h-3.5 w-3.5 border-2" />
        {t("dashboard.pending")}
      </li>
    </ul>
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
    <span className="mono-caps tabular ml-auto shrink-0 pl-2 text-[11px] tracking-[0.06em] whitespace-nowrap">
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
          labelWidth={dimension.id === "disability" ? 120 : 44}
          valueWidth={dimension.id === "disability" ? 50 : 52}
          gap={dimension.id === "disability" ? 7 : 14}
        />
      );
  }
}
