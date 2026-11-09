import { useEffect, useRef, useState } from "react";
import Button from "~/components/ui/Button";
import FlipGrid, { WAVE_TOTAL_MS } from "~/components/experience/FlipGrid";
import {
  IMAGES_PER_PROMPT,
  STEPS,
  imageUrls,
  nextStep,
  nodeId,
  promptSegments,
  promptText,
  suggestions,
} from "~/lib/experience";
import { loadSettings, useSettings } from "~/lib/settings";
import { locale, t } from "~/i18n";

const PRELOAD_TIMEOUT_MS = 4000;
const MIN_RUN_MS = 450;

function preload(urls) {
  const loads = Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = resolve;
          image.onerror = resolve;
          image.src = url;
        })
    )
  );
  const timeout = new Promise((resolve) =>
    setTimeout(resolve, PRELOAD_TIMEOUT_MS)
  );
  const minimum = new Promise((resolve) => setTimeout(resolve, MIN_RUN_MS));
  return Promise.all([Promise.race([loads, timeout]), minimum]);
}

// Prompt on the left, its twenty pre-generated results on the right; each choice adds one detail.
export default function BiasExperience({ presentation = false }) {
  const settings = useSettings();
  const [selection, setSelection] = useState(null);
  const [urls, setUrls] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef(null);
  const runRef = useRef(0);

  const run = async (next) => {
    if (busy) return;
    const runId = ++runRef.current;
    setBusy(true);
    setPending(next);
    const loaded = await loadSettings();
    const nextUrls = imageUrls(next, loaded.experience_images_url);
    await preload(nextUrls);
    if (runId !== runRef.current) return;
    setSelection(next);
    setUrls(nextUrls);
    setPending(null);
    setTimeout(() => {
      if (runId === runRef.current) setBusy(false);
    }, WAVE_TOTAL_MS);
  };

  const restart = () => {
    runRef.current += 1;
    setSelection(null);
    setUrls(null);
    setPending(null);
    setBusy(false);
  };

  const idleSeconds = settings?.limits?.experience_idle_seconds;
  useEffect(() => {
    if (!presentation || selection === null || !idleSeconds) return;
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(restart, idleSeconds * 1000);
    };
    arm();
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [presentation, selection, idleSeconds]);

  useEffect(() => {
    const panel = panelRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [selection, pending]);

  const started = selection !== null;
  const step = started ? nextStep(selection) : null;
  const finished = started && !step;
  const options = started ? suggestions(selection) : [[]];
  const history = started
    ? Array.from({ length: selection.length + 1 }, (_, depth) =>
        selection.slice(0, depth)
      )
    : [];
  const stage = !started ? "start" : finished ? "end" : step.key;

  return (
    <section
      className={`md:px-gutter mx-auto grid w-full max-w-[1900px] gap-6 px-4 py-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(360px,1fr)_minmax(0,1.8fr)] lg:gap-10 ${presentation ? "lg:py-10" : ""}`}
    >
      <div
        ref={panelRef}
        className="flex min-h-0 flex-col lg:overflow-y-auto lg:pr-2"
      >
        <p className="mono-caps text-ink-60 text-[12px] font-bold">
          {finished
            ? t("experience.done")
            : t("experience.stepOf", {
                step: started ? selection.length + 2 : 1,
                total: STEPS.length + 1,
              })}
        </p>
        <h1
          className={`display-caps mt-2 leading-[0.95] ${presentation ? "text-[clamp(34px,3vw,52px)]" : "text-[clamp(30px,2.6vw,44px)]"}`}
        >
          {t(`experience.stages.${stage}.title`)}
        </h1>
        <p className="text-ink-72 mt-3 max-w-[46ch] text-[16px] leading-[1.5] lg:text-[17px]">
          {t(`experience.stages.${stage}.hint`)}
        </p>

        {history.length > 0 && (
          <ol className="mt-6 flex flex-col gap-2">
            {history.map((entry, depth) => {
              const current = depth === history.length - 1;
              return (
                <li key={nodeId(entry)}>
                  <button
                    type="button"
                    disabled={current || busy}
                    aria-current={current ? "step" : undefined}
                    title={current ? undefined : t("experience.backTo")}
                    onClick={() => run(entry)}
                    className="border-ink bg-ink text-cream enabled:hover:shadow-hard-lime flex w-full items-start gap-3 border-2 px-4 py-3 text-left enabled:cursor-pointer"
                  >
                    <span className="mono-caps text-peach mt-1 w-6 shrink-0 text-[12px] font-bold">
                      {String(depth + 1).padStart(2, "0")}
                    </span>
                    <Prompt
                      selection={entry}
                      highlight={STEPS[depth - 1]?.key}
                      mark="bg-signal text-ink"
                      presentation={presentation}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {!finished && (
          <div className="mt-6">
            {started && (
              <p className="mono-caps text-[12px] font-bold">
                {t("experience.morePrecise")}
              </p>
            )}
            <ul className="mt-2 flex flex-col gap-3">
              {options.map((option) => {
                const loading =
                  pending !== null && nodeId(pending) === nodeId(option);
                return (
                  <li key={nodeId(option)}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(option)}
                      className={`press press-sm border-ink flex w-full cursor-pointer items-center gap-3 border-2 px-4 py-3 text-left disabled:cursor-default ${started ? "" : "min-h-20"} ${!started || loading ? "bg-signal" : "bg-cream enabled:hover:bg-peach"}`}
                    >
                      <Prompt
                        selection={option}
                        highlight={step?.key}
                        mark="bg-lime text-ink"
                        presentation={presentation}
                      />
                      <span className="mono-caps ml-auto shrink-0 text-[12px] font-bold">
                        {loading
                          ? t("experience.running", {
                              count: IMAGES_PER_PROMPT,
                            })
                          : started
                            ? "→"
                            : `▶ ${t("experience.run")}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {started && (
          <div className="mt-6 flex flex-wrap gap-3 pb-2">
            <Button
              variant={finished ? "primary" : "secondary"}
              size={finished ? "md" : "sm"}
              onClick={restart}
            >
              {t("experience.restart")}
            </Button>
          </div>
        )}
      </div>

      <div className="order-first flex min-h-0 flex-col gap-3 lg:order-none">
        <div className="flex w-full items-center justify-center lg:[container-type:size] lg:min-h-0 lg:flex-1">
          <FlipGrid
            version={started ? nodeId(selection) : null}
            urls={urls}
            label={
              started
                ? t("experience.gridLabel", {
                    count: IMAGES_PER_PROMPT,
                    prompt: promptText(selection, locale),
                  })
                : t("experience.gridEmpty")
            }
          />
        </div>
        <p className="mono-caps text-ink-60 text-center text-[11px] font-bold lg:text-[12px]">
          {t("experience.caption", { count: IMAGES_PER_PROMPT })}
        </p>
        <p className="sr-only" aria-live="polite">
          {started &&
            t("experience.gridLabel", {
              count: IMAGES_PER_PROMPT,
              prompt: promptText(selection, locale),
            })}
        </p>
      </div>
    </section>
  );
}

function Prompt({ selection, highlight, mark, presentation }) {
  return (
    <span
      className={`font-bold ${presentation ? "text-[clamp(18px,1.4vw,24px)]" : "text-[17px] lg:text-[19px]"} leading-[1.3]`}
    >
      {promptSegments(selection, locale).map((segment, index) =>
        highlight && segment.step === highlight ? (
          <mark key={index} className={`${mark} box-decoration-clone px-1`}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </span>
  );
}
