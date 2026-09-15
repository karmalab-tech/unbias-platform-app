export const inputClass =
  "block w-full rounded-btn border border-ink/20 bg-white/60 px-4 py-3 text-[15.5px] text-ink placeholder:text-ink-45 focus:border-ink focus:outline-none";

export default function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="text-ink-72 mb-2 block text-[14.5px] font-medium">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="text-ink-55 mt-2 block text-[13px]">{hint}</span>
      )}
      {error && (
        <span className="text-accent mt-2 block text-[13px]">{error}</span>
      )}
    </label>
  );
}

export function Checkbox({ checked, onChange, children, required = false }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15.5px] leading-[1.5]">
      <input
        type="checkbox"
        className="accent-accent mt-1 h-5 w-5 shrink-0"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required={required}
      />
      <span className="text-ink">{children}</span>
    </label>
  );
}
