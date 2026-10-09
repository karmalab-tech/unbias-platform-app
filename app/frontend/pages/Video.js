import { useCachedVideo } from "~/lib/cachedVideo";
import { useOfflineDashboard } from "~/lib/offline";
import { useSettings } from "~/lib/settings";
import { t } from "~/i18n";

// Screen loop for a second display: the intro video alone, full screen, muted, no controls.
export default function Video() {
  useOfflineDashboard();
  const settings = useSettings();
  const src = useCachedVideo(settings?.intro_video_url);

  return (
    <div className="bg-ink fixed inset-0 overflow-hidden">
      {src ? (
        <video
          className="h-full w-full object-contain"
          src={src}
          poster={settings.intro_video_poster_url ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
        />
      ) : (
        settings &&
        !settings.intro_video_url && (
          <p className="mono-caps text-cream flex h-full items-center justify-center text-[15px]">
            {t("dashboard.videoSoon")}
          </p>
        )
      )}
    </div>
  );
}
