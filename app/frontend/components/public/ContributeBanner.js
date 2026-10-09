import { Link } from "react-router-dom";
import iconNewPhoto from "~/images/icons/icon_new_photo.png";
import { t } from "~/i18n";

export default function ContributeBanner({ showQr = true }) {
  return (
    <section className="md:px-gutter mx-auto max-w-[1512px] px-4 pb-14">
      <div className="bg-ink text-cream border-ink shadow-hard-signal flex flex-col gap-8 border-2 px-6 py-7 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-8">
        <Link to="/contribute" className="group flex items-center gap-6">
          <img src={iconNewPhoto} alt="" className="h-22 w-22 shrink-0" />
          <span>
            <span className="display-caps block text-[clamp(30px,3.4vw,44px)] leading-[0.95] group-hover:underline">
              {t("dashboard.addYourPhotos")} <span aria-hidden="true">→</span>
            </span>
            <span className="text-peach mt-2 block text-[16px]">
              {t("dashboard.reviewedByPeople")}
            </span>
          </span>
        </Link>
        {showQr && (
          <div className="border-peach hidden items-center gap-6 md:flex md:border-l-2 md:pl-10">
            <img
              src="/qr.svg"
              alt=""
              className="bg-cream h-[104px] w-[104px] p-2"
              width="104"
              height="104"
            />
            <p className="mono-caps text-peach max-w-[190px] text-[12px] leading-relaxed">
              {t("dashboard.scanToAdd")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
