import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "~/components/ui/Button";
import { Checkbox } from "~/components/ui/Field";
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
          {error && <p className="notice">{error}</p>}
          <Button
            full
            onClick={confirm}
            disabled={!adults || !permission || busy}
          >
            {t("permission.cta")}
          </Button>
        </>
      }
    >
      <div className="border-ink bg-surface space-y-5 border-2 p-5">
        <Checkbox checked={adults} onChange={setAdults}>
          {t("permission.adults")}
        </Checkbox>
        <Checkbox checked={permission} onChange={setPermission}>
          {t("permission.permission")}
        </Checkbox>
      </div>
    </StepShell>
  );
}
