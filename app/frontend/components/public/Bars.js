import { percent } from "~/lib/coverage";
import { formatNumber } from "~/lib/format";

const motion =
  "motion-safe:transition-[width,height] motion-safe:duration-700 motion-safe:ease-out";

export function Track({
  approved,
  pending,
  target,
  height = 11,
  large = false,
  className = "",
}) {
  return (
    <div
      className={`rounded-bar bg-data-track flex overflow-hidden ${className}`}
      style={{ height }}
      role="img"
      aria-label={`${formatNumber(approved)} / ${formatNumber(target)}`}
    >
      <div
        className={`bg-data-approved ${motion}`}
        style={{ width: `${percent(approved, target)}%` }}
      />
      <div
        className={`${large ? "hatch-lg" : "hatch"} ${motion}`}
        style={{ width: `${percent(pending, target)}%` }}
      />
    </div>
  );
}

export function LabelledRows({
  buckets,
  labelWidth = 44,
  valueWidth = 52,
  gap = 14,
  loading = false,
}) {
  return (
    <ul className="m-0 list-none p-0">
      {buckets.map((bucket) => (
        <li
          key={bucket.value}
          className="flex items-center gap-2.5"
          style={{ marginBottom: gap }}
        >
          <span
            className="text-ink-72 shrink-0 text-[12.5px] leading-tight font-medium"
            style={{ width: labelWidth }}
          >
            {bucket.label}
          </span>
          <Track
            className="min-w-0 flex-auto"
            approved={loading ? 0 : bucket.approved}
            pending={loading ? 0 : bucket.pending}
            target={bucket.target}
          />
          <span
            className="tabular shrink-0 text-right text-[12px] font-semibold"
            style={{ width: valueWidth }}
          >
            {loading ? "—" : formatNumber(bucket.approved)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LabelAboveRows({ buckets, gap = 21, loading = false }) {
  return (
    <ul className="m-0 list-none p-0">
      {buckets.map((bucket) => (
        <li key={bucket.value} style={{ marginBottom: gap }}>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="text-ink-72 text-[12.5px] leading-tight font-medium">
              {bucket.label}
            </span>
            <span className="tabular text-[12px] font-semibold">
              {loading ? "—" : formatNumber(bucket.approved)}
            </span>
          </div>
          <Track
            height={12}
            approved={loading ? 0 : bucket.approved}
            pending={loading ? 0 : bucket.pending}
            target={bucket.target}
          />
        </li>
      ))}
    </ul>
  );
}

// Ten Monk columns: value on top, fills grow from the bottom, swatch underneath.
export function SwatchColumns({ buckets, loading = false }) {
  return (
    <div className="flex h-[168px] items-stretch gap-[7px]">
      {buckets.map((bucket) => (
        <div
          key={bucket.value}
          className="flex min-w-0 flex-1 flex-col items-center gap-[7px]"
        >
          <span className="text-ink-60 tabular text-[10.5px] font-semibold">
            {loading ? "—" : formatNumber(bucket.approved)}
          </span>
          <div
            className="rounded-bar bg-data-track flex w-full flex-auto flex-col justify-end overflow-hidden"
            role="img"
            aria-label={`${bucket.label}: ${formatNumber(bucket.approved)} / ${formatNumber(bucket.target)}`}
          >
            <div
              className={`hatch w-full ${motion}`}
              style={{
                height: `${loading ? 0 : percent(bucket.pending, bucket.target)}%`,
              }}
            />
            <div
              className={`bg-data-approved w-full ${motion}`}
              style={{
                height: `${loading ? 0 : percent(bucket.approved, bucket.target)}%`,
              }}
            />
          </div>
          <span
            className="border-ink/10 h-[13px] w-full shrink-0 rounded-[3px] border"
            style={{ background: bucket.swatch }}
            title={bucket.label}
          />
        </div>
      ))}
    </div>
  );
}
