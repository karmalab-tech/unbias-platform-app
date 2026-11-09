import { useEffect, useRef, useState } from "react";
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
  uploaded: "bg-ink",
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
            onClear={(id) => act(() => adminApi.clearExperienceImage(id))}
            onChanged={() => setRefresh((n) => n + 1)}
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
  onClear,
  onChanged,
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
          perPrompt={perPrompt}
          onRegenerate={onRegenerate}
          onSave={onSave}
          onClear={onClear}
          onChanged={onChanged}
        />
      )}
    </li>
  );
}

function PromptDetail({
  id,
  perPrompt,
  refresh,
  onRegenerate,
  onSave,
  onClear,
  onChanged,
}) {
  const settings = useSettings();
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.experiencePrompt(id).then(setData);
  }, [id, refresh]);

  // One request per file, in order; the server picks the next free spot unless a spot is given.
  const uploadFiles = async (files, position) => {
    const list = [...files].slice(0, position ? 1 : undefined);
    if (list.length === 0) return;
    setError(null);
    for (const [index, file] of list.entries()) {
      setProgress({ done: index, total: list.length });
      try {
        await adminApi.uploadExperienceImage(id, file, position);
      } catch (err) {
        setError(uploadError(err, file, list.length - index));
        break;
      }
    }
    setProgress(null);
    onChanged();
  };

  if (!data) return null;

  return (
    <div className="mt-3 flex flex-col gap-4">
      <Wording
        key={`${data.prompt}|${data.prompt_fr}`}
        data={data}
        onSave={onSave}
      />
      <DropZone
        free={data.free_positions.length}
        accept={settings?.limits?.accepted_content_types}
        progress={progress}
        onFiles={(files) => uploadFiles(files)}
      />
      {error && <p className="notice">{error}</p>}
      <Images
        images={data.images}
        perPrompt={perPrompt}
        busy={progress !== null}
        onDropFile={(files, position) => uploadFiles(files, position)}
        onRegenerate={onRegenerate}
        onClear={onClear}
      />
    </div>
  );
}

function uploadError(err, file, remaining) {
  const reason = t(`admin.experience.uploadErrors.${err.message}`);
  return t("admin.experience.uploadFailed", {
    name: file.name,
    reason: reason.startsWith("admin.") ? err.message : reason,
    count: remaining,
  });
}

function filesFrom(event) {
  event.preventDefault();
  return event.dataTransfer?.files ?? [];
}

function DropZone({ free, accept, progress, onFiles }) {
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        setOver(false);
        onFiles(filesFrom(event));
      }}
      className={`border-ink flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-dashed p-4 ${over ? "bg-lime" : ""}`}
    >
      <p className="mono-caps text-[12px] font-bold">
        {progress
          ? t("admin.experience.uploading", {
              done: progress.done + 1,
              total: progress.total,
            })
          : t("admin.experience.dropHere")}
      </p>
      <Button
        size="sm"
        variant="secondary"
        disabled={progress !== null || free === 0}
        onClick={() => inputRef.current?.click()}
      >
        {t("admin.experience.chooseFiles")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept?.join(",")}
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <p className="text-ink-60 w-full text-[13px]">
        {t("admin.experience.dropHint", { count: free })}
      </p>
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

function Images({
  images,
  perPrompt,
  busy,
  onDropFile,
  onRegenerate,
  onClear,
}) {
  const byPosition = new Map(images.map((image) => [image.position, image]));
  return (
    <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {Array.from({ length: perPrompt }, (_, index) => (
        <Slot
          key={index}
          position={index + 1}
          image={byPosition.get(index + 1)}
          busy={busy}
          onDropFile={onDropFile}
          onRegenerate={onRegenerate}
          onClear={onClear}
        />
      ))}
    </ul>
  );
}

function slotLabel(image) {
  if (!image) return "pending";
  if (image.outdated) return "outdated";
  if (image.status === "succeeded" && image.source === "uploaded") {
    return "uploaded";
  }
  return image.status;
}

function Slot({ position, image, busy, onDropFile, onRegenerate, onClear }) {
  const [over, setOver] = useState(false);
  const status = slotLabel(image);
  const action =
    "mono-caps hover:bg-lime cursor-pointer self-start text-[10px] underline underline-offset-4";

  return (
    <li className="flex flex-col gap-1.5">
      <div
        title={t("admin.experience.dropOnSlot")}
        onDragOver={(event) => {
          if (busy) return;
          event.preventDefault();
          event.stopPropagation();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.stopPropagation();
          setOver(false);
          onDropFile(filesFrom(event), position);
        }}
        className={`border-ink aspect-[3/4] border-2 ${over ? "bg-lime outline-signal outline-2" : image?.url ? "" : STATUS_CLASS[status] || STATUS_CLASS.pending}`}
      >
        {image?.url && !over && (
          <img src={image.url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <p className="mono-caps text-[10px] font-bold">
        {String(position).padStart(2, "0")} ·{" "}
        {t(`admin.experience.status.${status}`)}
      </p>
      {image?.error && (
        <p className="text-ink-60 line-clamp-3 text-[11px]" title={image.error}>
          {image.error}
        </p>
      )}
      {image && (image.status === "succeeded" || image.status === "failed") && (
        <div className="flex flex-wrap gap-x-3">
          <button
            type="button"
            onClick={() => onRegenerate(image.id)}
            className={action}
          >
            {t("admin.experience.regenerate")}
          </button>
          <button
            type="button"
            onClick={() => onClear(image.id)}
            className={action}
          >
            {t("admin.experience.remove")}
          </button>
        </div>
      )}
    </li>
  );
}
