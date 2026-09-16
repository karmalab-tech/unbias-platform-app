import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { SketchButton } from "~/components/contribute/Sketch";
import ChoiceGrid from "~/components/ui/Choice";
import MonkScale from "~/components/ui/MonkScale";
import { BodySilhouette } from "~/components/ui/Silhouettes";
import StepShell from "~/components/contribute/StepShell";
import PhotoWithMarkers from "~/components/contribute/PhotoWithMarkers";
import PhotoLightbox from "~/components/contribute/PhotoLightbox";
import {
  nextIncompletePhoto,
  useContribution,
} from "~/components/contribute/ContributionContext";
import usePhoto from "~/components/contribute/usePhoto";
import useStuck from "~/lib/useStuck";
import { t } from "~/i18n";

const REQUIRED = ["age_bucket", "skin_tone_confirmed", "gender", "body"];
const ORDER = [...REQUIRED, "disability_tags"];
const HEADER_HEIGHT = 56;

const answered = (draft, field) =>
  Array.isArray(draft[field])
    ? draft[field].length > 0
    : draft[field] !== null && draft[field] !== undefined;

const options = (dimension, values) =>
  values.map((value) => ({
    value,
    label: t(`taxonomy.${dimension}.${value}`),
  }));

export default function AnnotationStep() {
  const navigate = useNavigate();
  const { settings, imageUrl, savePeople } = useContribution();
  const { photos, photoIndex, personIndex, asset, fromReview } = usePhoto();
  const [sentinel, stuck] = useStuck(HEADER_HEIGHT);
  const [zoomed, setZoomed] = useState(false);
  const [draft, setDraft] = useState(asset?.people?.[personIndex] ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setDraft(asset?.people?.[personIndex] ?? null);
  }, [asset?.id, personIndex]);

  const taxonomy = settings?.taxonomy;
  const choices = useMemo(
    () =>
      taxonomy && {
        age: options("age", taxonomy.age),
        gender: options("gender", taxonomy.gender),
        body: options("body", taxonomy.body),
        disability: taxonomy.disability.map((value) => ({
          value,
          label: t(
            `taxonomy.disability.${value === "other" ? "otherShort" : value}`
          ),
        })),
      },
    [taxonomy]
  );

  if (!asset || !asset.people?.[personIndex]) {
    return (
      <Navigate to={`/contribute/photos/${photoIndex + 1}/people`} replace />
    );
  }
  if (!draft || !choices) return null;

  const people = asset.people;
  const complete = REQUIRED.every(
    (field) => draft[field] !== null && draft[field] !== undefined
  );
  const lastPerson = personIndex === people.length - 1;
  // Questions past the one being answered stay dimmed, so the current one carries the focus.
  const current = ORDER.findIndex((field) => !answered(draft, field));
  const dimmed = (field) =>
    ORDER.indexOf(field) > current && !answered(draft, field);
  const set = (field) => (value) =>
    setDraft((current) => ({ ...current, [field]: value }));
  const suffix = fromReview ? "?from=review" : "";

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = people.map((person, i) =>
        i === personIndex ? draft : person
      );
      const saved = await savePeople(asset.id, updated, true);
      if (!lastPerson) {
        navigate(
          `/contribute/photos/${photoIndex + 1}/people/${personIndex + 2}${suffix}`
        );
        return;
      }
      const nextPhotos = photos.map((p) => (p.id === saved.id ? saved : p));
      const next = fromReview
        ? null
        : nextIncompletePhoto(nextPhotos, photoIndex);
      navigate(
        next === null
          ? "/contribute/review"
          : `/contribute/photos/${next + 1}/people`
      );
    } catch (err) {
      setError(err.message || t("errors.generic"));
    } finally {
      setBusy(false);
    }
  };

  const cta = lastPerson ? t("annotate.finishPhoto") : t("annotate.nextPerson");

  return (
    <StepShell
      back={
        personIndex === 0
          ? `/contribute/photos/${photoIndex + 1}/people${suffix}`
          : `/contribute/photos/${photoIndex + 1}/people/${personIndex}${suffix}`
      }
      label={t("contribute.progressPerson", {
        photo: photoIndex + 1,
        photos: photos.length,
        person: personIndex + 1,
        people: people.length,
      })}
      footer={
        <>
          {error && <p className="text-accent text-[14px]">{error}</p>}
          {!complete && (
            <p className="text-ink-55 text-[13px]">{t("annotate.required")}</p>
          )}
          <SketchButton
            sketchKey="annotate-save"
            full
            state={busy ? "loading" : "idle"}
            onClick={save}
            disabled={!complete || busy}
          >
            {cta}
          </SketchButton>
        </>
      }
    >
      <div ref={sentinel} aria-hidden="true" />
      <div
        className={`bg-canvas sticky top-14 z-[5] -mx-4 px-4 pt-2 pb-3 ${
          stuck ? "border-hairline border-b" : ""
        }`}
      >
        <PhotoWithMarkers
          src={imageUrl(asset)}
          people={people}
          selected={personIndex}
          onOpen={() => setZoomed(true)}
          imageClass={`transition-[max-height] duration-300 ${
            stuck ? "max-h-[22vh]" : "max-h-[40vh]"
          }`}
        />
      </div>
      <PhotoLightbox
        src={imageUrl(asset)}
        open={zoomed}
        onClose={() => setZoomed(false)}
      />

      <h1 className="font-display mt-6 text-[30px] leading-[1.05] font-bold tracking-[-0.025em]">
        {t("annotate.heading", { n: personIndex + 1 })}
      </h1>
      {personIndex === 0 && photoIndex === 0 && (
        <p className="text-ink-60 mt-2 text-[15.5px] leading-[1.5]">
          {t("annotate.intro")}
        </p>
      )}

      <div className="mt-6 space-y-8">
        <Section title={t("annotate.age")} dimmed={dimmed("age_bucket")}>
          <ChoiceGrid
            options={choices.age}
            value={draft.age_bucket}
            onChange={set("age_bucket")}
            columns={3}
          />
        </Section>

        <Section
          title={t("annotate.skinTone")}
          hint={t("annotate.skinToneHint")}
          dimmed={dimmed("skin_tone_confirmed")}
        >
          <MonkScale
            swatches={taxonomy.monk_swatches}
            value={draft.skin_tone_confirmed}
            suggested={draft.skin_tone_auto}
            onChange={set("skin_tone_confirmed")}
          />
        </Section>

        <Section title={t("annotate.gender")} dimmed={dimmed("gender")}>
          <ChoiceGrid
            options={choices.gender}
            value={draft.gender}
            onChange={set("gender")}
          />
        </Section>

        <Section title={t("annotate.body")} dimmed={dimmed("body")}>
          <ChoiceGrid
            options={choices.body}
            value={draft.body}
            onChange={set("body")}
            renderOption={(option) => (
              <>
                <BodySilhouette
                  body={option.value}
                  className="h-10 w-5 shrink-0"
                />
                <span>{option.label}</span>
              </>
            )}
          />
        </Section>

        <Section
          title={t("annotate.disability")}
          hint={t("annotate.disabilityHint")}
          dimmed={dimmed("disability_tags")}
        >
          <ChoiceGrid
            options={choices.disability}
            value={draft.disability_tags ?? []}
            onChange={set("disability_tags")}
            multiple
          />
        </Section>
      </div>
    </StepShell>
  );
}

function Section({ title, hint, dimmed = false, children }) {
  return (
    <section
      className={`transition-opacity duration-300 ${
        dimmed ? "opacity-40 focus-within:opacity-100 hover:opacity-100" : ""
      }`}
    >
      <h2 className="font-display text-[17px] font-bold tracking-[-0.01em]">
        {title}
      </h2>
      {hint && <p className="text-ink-55 mt-1 mb-3 text-[13px]">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </section>
  );
}
