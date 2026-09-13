import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "~/components/ui/Button";
import { Checkbox } from "~/components/ui/Field";
import StepShell from "~/components/contribute/StepShell";
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
      label={t("contribute.steps.consent")}
      title={t("consent.heading")}
      intro={t("consent.intro")}
      footer={
        <>
          {error && <p className="text-accent text-[14px]">{error}</p>}
          <Button full onClick={send} disabled={!training || busy}>
            {busy ? t("consent.submitting") : t("consent.cta")}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="rounded-card bg-surface p-5">
          <p className="text-ink-55 mb-3 text-[12px] font-semibold tracking-[0.15em] uppercase">
            {t("consent.trainingRequired")}
          </p>
          <Checkbox checked={training} onChange={setTraining} required>
            {t("consent.training")}
          </Checkbox>
        </div>
        <div className="rounded-card bg-surface p-5">
          <p className="text-ink-55 mb-3 text-[12px] font-semibold tracking-[0.15em] uppercase">
            {t("consent.displayOptional")}
          </p>
          <Checkbox checked={display} onChange={setDisplay}>
            {t("consent.display")}
          </Checkbox>
        </div>
        <p className="text-ink-55 text-[13px] leading-snug">
          {t("consent.legal", { version: settings?.consent_version ?? "" })}
        </p>
      </div>
    </StepShell>
  );
}
