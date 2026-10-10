import { useEffect, useRef } from "react";
import { t } from "~/i18n";

export default function VideoOverlay({ open, onClose, src, subtitles }) {
  const dialog = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    dialog.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="bg-ink/95 fixed inset-0 z-50 flex flex-col items-center justify-center gap-[26px] p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.watchVideo")}
        className="bg-ink aspect-video w-full max-w-[64vw] overflow-hidden max-md:max-w-full"
        onClick={(event) => event.stopPropagation()}
      >
        {src ? (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            className="h-full w-full"
          >
            {subtitles && <track kind="subtitles" src={subtitles} default />}
          </video>
        ) : (
          <p className="text-cream flex h-full items-center justify-center px-6 text-center text-[15.5px]">
            {t("dashboard.videoSoon")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-cream text-[15px] hover:underline"
      >
        {t("common.close")}
      </button>
    </div>
  );
}
