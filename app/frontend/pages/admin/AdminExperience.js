import { useEffect, useState } from "react";
import AdminShell, { inputClass } from "~/components/admin/AdminShell";
import Button from "~/components/ui/Button";
import { adminApi } from "~/lib/admin";
import usePolling from "~/lib/usePolling";
import { formatNumber } from "~/lib/format";
import { useSettings } from "~/lib/settings";
import { t } from "~/i18n";

const STATUS_ORDER = [
  "succeeded",
  "outdated",
  "generating",
  "queued",
  "failed",
  "pending",
];

const STATUS_CLASS = {
  succeeded: "bg-ink",
  outdated: "bg-lime",
  generating: "hatch",
  queued: "bg-peach",
  failed: "bg-signal",
  pending: "bg-cream",
};

export default function AdminExperience() {
  const settings = useSettings();
  const [refresh, setRefresh] = useState(0);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState(null);
  const { data } = usePolling(
    `/api/admin/experience_prompts?r=${refresh}`,
    settings?.limits?.stats_poll_seconds ?? 5
  );

  const act = async (request) => {
    setError(null);
    try {
      await request();
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const prompts = data?.prompts ?? [];
  const perPrompt = data?.images_per_prompt ?? 0;
  const done = prompts.reduce((sum, p) => sum + p.counts.succeeded, 0);

  return (
    <AdminShell title={t("admin.tabs.experience")}>
      <p className="text-ink-60 mb-5 max-w-[65ch] text-[14.5px]">
        {t("admin.experience.intro", { count: perPrompt })}
      </p>
      {data && !data.configured && (
        <p className="notice mb-4">{t("admin.experience.notConfigured")}</p>
      )}
      {error && <p className="notice mb-4">{error}</p>}
      {data && (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="font-display tabular text-[28px] leading-none font-extrabold font-stretch-75%">
            {formatNumber(done)} / {formatNumber(prompts.length * perPrompt)}
            <span className="mono-caps text-ink-60 ml-3 text-[12px] font-bold">
              {t("admin.experience.images")}
            </span>
          </p>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => act(adminApi.generateAllExperience)}
          >
            {t("admin.experience.generateAll")}
          </Button>
        </div>
      )}
      <Legend />
      <ul className="divide-ink border-ink mt-4 divide-y-2 border-y-2">
        {prompts.map((prompt) => (
          <PromptRow
            key={prompt.id}
            prompt={prompt}
            perPrompt={perPrompt}
            open={open === prompt.id}
            onToggle={() => setOpen(open === prompt.id ? null : prompt.id)}
            onGenerate={() =>
              act(() => adminApi.generateExperiencePrompt(prompt.id))
            }
            refresh={refresh}
            onRegenerate={(id) =>
              act(() => adminApi.regenerateExperienceImage(id))
            }
            onSave={(body) =>
              act(() => adminApi.updateExperiencePrompt(prompt.id, body))
            }
          />
        ))}
      </ul>
    </AdminShell>
  );
}

function Legend() {
  return (
    <ul className="mono-caps flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold">
      {STATUS_ORDER.map((status) => (
        <li key={status} className="flex items-center gap-2">
          <span
            className={`border-ink h-3 w-3 border-2 ${STATUS_CLASS[status]}`}
          />
          {t(`admin.experience.status.${status}`)}
        </li>
      ))}
    </ul>
  );
}

function PromptRow({
  prompt,
  perPrompt,
  open,
  onToggle,
  onGenerate,
  onRegenerate,
  onSave,
  refresh,
}) {
  const { counts } = prompt;
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
  const notStarted = counts.pending + Math.max(0, perPrompt - total);
  const missing = notStarted + counts.failed + counts.outdated;
  const cells = STATUS_ORDER.flatMap((status) =>
    Array(status === "pending" ? notStarted : counts[status]).fill(status)
  );

  return (
    <li className="py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="min-w-0 flex-1 cursor-pointer text-left text-[14.5px] hover:underline"
          style={{ paddingLeft: `${prompt.depth * 18}px` }}
        >
          <span className="block">{prompt.prompt}</span>
          <span className="text-ink-55 block text-[13px]">
            {prompt.prompt_fr}
          </span>
        </button>
        <span className="flex gap-0.5" aria-hidden="true">
          {cells.map((status, index) => (
            <span
              key={index}
              className={`border-ink h-3 w-2 border ${STATUS_CLASS[status]}`}
            />
          ))}
        </span>
        <span className="mono-caps tabular w-14 text-right text-[12px] font-bold">
          {counts.succeeded}/{perPrompt}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={missing <= 0}
          onClick={onGenerate}
        >
          {counts.failed > 0
            ? t("admin.experience.retry")
            : counts.outdated > 0
              ? t("admin.experience.update")
              : t("admin.experience.generate")}
        </Button>
      </div>
      {open && (
        <PromptDetail
          id={prompt.id}
          refresh={refresh}
          onRegenerate={onRegenerate}
          onSave={onSave}
        />
      )}
    </li>
  );
}

function PromptDetail({ id, refresh, onRegenerate, onSave }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.experiencePrompt(id).then(setData);
  }, [id, refresh]);

  if (!data) return null;

  return (
    <div className="mt-3 flex flex-col gap-4">
      <Wording
        key={`${data.prompt}|${data.prompt_fr}`}
        data={data}
        onSave={onSave}
      />
      {data.images.length === 0 ? (
        <p className="text-ink-55 text-[13px]">
          {t("admin.experience.noImages")}
        </p>
      ) : (
        <Images images={data.images} onRegenerate={onRegenerate} />
      )}
    </div>
  );
}

function Wording({ data, onSave }) {
  const [prompt, setPrompt] = useState(data.prompt);
  const [promptFr, setPromptFr] = useState(data.prompt_fr);
  const changed = prompt !== data.prompt || promptFr !== data.prompt_fr;

  return (
    <form
      className="bg-surface border-ink flex flex-col gap-3 border-2 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ prompt, prompt_fr: promptFr });
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="mono-caps text-[11px] font-bold">
          {t("admin.experience.promptEn")}
        </span>
        <input
          className={inputClass}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="mono-caps text-[11px] font-bold">
          {t("admin.experience.promptFr")}
        </span>
        <input
          className={inputClass}
          value={promptFr}
          onChange={(event) => setPromptFr(event.target.value)}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" type="submit" disabled={!changed}>
          {t("common.save")}
        </Button>
        <p className="text-ink-55 text-[13px]">
          {t("admin.experience.wordingHint")}
        </p>
      </div>
    </form>
  );
}

function Images({ images, onRegenerate }) {
  return (
    <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {images.map((image) => (
        <li key={image.id} className="flex flex-col gap-1.5">
          <div
            className={`border-ink aspect-[3/4] border-2 ${image.url ? "" : STATUS_CLASS[image.status]}`}
          >
            {image.url && (
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <p className="mono-caps text-[10px] font-bold">
            {String(image.position).padStart(2, "0")} ·{" "}
            {t(
              `admin.experience.status.${image.outdated ? "outdated" : image.status}`
            )}
          </p>
          {image.error && (
            <p
              className="text-ink-60 line-clamp-3 text-[11px]"
              title={image.error}
            >
              {image.error}
            </p>
          )}
          {(image.status === "succeeded" || image.status === "failed") && (
            <button
              type="button"
              onClick={() => onRegenerate(image.id)}
              className="mono-caps hover:bg-lime cursor-pointer self-start text-[10px] underline underline-offset-4"
            >
              {t("admin.experience.regenerate")}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
