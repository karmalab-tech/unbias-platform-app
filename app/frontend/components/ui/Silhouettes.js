// Minimal body silhouettes: same head, torso width is the only variable.
const WIDTHS = { thin: 14, medium: 20, large: 28, very_large: 36 };

export function BodySilhouette({ body, className = "h-10 w-6" }) {
  const width = WIDTHS[body];
  if (!width) return null;
  const x = 24 - width / 2;
  return (
    <svg viewBox="0 0 48 96" className={className} aria-hidden="true">
      <circle cx="24" cy="12" r="9" fill="currentColor" />
      <rect
        x={x}
        y="26"
        width={width}
        height="46"
        rx={width / 2.4}
        fill="currentColor"
      />
      <rect x="15" y="68" width="7" height="26" rx="3.5" fill="currentColor" />
      <rect x="26" y="68" width="7" height="26" rx="3.5" fill="currentColor" />
    </svg>
  );
}
