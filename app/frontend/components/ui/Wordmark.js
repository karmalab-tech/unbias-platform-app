import { t } from "~/i18n";

export default function Wordmark({
  className = "text-[17px] max-[359px]:text-[14px] md:text-[26px]",
}) {
  return (
    <span
      className={`display-caps flex flex-col leading-[0.95] tracking-[0.04em] ${className}`}
    >
      <span>{t("brand.line1")}</span>
      <span>{t("brand.line2")}</span>
    </span>
  );
}
