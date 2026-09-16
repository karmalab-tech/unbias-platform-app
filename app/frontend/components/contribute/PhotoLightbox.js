import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { t } from "~/i18n";

const DURATION = 200;

// Full-screen look at the photo being described, without the person markers.
export default function PhotoLightbox({ src, open, onClose }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const close = useRef(null);

  // Mount before the enter transition, unmount only after the leave one.
  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two frames: the closed state has to paint once before the transition runs.
      let inner;
      const frame = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(timer);
  }, [open]);

  // Waits for the panel to be in the DOM, one render after `open` flips.
  useEffect(() => {
    if (!open || !mounted) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("annotate.viewPhoto")}
      onClick={onClose}
      className={`bg-shell fixed inset-0 z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className={`max-h-full max-w-full cursor-zoom-out object-contain transition-transform duration-200 ${
          shown ? "scale-100" : "scale-95"
        }`}
      />
      <button
        ref={close}
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="bg-canvas/15 text-canvas hover:bg-canvas/25 absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
