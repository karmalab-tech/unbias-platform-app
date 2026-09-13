import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "~/components/ui/Button";
import StepShell from "~/components/contribute/StepShell";
import PhotoWithMarkers from "~/components/contribute/PhotoWithMarkers";
import { useContribution } from "~/components/contribute/ContributionContext";
import usePhoto from "~/components/contribute/usePhoto";
import { t } from "~/i18n";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// A tap becomes a small region around the point: enough to keep labels attached to the right person.
export function regionAround(point, w = 0.24, h = 0.32) {
  return {
    x: clamp(point.x - w / 2, 0, 1 - w),
    y: clamp(point.y - h / 2, 0, 1 - h),
    w,
    h,
  };
}

export default function PeopleStep() {
  const navigate = useNavigate();
  const { settings, imageUrl, savePeople, removePhoto } = useContribution();
  const { photos, photoIndex, asset, fromReview } = usePhoto();
  const [people, setPeople] = useState(asset?.people ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPeople(asset?.people ?? []);
  }, [asset?.id]);

  if (!asset) return <Navigate to="/contribute/upload" replace />;

  const max = settings?.limits?.max_people_per_photo ?? 4;
  const tooMany = people.length > max;
  const suffix = fromReview ? "?from=review" : "";

  const add = (point) => {
    if (people.length >= max) return;
    setPeople((current) => [
      ...current,
      {
        detection_region: regionAround(point),
        detection_source: "manual",
        disability_tags: [],
      },
    ]);
  };

  const remove = (index) =>
    setPeople((current) => current.filter((_, i) => i !== index));

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await savePeople(asset.id, people, true);
      navigate(`/contribute/photos/${photoIndex + 1}/people/1${suffix}`);
    } catch (err) {
      setError(err.message || t("errors.generic"));
      setBusy(false);
    }
  };

  const removeThisPhoto = async () => {
    setBusy(true);
    try {
      await removePhoto(asset.id);
      const remaining = photos.length - 1;
      if (remaining === 0) navigate("/contribute/upload");
      else if (fromReview) navigate("/contribute/review");
      else
        navigate(
          `/contribute/photos/${Math.min(photoIndex + 1, remaining)}/people`
        );
    } finally {
      setBusy(false);
    }
  };

  return (
    <StepShell
      back={
        fromReview
          ? "/contribute/review"
          : photoIndex === 0
            ? "/contribute/upload"
            : undefined
      }
      label={t("contribute.progress", {
        photo: photoIndex + 1,
        photos: photos.length,
      })}
      title={t("people.heading")}
      intro={t("people.selected", { count: people.length })}
      footer={
        <>
          {error && <p className="text-accent text-[14px]">{error}</p>}
          {tooMany && (
            <p className="text-accent text-[14px]">
              {t("people.tooMany", { max })}
            </p>
          )}
          <Button
            full
            onClick={confirm}
            disabled={busy || people.length === 0 || tooMany}
          >
            {people.length === 0
              ? t("people.confirm")
              : t("people.confirmCount", { count: people.length })}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeThisPhoto}
            disabled={busy}
          >
            {t("people.removePhoto")}
          </Button>
        </>
      }
    >
      <PhotoWithMarkers
        src={imageUrl(asset)}
        people={people}
        onAdd={add}
        onRemove={remove}
      />
      <p className="text-ink-60 mt-4 text-[14.5px] leading-snug">
        {t("people.manualHint")} {t("people.background")}
      </p>
    </StepShell>
  );
}
