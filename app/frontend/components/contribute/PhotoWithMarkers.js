import { t } from "~/i18n";

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
              isSelected ? "bg-signal text-ink scale-125" : "bg-ink text-cream"
            } ${selected !== null && !isSelected ? "opacity-60" : ""} ${
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
