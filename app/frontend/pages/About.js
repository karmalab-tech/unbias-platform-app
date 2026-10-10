import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PublicHeader from "~/components/public/PublicHeader";
import PublicFooter from "~/components/public/PublicFooter";
import Button from "~/components/ui/Button";
import usePolling from "~/lib/usePolling";
import { formatNumber } from "~/lib/format";
import { t } from "~/i18n";

const STEPS = ["upload", "identify", "describe", "consent", "review"];
const FAQ = [
  "account",
  "photos",
  "monk",
  "public",
  "ai",
  "withdraw",
  "boost",
  "who",
];

export default function About() {
  const { hash } = useLocation();
  const { data: stats } = usePolling("/api/public/stats", 30);
  const boost = stats?.launch_boost;

  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView();
  }, [hash, stats]);

  return (
    <div className="bg-canvas text-ink min-h-dvh">
      <PublicHeader hasVideo={false} />
      <main className="md:px-gutter mx-auto max-w-3xl px-5 pt-12 pb-20">
        <h1 className="display-caps text-[46px] leading-[0.95]">
          {t("about.title")}
        </h1>
        <p className="text-ink-72 mt-6 max-w-[65ch] text-[17px] leading-[1.55]">
          {t("about.intro")}
        </p>
        <p className="text-ink-72 mt-4 max-w-[65ch] text-[17px] leading-[1.55]">
          {t("about.loop")}
        </p>

        <section className="mt-14">
          <h2 className="display-caps text-[34px] leading-[0.95]">
            {t("about.howTitle")}
          </h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step} className="border-ink bg-surface border-2 p-5">
                <span className="font-display text-ink-45 tabular text-[13px] font-extrabold font-stretch-75%">
                  0{index + 1}
                </span>
                <h3 className="mt-1 text-[19px] leading-[1.25] font-bold">
                  {t(`about.steps.${step}.title`)}
                </h3>
                <p className="text-ink-60 mt-1.5 text-[14.5px] leading-snug">
                  {t(`about.steps.${step}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="display-caps text-[34px] leading-[0.95]">
            {t("about.privacyTitle")}
          </h2>
          <ul className="text-ink-72 mt-5 space-y-3 text-[16px] leading-[1.5]">
            {["private", "aggregate", "consent", "human", "code"].map((key) => (
              <li key={key} className="flex gap-3">
                <span className="bg-ink mt-[11px] h-1.5 w-1.5 shrink-0" />
                {t(`about.privacy.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" className="mt-14 scroll-mt-8">
          <h2 className="display-caps text-[34px] leading-[0.95]">
            {t("footer.faq")}
          </h2>
          <dl className="divide-ink mt-5 divide-y-2">
            {FAQ.map((key) => (
              <div key={key} id={`faq-${key}`} className="scroll-mt-8 py-5">
                <dt className="text-[19px] leading-[1.25] font-bold">
                  {t(`about.faq.${key}.q`)}
                </dt>
                <dd className="text-ink-72 mt-2 max-w-[65ch] text-[15.5px] leading-[1.55]">
                  {key === "boost"
                    ? boostAnswer(boost)
                    : key === "who"
                      ? whoAnswer()
                      : t(`about.faq.${key}.a`)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <Button size="lg" to="/contribute">
            {t("home.upload")}
          </Button>
          <a
            href="mailto:start@karmalab.tech"
            className="text-ink hover:bg-lime text-[15px] font-medium underline underline-offset-4"
          >
            start@karmalab.tech
          </a>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function whoAnswer() {
  const [before, after] = t("about.faq.who.a").split("{karmalab}");
  return (
    <>
      {before}
      <a
        href="https://www.karmalab.tech"
        target="_blank"
        rel="noreferrer"
        className="text-ink hover:bg-lime font-medium underline underline-offset-4"
      >
        KarmaLab
      </a>
      {after}
    </>
  );
}

function boostAnswer(boost) {
  if (!boost) return t("about.faq.boost.loading");
  const key = boost.active ? "a" : "over";
  return t(`about.faq.boost.${key}`, {
    realPhotos: formatNumber(boost.photos.real),
    addedPhotos: formatNumber(boost.photos.added),
    shownPhotos: formatNumber(boost.photos.shown),
    realPeople: formatNumber(boost.people_approved.real),
    addedPeople: formatNumber(boost.people_approved.added),
    shownPeople: formatNumber(boost.people_approved.shown),
    until: formatNumber(boost.until),
  });
}
