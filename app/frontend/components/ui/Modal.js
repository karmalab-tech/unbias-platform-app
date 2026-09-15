import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { t } from "~/i18n";

export default function Modal({ open, onClose, title, children }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.activeElement;
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="bg-shell/70 fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rounded-banner bg-canvas w-full max-w-md p-6 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-[21px] leading-[1.25] font-bold tracking-[-0.015em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-ink-60 hover:text-ink rounded-full p-1"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
