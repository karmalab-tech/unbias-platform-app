// Large tappable choices for the annotation screen. Single select unless `multiple`.
export default function ChoiceGrid({
  options,
  value,
  onChange,
  multiple = false,
  columns = 2,
  renderOption,
}) {
  const selected = (option) =>
    multiple ? (value ?? []).includes(option) : value === option;

  const toggle = (option) => {
    if (!multiple) return onChange(option);
    const current = value ?? [];
    return onChange(
      current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option]
    );
  };

  const cols = { 2: "grid-cols-2", 3: "grid-cols-3" }[columns] ?? "grid-cols-2";

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      className={`grid ${cols} gap-2`}
    >
      {options.map((option) => {
        const on = selected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={on}
            onClick={() => toggle(option.value)}
            className={`flex min-h-14 items-center gap-3 border-2 px-4 py-3 text-left text-[15px] leading-tight font-medium ${
              on
                ? "border-ink bg-ink text-cream"
                : "border-ink text-ink hover:bg-peach bg-cream"
            }`}
          >
            {renderOption ? renderOption(option, on) : option.label}
          </button>
        );
      })}
    </div>
  );
}
