import { useState } from "react";
import PublicHeader from "~/components/public/PublicHeader";
import Hero from "~/components/public/Hero";
import NeedCards from "~/components/public/NeedCards";
import RepresentationCharts from "~/components/public/RepresentationCharts";
import ContributeBanner from "~/components/public/ContributeBanner";
import PublicFooter from "~/components/public/PublicFooter";
import VideoOverlay from "~/components/public/VideoOverlay";
import usePolling from "~/lib/usePolling";
import { useSettings } from "~/lib/settings";
import { t } from "~/i18n";

export default function Home() {
  const settings = useSettings();
  const { data: stats, error } = usePolling(
    "/api/public/stats",
    settings?.limits?.stats_poll_seconds ?? 5
  );
  const [videoOpen, setVideoOpen] = useState(false);
  const loading = !stats;

  return (
    <div className="bg-canvas text-ink min-h-dvh">
      <PublicHeader onWatchVideo={() => setVideoOpen(true)} hasVideo />
      <h1 className="sr-only">{t("home.title")}</h1>
      <Hero
        stats={stats}
        loading={loading}
        onWatchVideo={() => setVideoOpen(true)}
        poster={settings?.intro_video_poster_url}
      />
      <NeedCards needs={stats?.needs} />
      <RepresentationCharts buckets={stats?.buckets} loading={loading} />
      {error && (
        <p className="text-ink-60 md:px-gutter mx-auto max-w-[1512px] px-5 pb-6 text-[14px]">
          {t("dashboard.offline")}
        </p>
      )}
      <ContributeBanner />
      <PublicFooter />
      <VideoOverlay
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        src={settings?.intro_video_url}
        subtitles={settings?.intro_video_subtitles_url}
      />
    </div>
  );
}
