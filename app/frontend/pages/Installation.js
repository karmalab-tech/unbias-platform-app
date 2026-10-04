import { useEffect, useRef, useState } from "react";
import { Track } from "~/components/public/Bars";
import RepresentationCharts from "~/components/public/RepresentationCharts";
import NeedCards from "~/components/public/NeedCards";
import usePolling from "~/lib/usePolling";
import { useOfflineDashboard } from "~/lib/offline";
import { useSettings } from "~/lib/settings";
import { formatNumber } from "~/lib/format";
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
        <div className="flex min-h-0 flex-col justify-between">
          <div>
            <p className="text-ink-55 text-[16px] font-semibold tracking-[0.2em] uppercase">
              {t("home.title")}
            </p>
            <div
              className={`mt-3 flex flex-wrap items-baseline gap-x-6 ${bump ? "motion-safe:animate-[pulse_0.6s_ease-out_1]" : ""}`}
            >
              <span className="font-display tabular text-[clamp(72px,min(11vw,17vh),200px)] leading-[0.88] font-extrabold tracking-[-0.045em]">
                {stats ? formatNumber(total.approved) : "—"}
              </span>
              <span className="font-display text-ink-40 tabular text-[clamp(28px,min(4vw,6vh),72px)] leading-none font-medium tracking-[-0.02em]">
                / {formatNumber(total.target)}
              </span>
            </div>
            <p className="text-ink-55 mt-3 text-[18px] font-semibold tracking-[0.2em] uppercase">
              {t("dashboard.peopleRepresented")}
            </p>
          </div>
          <div>
            <Track
              className="mt-4"
              height={32}
              large
              approved={total.approved}
              pending={total.pending}
              target={total.target}
            />
            <dl className="mt-4 flex flex-wrap gap-x-16 gap-y-4 text-[18px]">
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
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-media bg-surface relative min-h-0 flex-1 overflow-hidden">
            {settings?.intro_video_url ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={settings.intro_video_url}
                poster={settings.intro_video_poster_url ?? undefined}
                autoPlay
                muted
                loop
                playsInline
              >
                {settings.intro_video_subtitles_url && (
                  <track
                    kind="subtitles"
                    src={settings.intro_video_subtitles_url}
                    default
                  />
                )}
              </video>
            ) : (
              <p className="text-ink-55 absolute inset-0 flex items-center justify-center px-8 text-center text-[17px]">
                {t("dashboard.videoSoon")}
              </p>
            )}
          </div>
          <div className="rounded-banner bg-surface-warm flex shrink-0 items-center gap-6 px-6 py-4">
            <img
              src="/qr.svg"
              alt=""
              className="rounded-qr h-[clamp(96px,14vh,150px)] w-[clamp(96px,14vh,150px)]"
              width="150"
              height="150"
            />
            <div>
              <p className="font-display text-[clamp(24px,2.2vw,34px)] leading-[1.1] font-bold tracking-[-0.025em]">
                {t("installation.scan")}
              </p>
              <p className="text-ink-72 tabular mt-2 text-[20px]">
                {host}/contribute
              </p>
              <p className="text-ink-55 mt-3 text-[15px]">
                {t("dashboard.reviewedByPeople")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <NeedCards needs={stats?.needs} containerClass="max-w-[1900px]" compact />
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
      className="bg-ink/60 fixed inset-0 z-50 flex items-center justify-center p-8"
    >
      <div className="rounded-card bg-canvas w-full max-w-[640px] p-10 text-center">
        <p className="font-display text-[34px] leading-tight font-bold tracking-[-0.025em]">
          {t("installation.chooseLanguage")}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-5">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              lang={code}
              onClick={() => chooseLocale(code)}
              className="rounded-card bg-surface-warm font-display hover:bg-tint-skin cursor-pointer py-8 text-[28px] font-bold"
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
      <dt className="text-ink-72 flex items-center gap-2.5 font-medium">
        <span
          className={`inline-block h-[18px] w-[18px] rounded-[4px] ${swatch}`}
        />
        {label}
      </dt>
      <dd className="font-display tabular mt-1 text-[clamp(24px,4vh,34px)] font-bold tracking-[-0.01em]">
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
