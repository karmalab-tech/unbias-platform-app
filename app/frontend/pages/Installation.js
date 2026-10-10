import { useEffect, useRef, useState } from "react";
import { Track } from "~/components/public/Bars";
import RepresentationCharts from "~/components/public/RepresentationCharts";
import { Stat } from "~/components/public/Hero";
import iconBolt from "~/images/icons/icon_bolt.png";
import iconPeople from "~/images/icons/icon_people.png";
import iconPhotos from "~/images/icons/icon_photos.png";
import usePolling from "~/lib/usePolling";
import { useOfflineDashboard } from "~/lib/offline";
import { useSettings } from "~/lib/settings";
import { formatNumber } from "~/lib/format";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "~/lib/social";
import { LANGUAGES, chooseLocale, hasStoredLocale, t } from "~/i18n";

// Installation screen: no navigation, autoplaying muted intro with subtitles, QR hand-off, faster polling.
export default function Installation() {
  useOfflineDashboard();
  const settings = useSettings();
  const { data: stats } = usePolling(
    "/api/public/stats",
    settings?.limits?.installation_poll_seconds ?? 3
  );
  const total = stats?.total ?? {
    approved: 0,
    pending: 0,
    target: settings?.people_milestone ?? 10000,
  };
  const bump = useBumpOnChange(total.approved + total.pending);
  const host = typeof window !== "undefined" ? window.location.host : "";

  return (
    <div className="bg-canvas text-ink flex h-dvh flex-col overflow-hidden">
      {!hasStoredLocale() && <LocalePicker />}
      <section className="px-gutter mx-auto grid min-h-0 w-full max-w-[1900px] flex-1 gap-10 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex min-h-0 flex-col justify-around">
          <div>
            <div
              className={`mt-3 flex flex-wrap items-baseline gap-x-6 ${bump ? "motion-safe:animate-[pulse_0.6s_ease-out_1]" : ""}`}
            >
              <span className="font-display tabular text-[clamp(80px,min(12vw,19vh),230px)] leading-[0.86] font-extrabold tracking-[-0.01em] font-stretch-70%">
                {stats ? formatNumber(total.approved) : "—"}
              </span>
              <span className="font-display tabular text-[clamp(32px,min(4vw,6vh),72px)] leading-none font-extrabold font-stretch-75%">
                / {formatNumber(total.target)}
              </span>
            </div>
            <p className="mono-caps mt-3 text-[18px] font-bold tracking-[0.12em]">
              {t("dashboard.peopleRepresented")}
            </p>
          </div>
          <div>
            <Track
              className="mt-4"
              height={36}
              large
              approved={total.approved}
              pending={total.pending}
              target={total.target}
            />
            <dl className="mt-4 flex flex-wrap gap-x-16 gap-y-4">
              <Legend
                swatch="bg-data-approved"
                label={t("dashboard.approved")}
                value={total.approved}
              />
              <Legend
                swatch="hatch-lg"
                label={t("dashboard.pendingReview")}
                value={total.pending}
              />
              <Legend
                swatch="bg-data-track"
                label={t("dashboard.stillNeeded")}
                value={Math.max(
                  0,
                  total.target - total.approved - total.pending
                )}
              />
            </dl>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-6 pb-2">
            <Stat
              tone="ink"
              icon={iconPeople}
              label={t("dashboard.peopleRepresented")}
              value={stats ? formatNumber(total.approved) : "—"}
            />
            <Stat
              tone="lime"
              icon={iconPhotos}
              label={t("dashboard.imagesContributed")}
              value={stats ? formatNumber(stats.images) : "—"}
            />
            <Stat
              tone="peach"
              icon={iconBolt}
              label={t("dashboard.contributionsToday")}
              value={stats ? formatNumber(stats.contributions_last_24h) : "—"}
            />
          </dl>
        </div>

        <div className="flex min-h-0 flex-col gap-6">
          <div className="border-ink bg-lime shadow-hard flex shrink-0 flex-col justify-center gap-2 border-2 px-8 py-5">
            <p className="display-caps text-[clamp(28px,2.6vw,44px)] leading-[0.95]">
              {t("installation.followTitle")}
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tabular font-mono text-[clamp(16px,1.4vw,22px)] font-bold"
            >
              {INSTAGRAM_HANDLE}
            </a>
          </div>
          <div className="bg-ink text-cream border-ink shadow-hard-signal flex min-h-0 flex-1 items-center gap-8 border-2 px-8 py-6">
            <img
              src="/qr.svg"
              alt=""
              className="bg-cream h-[clamp(140px,28vh,300px)] w-[clamp(140px,28vh,300px)] shrink-0 p-4"
              width="150"
              height="150"
            />
            <div className="min-w-0">
              <p className="display-caps text-[clamp(30px,2.8vw,52px)] leading-[0.95]">
                {t("installation.scan")}
              </p>
              <p className="tabular mt-3 font-mono text-[clamp(16px,1.3vw,24px)] font-bold whitespace-nowrap">
                {host}/contribute
              </p>
              <p className="text-peach mt-4 text-[clamp(16px,1.4vw,22px)]">
                {t("dashboard.reviewedByPeople")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <RepresentationCharts
        compact
        buckets={stats?.buckets}
        loading={!stats}
        containerClass="max-w-[1900px]"
      />
    </div>
  );
}

// Shown until a locale is stored; the kiosk has no footer switcher to find.
function LocalePicker() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("installation.chooseLanguage")}
      className="bg-ink/80 fixed inset-0 z-50 flex items-center justify-center p-8"
    >
      <div className="border-ink bg-cream shadow-hard-signal w-full max-w-[640px] border-2 p-10 text-center">
        <p className="display-caps text-[40px] leading-none">
          {t("installation.chooseLanguage")}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6">
          {LANGUAGES.map(({ code, label }, index) => (
            <button
              key={code}
              type="button"
              lang={code}
              onClick={() => chooseLocale(code)}
              className={`press border-ink display-caps cursor-pointer border-2 py-8 text-[32px] ${index === 0 ? "bg-lime" : "bg-peach"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label, value }) {
  return (
    <div>
      <dt className="mono-caps flex items-center gap-2.5 text-[14px]">
        <span
          className={`border-ink inline-block h-4.5 w-4.5 border-2 ${swatch}`}
        />
        {label}
      </dt>
      <dd className="font-display tabular mt-1 text-[clamp(28px,4.5vh,40px)] leading-none font-extrabold font-stretch-75%">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

// True for a moment after the count changes, so a new contribution visibly lands on the wall.
function useBumpOnChange(value) {
  const [bump, setBump] = useState(false);
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return undefined;
    previous.current = value;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 700);
    return () => clearTimeout(timer);
  }, [value]);
  return bump;
}
