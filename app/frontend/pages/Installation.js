import { useEffect, useRef, useState } from "react";
import { Track } from "~/components/public/Bars";
import RepresentationCharts from "~/components/public/RepresentationCharts";
import NeedCards from "~/components/public/NeedCards";
import usePolling from "~/lib/usePolling";
import { useSettings } from "~/lib/settings";
import { formatNumber } from "~/lib/format";
import { t } from "~/i18n";

// IA·gora screen: no navigation, autoplaying muted intro with subtitles, QR hand-off, faster polling.
export default function Installation() {
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
    <div className="bg-canvas text-ink min-h-dvh">
      <section className="px-gutter mx-auto grid max-w-[1900px] gap-10 pt-12 pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-ink-55 text-[16px] font-semibold tracking-[0.2em] uppercase">
              {t("home.title")}
            </p>
            <div
              className={`mt-6 flex flex-wrap items-baseline gap-x-6 ${bump ? "motion-safe:animate-[pulse_0.6s_ease-out_1]" : ""}`}
            >
              <span className="font-display tabular text-[clamp(96px,11vw,200px)] leading-[0.88] font-extrabold tracking-[-0.045em]">
                {stats ? formatNumber(total.approved) : "—"}
              </span>
              <span className="font-display text-ink-40 tabular text-[clamp(36px,4vw,72px)] leading-none font-medium tracking-[-0.02em]">
                / {formatNumber(total.target)}
              </span>
            </div>
            <p className="text-ink-55 mt-6 text-[18px] font-semibold tracking-[0.2em] uppercase">
              {t("dashboard.peopleRepresented")}
            </p>
          </div>
          <div>
            <Track
              className="mt-8"
              height={40}
              large
              approved={total.approved}
              pending={total.pending}
              target={total.target}
            />
            <dl className="mt-6 flex flex-wrap gap-x-16 gap-y-4 text-[18px]">
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

        <div className="flex flex-col gap-6">
          <div
            className="rounded-media bg-surface relative flex-1 overflow-hidden"
            style={{ minHeight: 320 }}
          >
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
          <div className="rounded-banner bg-surface-warm flex items-center gap-7 px-8 py-6">
            <img
              src="/qr.svg"
              alt=""
              className="rounded-qr h-[150px] w-[150px]"
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

      <NeedCards needs={stats?.needs} containerClass="max-w-[1900px]" />
      <RepresentationCharts
        buckets={stats?.buckets}
        loading={!stats}
        containerClass="max-w-[1900px]"
      />

      <footer className="px-gutter text-ink-55 mx-auto flex max-w-[1900px] items-center justify-between pb-10 text-[15px]">
        <span>{t("footer.credits")}</span>
        <span>
          {host}/about · {t("nav.whatIsThis")}
        </span>
      </footer>
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
      <dd className="font-display tabular mt-1 text-[34px] font-bold tracking-[-0.01em]">
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
