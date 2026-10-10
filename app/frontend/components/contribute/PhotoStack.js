import { useContribution } from "~/components/contribute/ContributionContext";
import { t } from "~/i18n";

const MAX_VISIBLE = 5;

// Deterministic so the pile never reshuffles between renders.
const TILT = [-1.5, 7, -8, 13, -14];
const SHIFT = [0, 24, -26, 46, -48];

// The batch as a pile of paper prints, shown above the consent questions.
export default function PhotoStack() {
  const { photos, imageUrl } = useContribution();
  if (photos.length === 0) return null;

  const visible = photos.slice(0, MAX_VISIBLE);

  return (
    <figure className="flex flex-col items-center">
      <div className="relative h-[186px] w-full" aria-hidden="true">
        {visible.map((asset, index) => (
          <div
            key={asset.id}
            className="border-ink bg-canvas shadow-hard-sm absolute top-1 left-1/2 border-2 p-2"
            style={{
              transform: `translateX(calc(-50% + ${SHIFT[index]}px)) rotate(${TILT[index]}deg)`,
              zIndex: visible.length - index,
            }}
          >
            <img
              src={imageUrl(asset)}
              alt=""
              className="bg-surface h-[128px] w-[104px] object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <figcaption className="text-ink-55 tabular mt-2 text-[13px] font-medium">
        {t("common.photos", { count: photos.length })}
      </figcaption>
    </figure>
  );
}
