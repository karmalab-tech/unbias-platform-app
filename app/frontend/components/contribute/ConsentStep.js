import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SketchButton,
  SketchCard,
  SketchCheckbox,
} from "~/components/contribute/Sketch";
import StepShell from "~/components/contribute/StepShell";
import PhotoStack from "~/components/contribute/PhotoStack";
import { useContribution } from "~/components/contribute/ContributionContext";
import { t } from "~/i18n";

export default function ConsentStep() {
  const navigate = useNavigate();
  const { settings, submission, saveConsent, submit } = useContribution();
  const [training, setTraining] = useState(
    submission?.consent?.training_allowed ?? false
  );
  const [display, setDisplay] = useState(
    submission?.consent?.public_display_allowed ?? false
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await saveConsent({
        training_allowed: training,
        public_display_allowed: display,
      });
      await submit();
      navigate("/contribute/done", { replace: true });
    } catch (err) {
      setError(err.message || t("errors.generic"));
      setBusy(false);
    }
  };

  return (
    <StepShell
      back="/contribute/review"
      media={<PhotoStack />}
      label={t("contribute.steps.consent")}
      title={t("consent.heading")}
      intro={t("consent.intro")}
      footer={
        <>
          {error && <p className="text-accent text-[14px]">{error}</p>}
          <SketchButton
            sketchKey="consent-submit"
            full
            state={busy ? "loading" : error ? "error" : "idle"}
            onClick={send}
            disabled={!training || busy}
          >
            {busy ? t("consent.submitting") : t("consent.cta")}
          </SketchButton>
        </>
      }
    >
      <div className="space-y-6">
        <SketchCard
          sketchKey="consent-training-panel"
          className="rounded-card bg-surface p-5"
        >
          <p className="text-ink-55 mb-3 text-[12px] font-semibold tracking-[0.15em] uppercase">
            {t("consent.trainingRequired")}
          </p>
          <SketchCheckbox
            sketchKey="consent-training"
            checked={training}
            onChange={setTraining}
            required
          >
            {t("consent.training")}
          </SketchCheckbox>
        </SketchCard>
        <SketchCard
          sketchKey="consent-display-panel"
          className="rounded-card bg-surface p-5"
        >
          <p className="text-ink-55 mb-3 text-[12px] font-semibold tracking-[0.15em] uppercase">
            {t("consent.displayOptional")}
          </p>
          <SketchCheckbox
            sketchKey="consent-display"
            checked={display}
            onChange={setDisplay}
          >
            {t("consent.display")}
          </SketchCheckbox>
        </SketchCard>
        <p className="text-ink-55 text-[13px] leading-snug">
          {t("consent.legal", { version: settings?.consent_version ?? "" })}
        </p>
      </div>
    </StepShell>
  );
}
