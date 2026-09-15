import { useEffect, useState } from "react";
import AdminShell, { inputClass } from "~/components/admin/AdminShell";
import Button from "~/components/ui/Button";
import { adminApi } from "~/lib/admin";
import { t } from "~/i18n";

const EMPTY = {
  caption_en: "",
  caption_fr: "",
  active: true,
  display_order: 0,
};

export default function AdminCallsToAction() {
  const [ctas, setCtas] = useState([]);
  const [draft, setDraft] = useState(EMPTY);
  const [error, setError] = useState(null);

  const load = () =>
    adminApi
      .ctas()
      .then(setCtas)
      .catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  const run = async (action) => {
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = (event) => {
    event.preventDefault();
    run(async () => {
      await adminApi.createCta({ ...draft, display_order: ctas.length });
      setDraft(EMPTY);
    });
  };

  return (
    <AdminShell title={t("admin.tabs.ctas")}>
      <p className="text-ink-60 mb-6 max-w-[65ch] text-[15px]">
        {t("admin.ctas.intro")}
      </p>
      {error && (
        <p className="rounded-card bg-surface text-accent mb-4 px-4 py-3 text-[14px]">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {ctas.map((cta) => (
          <li
            key={cta.id}
            className="rounded-card border-hairline-strong border p-4"
          >
            <CtaForm
              value={cta}
              onSave={(body) => run(() => adminApi.updateCta(cta.id, body))}
              onDelete={() => run(() => adminApi.deleteCta(cta.id))}
            />
          </li>
        ))}
      </ul>

      <form onSubmit={create} className="rounded-card bg-surface mt-8 p-4">
        <h2 className="font-display mb-3 text-[17px] font-bold tracking-[-0.01em]">
          {t("admin.ctas.add")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-ink-72 text-[13px] font-medium">
            {t("admin.ctas.captionEn")}
            <input
              required
              className={`${inputClass} mt-1 w-full`}
              value={draft.caption_en}
              onChange={(e) =>
                setDraft({ ...draft, caption_en: e.target.value })
              }
            />
          </label>
          <label className="text-ink-72 text-[13px] font-medium">
            {t("admin.ctas.captionFr")}
            <input
              className={`${inputClass} mt-1 w-full`}
              value={draft.caption_fr}
              onChange={(e) =>
                setDraft({ ...draft, caption_fr: e.target.value })
              }
            />
          </label>
        </div>
        <div className="mt-3">
          <Button type="submit" size="sm" variant="ink">
            {t("admin.ctas.create")}
          </Button>
        </div>
      </form>
    </AdminShell>
  );
}

function CtaForm({ value, onSave, onDelete }) {
  const [form, setForm] = useState(value);
  useEffect(() => setForm(value), [value]);
  const dirty = JSON.stringify(form) !== JSON.stringify(value);

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <input
        className={inputClass}
        value={form.caption_en}
        onChange={(e) => setForm({ ...form, caption_en: e.target.value })}
        aria-label={t("admin.ctas.captionEn")}
      />
      <input
        className={inputClass}
        value={form.caption_fr ?? ""}
        onChange={(e) => setForm({ ...form, caption_fr: e.target.value })}
        aria-label={t("admin.ctas.captionFr")}
        placeholder={t("admin.ctas.captionFr")}
      />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-[13.5px]">
          <input
            type="checkbox"
            className="accent-accent h-4 w-4"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          {t("admin.ctas.active")}
        </label>
        <input
          type="number"
          min="0"
          className={`${inputClass} w-16`}
          value={form.display_order}
          onChange={(e) =>
            setForm({ ...form, display_order: Number(e.target.value) })
          }
          aria-label={t("admin.ctas.order")}
        />
        <Button
          size="sm"
          variant="ink"
          disabled={!dirty}
          onClick={() => onSave(form)}
        >
          {t("common.save")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          {t("common.remove")}
        </Button>
      </div>
    </div>
  );
}
