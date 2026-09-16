import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SketchButton } from "~/components/contribute/Sketch";
import StepShell from "~/components/contribute/StepShell";
import {
  nextIncompletePhoto,
  useContribution,
} from "~/components/contribute/ContributionContext";
import { isHeic, readImageSize } from "~/lib/contribution";
import { loadSettings } from "~/lib/settings";
import { t } from "~/i18n";

let nextLocalId = 1;

export default function UploadStep() {
  const navigate = useNavigate();
  const { settings, submission, photos, imageUrl, addPhoto, removePhoto } =
    useContribution();
  const [items, setItems] = useState([]);
  const [notice, setNotice] = useState(null);
  const input = useRef(null);

  const limits = settings?.limits;
  const uploading = items.some((item) => item.status === "uploading");

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);

  const patch = (localId, changes) =>
    setItems((current) =>
      current.map((item) =>
        item.localId === localId ? { ...item, ...changes } : item
      )
    );

  const upload = async (item) => {
    patch(item.localId, { status: "uploading", progress: 0, error: null });
    try {
      const asset = await addPhoto(item.file, item.size, (progress) =>
        patch(item.localId, { progress })
      );
      patch(item.localId, { status: "done", assetId: asset.id, progress: 1 });
    } catch (error) {
      patch(item.localId, { status: "error", error: error.message });
    }
  };

  const onFiles = async (fileList) => {
    const { limits } = settings ?? (await loadSettings());
    const files = Array.from(fileList);
    const room =
      limits.max_photos_per_submission -
      photos.length -
      items.filter((i) => i.status !== "done").length;
    if (files.length > room)
      setNotice(t("upload.tooMany", { max: limits.max_photos_per_submission }));

    for (const file of files.slice(0, Math.max(room, 0))) {
      if (isHeic(file)) {
        setNotice(t("upload.heic"));
        continue;
      }
      if (
        !limits.accepted_content_types.includes(file.type) ||
        file.size > limits.max_file_bytes
      ) {
        setNotice(t("upload.unsupported", { name: file.name }));
        continue;
      }
      const size = await readImageSize(file);
      const short = size ? Math.min(size.width, size.height) : null;
      const item = {
        localId: nextLocalId++,
        file,
        size,
        url: URL.createObjectURL(file),
        status: "queued",
        progress: 0,
        warning:
          short && short < limits.min_short_side_px
            ? t("upload.tooSmall", { short })
            : null,
      };
      setItems((current) => [...current, item]);
      upload(item);
    }
    if (input.current) input.current.value = "";
  };

  const remove = async (item) => {
    if (item.assetId) await removePhoto(item.assetId);
    URL.revokeObjectURL(item.url);
    setItems((current) => current.filter((i) => i.localId !== item.localId));
  };

  const resumed = photos.filter(
    (asset) => !items.some((item) => item.assetId === asset.id)
  );
  const readyCount = photos.length;

  const proceed = () => {
    if (!submission?.permission_confirmed_at)
      return navigate("/contribute/permission");
    const next = nextIncompletePhoto(photos);
    return navigate(
      next === null
        ? "/contribute/review"
        : `/contribute/photos/${next + 1}/people`
    );
  };

  return (
    <StepShell
      back="/"
      label={t("contribute.steps.upload")}
      title={t("upload.heading")}
      intro={t("upload.intro")}
      footer={
        readyCount > 0 && (
          <SketchButton
            sketchKey="upload-continue"
            full
            state={uploading ? "loading" : "idle"}
            onClick={proceed}
            disabled={uploading}
          >
            {uploading ? t("upload.uploading") : t("common.continue")}
          </SketchButton>
        )
      }
    >
      <input
        ref={input}
        type="file"
        accept={
          limits?.accepted_content_types?.join(",") ??
          "image/jpeg,image/png,image/webp"
        }
        multiple
        className="hidden"
        onChange={(event) => onFiles(event.target.files)}
      />

      <SketchButton
        sketchKey="upload-pick"
        full
        size="lg"
        variant={readyCount > 0 ? "secondary" : "primary"}
        onClick={() => input.current?.click()}
        disabled={!limits}
      >
        <CameraIcon className="h-6 w-6" />
        {readyCount > 0 ? t("upload.addMore") : t("upload.cta")}
      </SketchButton>

      {notice && (
        <p
          role="status"
          className="rounded-card bg-surface text-ink mt-4 px-4 py-3 text-[14px] leading-snug"
        >
          {notice}
        </p>
      )}

      {(items.length > 0 || resumed.length > 0) && (
        <ul className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {resumed.map((asset) => (
            <Thumb
              key={`asset-${asset.id}`}
              src={imageUrl(asset)}
              onRemove={() => removePhoto(asset.id)}
            />
          ))}
          {items.map((item) => (
            <Thumb
              key={item.localId}
              src={item.url}
              progress={item.status === "uploading" ? item.progress : null}
              error={
                item.status === "error"
                  ? item.error || t("upload.failed")
                  : null
              }
              warning={item.warning}
              onRetry={item.status === "error" ? () => upload(item) : null}
              onRemove={() => remove(item)}
            />
          ))}
        </ul>
      )}

      {readyCount > 0 && (
        <p className="text-ink-60 mt-3 text-[14.5px]">
          {t("upload.count", { count: readyCount })}
        </p>
      )}

      <ul className="border-hairline text-ink-72 mt-8 space-y-2 border-t pt-6 text-[14.5px] leading-snug">
        <li>{t("upload.rules.people")}</li>
        <li>{t("upload.rules.samePerson")}</li>
        <li>{t("upload.rules.formats")}</li>
        <li>{t("upload.rules.noAi")}</li>
      </ul>
      <p className="mt-6 text-[14.5px]">
        <Link to="/about" className="text-accent hover:text-accent-hover">
          {t("upload.faq")}
        </Link>
      </p>
    </StepShell>
  );
}

function Thumb({
  src,
  progress = null,
  error = null,
  warning = null,
  onRetry,
  onRemove,
}) {
  return (
    <li className="rounded-card bg-surface relative aspect-square overflow-hidden">
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover ${error ? "opacity-40" : ""}`}
      />
      {progress !== null && (
        <div className="bg-ink/20 absolute inset-x-0 bottom-0 h-1.5">
          <div
            className="bg-accent h-full transition-[width]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
      {warning && !error && (
        <span
          className="bg-canvas/90 text-ink absolute top-1 left-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          title={warning}
        >
          !
        </span>
      )}
      {error && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-shell/60 absolute inset-0 flex items-center justify-center px-2 text-center text-[12px] font-semibold text-white"
        >
          {t("common.retry")}
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("common.remove")}
        className="bg-canvas/90 text-ink hover:bg-canvas absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </li>
  );
}
