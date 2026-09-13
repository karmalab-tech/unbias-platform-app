import {
  CheckCircleIcon,
  PhotoIcon,
  PlayCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Track } from "~/components/public/Bars";
import { formatNumber } from "~/lib/format";
import { t } from "~/i18n";

export default function Hero({
  stats,
  loading,
  onWatchVideo,
  poster,
  showSecondaryStats = true,
}) {
  const total = stats?.total ?? { approved: 0, pending: 0, target: 10000 };
  const stillNeeded = Math.max(
    0,
    total.target - total.approved - total.pending
  );
  const figure = (value) => (loading ? "—" : formatNumber(value));

  return (
    <section className="md:px-gutter mx-auto max-w-[1512px] px-5 pt-8 pb-8 md:pt-[44px] md:pb-9">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-[44px]">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-[22px]">
              <span className="font-display tabular text-[clamp(64px,12vw,124px)] leading-[0.88] font-extrabold tracking-[-0.045em]">
                {figure(total.approved)}
              </span>
              <span className="font-display text-ink-40 tabular text-[clamp(24px,4vw,48px)] leading-none font-medium tracking-[-0.02em]">
                / {formatNumber(total.target)}
              </span>
            </div>
            <p className="text-ink-55 mt-5 text-[14px] font-semibold tracking-[0.2em] uppercase">
              {t("dashboard.peopleRepresented")}
            </p>
          </div>
          <div>
            <Track
              className="mt-7"
              height={32}
              large
              approved={loading ? 0 : total.approved}
              pending={loading ? 0 : total.pending}
              target={total.target}
            />
            <dl className="mt-[22px] flex flex-wrap gap-x-16 gap-y-4">
              <LegendItem
                swatch="bg-data-approved"
                label={t("dashboard.approved")}
                value={figure(total.approved)}
              />
              <LegendItem
                swatch="hatch-lg"
                label={t("dashboard.pendingReview")}
                value={figure(total.pending)}
              />
              <LegendItem
                swatch="bg-data-track"
                label={t("dashboard.stillNeeded")}
                value={figure(stillNeeded)}
              />
            </dl>
          </div>
        </div>

        <button
          type="button"
          onClick={onWatchVideo}
          className="rounded-media bg-surface relative block aspect-[4/3] w-full overflow-hidden text-left lg:order-3 lg:aspect-auto lg:w-[396px] lg:shrink-0"
          aria-label={t("nav.watchVideo")}
        >
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="pointer-events-none absolute inset-0 bg-[rgba(18,16,12,0.24)]" />
          <span className="rounded-btn bg-accent hover:bg-accent-hover absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[11px] px-[22px] py-[14px] text-[15.5px] font-semibold whitespace-nowrap text-white">
            <PlayCircleIcon className="h-5 w-5" />
            {t("nav.watchVideo")}
          </span>
        </button>

        {showSecondaryStats && (
          <dl className="flex flex-col gap-5 py-0.5 sm:flex-row sm:gap-8 lg:order-2 lg:w-[236px] lg:shrink-0 lg:flex-col lg:justify-between">
            <Stat
              tint="bg-tint-age"
              icon={UsersIcon}
              label={t("dashboard.peopleRepresented")}
              value={figure(total.approved)}
            />
            <Stat
              tint="bg-tint-skin"
              icon={PhotoIcon}
              label={t("dashboard.imagesContributed")}
              value={figure(stats?.images)}
            />
            <Stat
              tint="bg-tint-body"
              icon={CheckCircleIcon}
              label={t("dashboard.contributionsToday")}
              value={figure(stats?.contributions_last_24h)}
            />
          </dl>
        )}
      </div>
    </section>
  );
}

function LegendItem({ swatch, label, value }) {
  return (
    <div>
      <dt className="text-ink-72 flex items-center gap-2 text-[14.5px] font-medium">
        <span
          className={`inline-block h-[15px] w-[15px] rounded-[3px] ${swatch}`}
        />
        {label}
      </dt>
      <dd className="font-display tabular mt-1 text-[25px] font-bold tracking-[-0.01em]">
        {value}
      </dd>
    </div>
  );
}

function Stat({ tint, icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${tint}`}
      >
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <div>
        <dt className="text-ink-60 text-[14.5px]">{label}</dt>
        <dd className="font-display tabular text-[30px] leading-[1.15] font-bold tracking-[-0.025em]">
          {value}
        </dd>
      </div>
    </div>
  );
}
