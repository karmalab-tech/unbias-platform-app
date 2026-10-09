import iconBolt from "~/images/icons/icon_bolt.png";
import iconPeople from "~/images/icons/icon_people.png";
import iconPhotos from "~/images/icons/icon_photos.png";
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
    <section className="md:px-gutter mx-auto max-w-[1512px] px-4 pt-8 pb-8 md:pt-12 md:pb-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-5">
              <span className="font-display tabular text-[clamp(72px,13vw,148px)] leading-[0.86] font-extrabold tracking-[-0.01em] font-stretch-70%">
                {figure(total.approved)}
              </span>
              <span className="font-display tabular text-[clamp(28px,4vw,52px)] leading-none font-extrabold font-stretch-75%">
                / {formatNumber(total.target)}
              </span>
            </div>
            <p className="mono-caps mt-4 text-[13px] font-bold tracking-[0.12em]">
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
            <dl className="mt-5 flex flex-wrap gap-x-14 gap-y-4">
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
          className="press border-ink hatch-well relative block aspect-4/3 w-full cursor-pointer overflow-hidden border-2 text-left lg:order-3 lg:aspect-auto lg:w-[396px] lg:shrink-0"
          aria-label={t("nav.watchVideo")}
        >
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="border-ink bg-signal text-ink mono-caps absolute top-1/2 left-1/2 flex min-h-13 -translate-x-1/2 -translate-y-1/2 items-center gap-3 border-2 px-5 text-[14px] font-bold whitespace-nowrap">
            <span aria-hidden="true">▶</span>
            {t("nav.watchVideo")}
          </span>
        </button>

        {showSecondaryStats && (
          <dl className="flex flex-col gap-5 sm:flex-row lg:order-2 lg:w-[260px] lg:shrink-0 lg:flex-col lg:justify-between">
            <Stat
              tone="ink"
              icon={iconPeople}
              label={t("dashboard.peopleRepresented")}
              value={figure(total.approved)}
            />
            <Stat
              tone="lime"
              icon={iconPhotos}
              label={t("dashboard.imagesContributed")}
              value={figure(stats?.images)}
            />
            <Stat
              tone="peach"
              icon={iconBolt}
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
      <dt className="mono-caps flex items-center gap-2.5 text-[12px]">
        <span
          className={`border-ink inline-block h-4 w-4 border-2 ${swatch}`}
        />
        {label}
      </dt>
      <dd className="font-display tabular mt-1.5 text-[30px] leading-none font-extrabold font-stretch-75%">
        {value}
      </dd>
    </div>
  );
}

const TONES = {
  lime: "bg-lime text-ink shadow-hard",
  peach: "bg-peach text-ink shadow-hard",
  ink: "bg-ink text-cream shadow-hard-signal",
};

export function Stat({ tone, icon, label, value }) {
  return (
    <div
      className={`border-ink flex flex-1 items-center gap-3.5 border-2 px-4 py-3 ${TONES[tone]}`}
    >
      <img src={icon} alt="" className="h-14 w-14 shrink-0 object-contain" />
      <div className="min-w-0">
        <dt className="mono-caps text-[11px] leading-tight font-bold tracking-[0.08em]">
          {label}
        </dt>
        <dd className="font-display tabular mt-1 text-[34px] leading-none font-extrabold font-stretch-70%">
          {value}
        </dd>
      </div>
    </div>
  );
}
