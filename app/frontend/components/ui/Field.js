export const inputClass =
  "block w-full border-2 border-ink bg-cream px-4 py-3 text-[15.5px] text-ink placeholder:text-ink-45";

export default function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mono-caps mb-2 block text-[12px] font-bold tracking-[0.08em]">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="text-ink-55 mt-2 block text-[13px]">{hint}</span>
      )}
      {error && <span className="notice mt-2 block">{error}</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, children, required = false }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15.5px] leading-[1.5]">
      <input
        type="checkbox"
        className="accent-ink mt-1 h-5 w-5 shrink-0"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
      />
      <span className="text-ink">{children}</span>
    </label>
  );
}
