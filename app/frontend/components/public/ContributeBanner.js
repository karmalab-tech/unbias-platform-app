import { Link } from "react-router-dom";
import { CameraIcon } from "@heroicons/react/24/outline";
import { t } from "~/i18n";

export default function ContributeBanner({ showQr = true }) {
  return (
    <section className="md:px-gutter mx-auto max-w-[1512px] px-5 pb-12">
      <div className="rounded-banner bg-surface-warm flex flex-col gap-8 px-6 py-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-[44px] md:py-[34px]">
        <Link to="/contribute" className="flex items-center gap-[26px]">
          <span className="bg-accent flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-white">
            <CameraIcon className="h-[34px] w-[34px]" strokeWidth={1.5} />
          </span>
          <span>
            <span className="font-display block text-[clamp(26px,3vw,33px)] leading-none font-bold tracking-[-0.03em]">
              {t("dashboard.addYourPhotos")}
            </span>
            <span className="text-ink-60 mt-1.5 block text-[15.5px]">
              {t("dashboard.reviewedByPeople")}
            </span>
          </span>
        </Link>
        {showQr && (
          <div className="border-hairline-strong hidden items-center gap-[22px] md:flex md:border-l md:pl-[44px]">
            <img
              src="/qr.svg"
              alt=""
              className="rounded-qr h-[94px] w-[94px]"
              width="94"
              height="94"
            />
            <p className="max-w-[170px] text-[17px] leading-[1.35] font-medium">
              {t("dashboard.scanToAdd")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
