import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SketchButton,
  SketchCard,
  SketchCheckbox,
} from "~/components/contribute/Sketch";
import StepShell from "~/components/contribute/StepShell";
import PhotoStack from "~/components/contribute/PhotoStack";
import {
  nextIncompletePhoto,
  useContribution,
} from "~/components/contribute/ContributionContext";
import { t } from "~/i18n";

export default function PermissionStep() {
  const navigate = useNavigate();
  const { confirmPermission, photos } = useContribution();
  const [adults, setAdults] = useState(false);
  const [permission, setPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await confirmPermission();
      const next = nextIncompletePhoto(photos);
      navigate(
        next === null
          ? "/contribute/review"
          : `/contribute/photos/${next + 1}/people`
      );
    } catch (err) {
      setError(err.message || t("errors.generic"));
      setBusy(false);
    }
  };

  return (
    <StepShell
      back="/contribute/upload"
      media={<PhotoStack />}
      label={t("contribute.steps.permission")}
      title={t("permission.heading")}
      intro={t("permission.intro")}
      footer={
        <>
          {error && <p className="text-accent text-[14px]">{error}</p>}
          <SketchButton
            sketchKey="permission-confirm"
            full
            state={busy ? "loading" : "idle"}
            onClick={confirm}
            disabled={!adults || !permission || busy}
          >
            {t("permission.cta")}
          </SketchButton>
        </>
      }
    >
      <SketchCard
        sketchKey="permission-panel"
        className="rounded-card bg-surface space-y-5 p-5"
      >
        <SketchCheckbox
          sketchKey="permission-adults"
          checked={adults}
          onChange={setAdults}
        >
          {t("permission.adults")}
        </SketchCheckbox>
        <SketchCheckbox
          sketchKey="permission-permission"
          checked={permission}
          onChange={setPermission}
        >
          {t("permission.permission")}
        </SketchCheckbox>
      </SketchCard>
    </StepShell>
  );
}
