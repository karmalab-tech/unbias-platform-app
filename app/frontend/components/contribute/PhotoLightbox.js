import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  IDENTITY,
  MAX_SCALE,
  MIN_SCALE,
  clamp,
  clampPan,
  distance,
  midpoint,
  zoomAround,
} from "~/lib/pinch";
import { t } from "~/i18n";

const DURATION = 200;
const TAP_SLOP = 8;

// Full-screen look at the photo being described, without the person markers.
// Pinch to zoom, drag to pan, tap to zoom back out and then to close.
export default function PhotoLightbox({ src, open, onClose }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [transform, setTransform] = useState(IDENTITY);
  const [gesturing, setGesturing] = useState(false);
  const close = useRef(null);
  const image = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);

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
    setTransform(IDENTITY);
    pointers.current.clear();
    gesture.current = null;
    const timer = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(timer);
  }, [open]);

  // Waits for the panel to be in the DOM, one render after `open` flips.
  useEffect(() => {
    if (!open || !mounted) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    // The photo owns every pinch while it is open: no page zoom, no scrolling.
    const block = (event) => event.preventDefault();
    const blockPinch = (event) =>
      event.touches.length > 1 && event.preventDefault();
    const options = { passive: false };
    document.addEventListener("keydown", onKey);
    document.addEventListener("gesturestart", block, options);
    document.addEventListener("gesturechange", block, options);
    document.addEventListener("touchmove", blockPinch, options);
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("gesturestart", block, options);
      document.removeEventListener("gesturechange", block, options);
      document.removeEventListener("touchmove", blockPinch, options);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, mounted, onClose]);

  // Restarts the gesture from the current transform whenever a finger lands or lifts.
  const restart = () => {
    const [a, b] = [...pointers.current.values()];
    if (!a || !image.current) return;
    const rect = image.current.getBoundingClientRect();
    // Scaling leaves the centre where it is, so undoing the pan gives the
    // untransformed centre: the origin the translation is measured from.
    const centre = {
      x: rect.left + rect.width / 2 - transform.x,
      y: rect.top + rect.height / 2 - transform.y,
    };
    const local = (point) => ({ x: point.x - centre.x, y: point.y - centre.y });
    gesture.current = {
      from: transform,
      centre,
      base: {
        width: rect.width / transform.scale,
        height: rect.height / transform.scale,
      },
      origin: local(b ? midpoint(a, b) : a),
      spread: b ? distance(a, b) : 0,
      moved: gesture.current?.moved ?? 0,
      pinched: Boolean(b) || Boolean(gesture.current?.pinched),
    };
  };

  const onPointerDown = (event) => {
    if (close.current?.contains(event.target)) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    restart();
    setGesturing(true);
  };

  const onPointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const active = gesture.current;
    if (!active) return;
    const [a, b] = [...pointers.current.values()].map((point) => ({
      x: point.x - active.centre.x,
      y: point.y - active.centre.y,
    }));
    const next = b
      ? zoomAround(
          active.from,
          active.origin,
          clamp(
            (active.from.scale * distance(a, b)) / active.spread,
            MIN_SCALE,
            MAX_SCALE
          ),
          midpoint(a, b)
        )
      : {
          ...active.from,
          x: active.from.x + a.x - active.origin.x,
          y: active.from.y + a.y - active.origin.y,
        };
    active.moved = Math.max(active.moved, distance(a, active.origin));
    setTransform(
      clampPan(next, active.base, {
        width: window.innerWidth,
        height: window.innerHeight,
      })
    );
  };

  const onPointerUp = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0) return restart();

    const active = gesture.current;
    gesture.current = null;
    setGesturing(false);
    if (!active || active.pinched || active.moved > TAP_SLOP) return;
    if (transform.scale > MIN_SCALE) setTransform(IDENTITY);
    else onClose();
  };

  const onPointerCancel = (event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size > 0) return restart();
    gesture.current = null;
    setGesturing(false);
  };

  if (!mounted) return null;

  const entering = shown ? 1 : 0.95;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("annotate.viewPhoto")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`bg-ink fixed inset-0 z-40 flex touch-none items-center justify-center overflow-hidden p-4 transition-opacity duration-200 select-none ${
        shown ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        ref={image}
        src={src}
        alt=""
        draggable={false}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale * entering})`,
        }}
        className={`max-h-full max-w-full object-contain ${
          transform.scale > MIN_SCALE ? "cursor-grab" : "cursor-zoom-out"
        } ${gesturing ? "" : "transition-transform duration-200"}`}
      />
      <button
        ref={close}
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="border-cream text-cream hover:bg-cream hover:text-ink absolute top-4 right-4 flex h-11 w-11 items-center justify-center border-2"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
