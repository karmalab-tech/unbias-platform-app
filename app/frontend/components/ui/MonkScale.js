import { t } from "~/i18n";

// Ten fixed reference swatches, always in order, always labelled 1 to 10.
export default function MonkScale({ swatches, value, suggested, onChange }) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label={t("annotate.skinTone")}
        className="grid grid-cols-5 gap-2"
      >
        {swatches.map((hex, index) => {
          const tone = index + 1;
          const on = value === tone;
          return (
            <button
              key={hex}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${t("annotate.skinTone")} ${tone}`}
              onClick={() => onChange(tone)}
              className={`rounded-card flex flex-col items-center gap-1.5 border p-1.5 transition-colors ${
                on
                  ? "border-ink bg-ink text-on-dark"
                  : "border-ink/15 text-ink hover:border-ink/40 bg-white/40"
              }`}
            >
              <span
                className="border-ink/10 block h-12 w-full rounded-[7px] border"
                style={{ background: hex }}
              />
              <span className="tabular text-xs font-semibold">
                {tone}
                {suggested === tone && !on && (
                  <span className="sr-only"> ({t("annotate.suggested")})</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {suggested && (
        <p className="text-ink-55 mt-2 text-[13px]">
          {t("annotate.suggestedTone", { tone: suggested })}
        </p>
      )}
    </div>
  );
}
