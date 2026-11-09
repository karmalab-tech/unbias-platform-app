import { useEffect, useRef, useState } from "react";
import FlipGrid, { waveTotalMs } from "~/components/experience/FlipGrid";
import iconEye from "~/images/icons/icon_eye.png";
import { api } from "~/lib/api";
import { imagePaths, indexTree, lineage, segmentsFor } from "~/lib/experience";
import { precacheExperienceImages } from "~/lib/offline";
import { useSettings } from "~/lib/settings";
import { locale, t } from "~/i18n";

const PRELOAD_TIMEOUT_MS = 4000;

function preload(urls) {
  const loads = urls.filter(Boolean).map(
    (url) =>
      new Promise((resolve) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve;
        image.src = url;
      })
  );
  const timeout = new Promise((resolve) =>
    setTimeout(resolve, PRELOAD_TIMEOUT_MS)
  );
  return Promise.race([Promise.all(loads), timeout]);
}

// History muted, current prompt bright, next prompts in between; the results float on the right.
export default function BiasExperience({ presentation = false }) {
  const settings = useSettings();
  const [tree, setTree] = useState(null);
  const [path, setPath] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const runRef = useRef(0);

  useEffect(() => {
    api.get("/api/public/experience").then((payload) => {
      setTree(indexTree(payload));
      if (presentation) precacheExperienceImages(imagePaths(payload));
    });
  }, [presentation]);

  const count = tree?.imagesPerPrompt ?? 15;
  const current = tree && path ? tree.byPath.get(path) : null;
  const history = tree && path ? lineage(tree, path) : [];
  const next = !tree
    ? []
    : path
      ? (tree.children.get(path) ?? [])
      : [tree.root].filter(Boolean);

  const run = async (target) => {
    if (busy) return;
    const runId = ++runRef.current;
    setBusy(true);
    setPending(target.path);
    await preload(target.images);
    if (runId !== runRef.current) return;
    setPath(target.path);
    setPending(null);
    setTimeout(() => {
      if (runId !== runRef.current) return;
      setBusy(false);
      (tree.children.get(target.path) ?? []).forEach((child) =>
        preload(child.images)
      );
    }, waveTotalMs(count));
  };

  const idleSeconds = settings?.limits?.experience_idle_seconds;
  useEffect(() => {
    if (!presentation || path === null || !idleSeconds) return;
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        runRef.current += 1;
        setPath(null);
        setPending(null);
        setBusy(false);
      }, idleSeconds * 1000);
    };
    arm();
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, [presentation, path, idleSeconds]);

  const plainText = (prompt) =>
    segmentsFor(prompt, locale)
      .map((segment) => segment.text)
      .join("");

  return (
    <section className="md:px-gutter mx-auto grid w-full max-w-[1900px] gap-8 px-4 py-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(340px,1fr)_minmax(0,1.9fr)] lg:gap-14 lg:py-10">
      <div className="flex min-h-0 flex-col gap-6">
        {presentation && (
          <div className="flex items-center gap-3">
            <img src={iconEye} alt="" className="h-12 w-12" />
            <span className="display-caps text-[28px] leading-none tracking-[0.04em]">
              Unbias
            </span>
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 lg:overflow-y-auto lg:py-2 lg:pr-2">
          {history.map((prompt) => {
            const active = prompt.path === path;
            return (
              <button
                key={prompt.path}
                type="button"
                disabled={active || busy}
                aria-current={active ? "step" : undefined}
                title={active ? undefined : t("experience.backTo")}
                onClick={() => run(prompt)}
                className={`border-2 px-4 py-3 text-left ${active ? "border-cream text-cream shadow-hard-signal" : "border-cream/10 text-cream/35 enabled:hover:text-cream/60 enabled:cursor-pointer"}`}
              >
                <Prompt
                  prompt={prompt}
                  mark={
                    active
                      ? "bg-signal text-ink px-1"
                      : "bg-transparent text-cream/60"
                  }
                />
              </button>
            );
          })}

          {next.length > 0 && (
            <>
              <p className="mono-caps text-cream/40 mt-5 text-[10px] tracking-[0.16em]">
                {t("experience.pick")}
              </p>
              {next.map((prompt) => {
                const loading = pending === prompt.path;
                return (
                  <button
                    key={prompt.path}
                    type="button"
                    disabled={busy}
                    onClick={() => run(prompt)}
                    className={`border-2 px-4 py-3 text-left enabled:cursor-pointer ${loading ? "border-signal text-cream" : "border-cream/40 text-cream/80 enabled:hover:border-cream enabled:hover:text-cream"}`}
                  >
                    <Prompt prompt={prompt} mark="bg-transparent text-lime" />
                  </button>
                );
              })}
            </>
          )}
        </div>
        {presentation && (
          <div className="flex items-end gap-4">
            <img
              src="/qr.svg"
              alt=""
              width="112"
              height="112"
              className="bg-cream h-28 w-28 p-2"
            />
            <p className="mono-caps text-cream/70 text-[12px] font-bold tracking-[0.14em]">
              {t("experience.wannaHelp")}
            </p>
          </div>
        )}
      </div>

      <div className="order-first flex min-h-0 items-center justify-center lg:[container-type:size] lg:order-none">
        <FlipGrid
          version={path}
          urls={current?.images ?? null}
          count={count}
          label={
            current
              ? t("experience.gridLabel", {
                  count,
                  prompt: plainText(current),
                })
              : t("experience.gridEmpty")
          }
        />
        <p className="sr-only" aria-live="polite">
          {current &&
            t("experience.gridLabel", { count, prompt: plainText(current) })}
        </p>
      </div>
    </section>
  );
}

function Prompt({ prompt, mark }) {
  return (
    <span className="text-[17px] leading-[1.3] font-bold lg:text-[clamp(17px,1.25vw,22px)]">
      {segmentsFor(prompt, locale).map((segment, index) =>
        segment.added ? (
          <mark key={index} className={`${mark} box-decoration-clone`}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </span>
  );
}
