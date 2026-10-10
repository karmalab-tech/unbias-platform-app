import { t } from "~/i18n";

const PointerHand = () => (
  <svg
    viewBox="0 0 24 24"
    className="animate-tap-hint h-20 w-20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path
      className="fill-cream"
      d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15V4a2 2 0 0 1 4 0v5.5V9a2 2 0 0 1 4 0v1a2 2 0 0 1 3 1Z"
    />
    <path d="M18 11v-1M14 10V9M10 9.5V4" />
  </svg>
);

const center = (region) => ({
  x: (region.x ?? 0) + (region.w ?? 0) / 2,
  y: (region.y ?? 0) + (region.h ?? 0) / 2,
});

// Numbered markers on the original image. No boxes are drawn: tapping is enough.
export default function PhotoWithMarkers({
  src,
  people,
  selected = null,
  onAdd,
  onRemove,
  onOpen,
  hint = false,
  className = "",
  imageClass = "max-h-[60vh]",
}) {
  const handleClick = (event) => {
    if (!onAdd) return;
    const rect = event.currentTarget.getBoundingClientRect();
    onAdd({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };

  return (
    <div
      className={`bg-surface relative mx-auto w-fit overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt=""
        className={`block max-w-full ${imageClass} ${onAdd ? "cursor-crosshair" : ""}`}
        onClick={handleClick}
        draggable={false}
      />
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={t("annotate.viewPhoto")}
          className="absolute inset-0 cursor-zoom-in"
        />
      )}
      {hint && people.length === 0 && (
        <div className="text-ink pointer-events-none absolute inset-0 flex items-center justify-center">
          <PointerHand />
        </div>
      )}
      {people.map((person, index) => {
        const { x, y } = center(person.detection_region ?? {});
        const isSelected = selected === index;
        return (
          <button
            key={person.id ?? index}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove?.(index);
            }}
            disabled={!onRemove}
            aria-label={
              onRemove
                ? t("people.removePerson", { n: index + 1 })
                : `${index + 1}`
            }
            className={`font-display border-ink absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 text-[15px] font-extrabold transition-transform ${
              hint ? "marker-round" : ""
            } ${
              hint || isSelected ? "bg-signal text-ink" : "bg-ink text-cream"
            } ${isSelected ? "scale-125" : ""} ${selected !== null && !isSelected ? "opacity-60" : ""} ${
              onRemove ? "" : "pointer-events-none"
            }`}
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
