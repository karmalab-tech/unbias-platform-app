import { Link, useNavigate } from "react-router-dom";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "~/components/ui/Button";
import StepShell from "~/components/contribute/StepShell";
import { useContribution } from "~/components/contribute/ContributionContext";
import { t } from "~/i18n";

export default function ReviewStep() {
  const navigate = useNavigate();
  const { photos, imageUrl } = useContribution();
  const allComplete =
    photos.length > 0 && photos.every((asset) => asset.complete);

  return (
    <StepShell
      back="/contribute/upload"
      label={t("contribute.steps.review")}
      title={t("review.heading")}
      intro={t("review.intro")}
      wide
      footer={
        <Button
          full
          onClick={() => navigate("/contribute/consent")}
          disabled={!allComplete}
        >
          {t("review.cta")}
        </Button>
      }
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((asset, index) => (
          <li key={asset.id}>
            <Link
              to={`/contribute/photos/${index + 1}/people?from=review`}
              className="rounded-card bg-surface focus-visible:outline-accent block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <div className="relative aspect-[4/5]">
                <img
                  src={imageUrl(asset)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-semibold ${
                    asset.complete
                      ? "bg-ink text-canvas"
                      : "bg-accent text-white"
                  }`}
                >
                  {asset.complete && <CheckIcon className="h-3.5 w-3.5" />}
                  {asset.complete
                    ? t("review.complete")
                    : t("review.incomplete")}
                </span>
              </div>
              <p className="text-ink-72 tabular px-3 py-2 text-[13px] font-medium">
                {t("review.peopleCount", { count: asset.people?.length ?? 0 })}
              </p>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/contribute/upload"
            className="rounded-card border-ink/25 text-ink-72 hover:border-ink/50 flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed text-[14px] font-medium"
          >
            <PlusIcon className="h-7 w-7" />
            {t("review.addPhotos")}
          </Link>
        </li>
      </ul>
    </StepShell>
  );
}
