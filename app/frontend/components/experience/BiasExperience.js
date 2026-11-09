import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import FlipGrid, { waveTotalMs } from "~/components/experience/FlipGrid";
import iconEye from "~/images/icons/icon_eye.png";
import { api } from "~/lib/api";
import { imagePaths, indexTree, lineage, segmentsFor } from "~/lib/experience";
import { precacheExperienceImages } from "~/lib/offline";
import { useSettings } from "~/lib/settings";
import { locale, t } from "~/i18n";

const PRELOAD_TIMEOUT_MS = 4000;
const LEAVE_MS = 260;
const MOVE_MS = 480;
const APPEAR_MS = 380;
const APPEAR_STAGGER_MS = 110;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  return Promise.race([Promise.all(loads), wait(PRELOAD_TIMEOUT_MS)]);
}

// Everything the prompt column shows for a path, in order; keys stay stable so a prompt keeps its node as it moves.
function columnItems(tree, path) {
  if (!tree) return [];
  if (path === null) {
    return tree.root
      ? [
          { key: "intro", kind: "intro" },
          { key: tree.root.path, kind: "next", prompt: tree.root },
        ]
      : [];
  }
  const next = tree.children.get(path) ?? [];
  return [
    ...lineage(tree, path).map((prompt) => ({
      key: prompt.path,
      kind: prompt.path === path ? "active" : "history",
      prompt,
    })),
    ...(next.length
      ? [
          { key: "pick", kind: "pick" },
          ...next.map((prompt) => ({ key: prompt.path, kind: "next", prompt })),
        ]
      : [{ key: "help", kind: "help" }]),
  ];
}

// History muted, current prompt bright, next prompts in between; the results float on the right.
export default function BiasExperience({ presentation = false }) {
  const settings = useSettings();
  const [tree, setTree] = useState(null);
  const [path, setPath] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const runRef = useRef(0);
  const columnRef = useRef(null);
  const snapshotRef = useRef(null);

  useEffect(() => {
    api.get("/api/public/experience").then((payload) => {
      setTree(indexTree(payload));
      if (presentation) precacheExperienceImages(imagePaths(payload));
    });
  }, [presentation]);

  const count = tree?.imagesPerPrompt ?? 15;
  const current = tree && path ? tree.byPath.get(path) : null;
  const items = columnItems(tree, path);
  const staying = pending
    ? new Set(columnItems(tree, pending.path).map((item) => item.key))
    : null;

  const measure = () =>
    new Map(
      [...(columnRef.current?.children ?? [])].map((node) => [
        node.dataset.key,
        node.getBoundingClientRect().top,
      ])
    );

  const run = async (target) => {
    if (busy) return;
    const runId = ++runRef.current;
    setBusy(true);
    setPending(target);
    await Promise.all([
      preload(target.images),
      wait(reducedMotion() ? 0 : LEAVE_MS),
    ]);
    if (runId !== runRef.current) return;
    snapshotRef.current = measure();
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

  // FLIP: items that stay glide from their old place to the new one, new items rise in one after another.
  useLayoutEffect(() => {
    const before = snapshotRef.current;
    snapshotRef.current = null;
    if (!before || !columnRef.current || reducedMotion()) return;
    let appearing = 0;
    for (const node of columnRef.current.children) {
      const top = node.getBoundingClientRect().top;
      const old = before.get(node.dataset.key);
      if (old !== undefined) {
        if (Math.abs(old - top) > 1) {
          node.animate(
            [
              { transform: `translateY(${old - top}px)` },
              { transform: "none" },
            ],
            { duration: MOVE_MS, easing: EASE }
          );
        }
      } else {
        node.animate(
          [
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: APPEAR_MS,
            delay: MOVE_MS * 0.7 + appearing++ * APPEAR_STAGGER_MS,
            easing: EASE,
            fill: "backwards",
          }
        );
      }
    }
  }, [path]);

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
        <div
          ref={columnRef}
          className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 lg:overflow-y-auto lg:py-2 lg:pr-2"
        >
          {items.map((item) => (
            <div
              key={item.key}
              data-key={item.key}
              className={`transition-opacity ease-out ${staying && !staying.has(item.key) ? "pointer-events-none opacity-0" : ""}`}
              style={{ transitionDuration: `${LEAVE_MS}ms` }}
            >
              <ColumnItem
                item={item}
                first={path === null}
                busy={busy}
                loading={pending?.path === item.key}
                onRun={run}
              />
            </div>
          ))}
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

const STATEMENT =
  "text-cream text-[22px] leading-[1.2] font-bold lg:text-[clamp(22px,1.8vw,32px)]";

const BUTTON =
  "w-full border-2 px-4 py-3 text-left transition-[color,border-color,box-shadow] duration-300 ease-out";

function ColumnItem({ item, first, busy, loading, onRun }) {
  if (item.kind === "intro") {
    return (
      <div className={`${STATEMENT} mb-6`}>
        <p>{t("experience.introLine1")}</p>
        <p>{t("experience.introLine2")}</p>
      </div>
    );
  }
  if (item.kind === "help") {
    return <p className={`${STATEMENT} mt-6`}>{t("experience.help")}</p>;
  }
  if (item.kind === "pick") {
    return (
      <p className="mono-caps text-cream/40 mt-5 text-[10px] tracking-[0.16em]">
        {t("experience.pick")}
      </p>
    );
  }
  if (item.kind === "next") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => onRun(item.prompt)}
        className={`${BUTTON} flex items-center gap-4 enabled:cursor-pointer ${loading ? "border-signal text-cream" : "border-cream/40 text-cream/80 enabled:hover:border-cream enabled:hover:text-cream"}`}
      >
        <Prompt
          prompt={item.prompt}
          mark="bg-transparent text-lime shadow-[0_0_0_4px_transparent]"
        />
        {first && (
          <ArrowRightIcon
            aria-hidden="true"
            className={`ml-auto h-6 w-6 shrink-0 transition-opacity duration-300 ${loading ? "opacity-0" : ""}`}
          />
        )}
      </button>
    );
  }
  const active = item.kind === "active";
  return (
    <button
      type="button"
      disabled={active || busy}
      aria-current={active ? "step" : undefined}
      title={active ? undefined : t("experience.backTo")}
      onClick={() => onRun(item.prompt)}
      className={`${BUTTON} ${active ? "border-cream text-cream shadow-hard-signal" : "border-cream/10 text-cream/35 enabled:hover:text-cream/60 enabled:cursor-pointer"}`}
    >
      <Prompt
        prompt={item.prompt}
        mark={
          active
            ? "bg-signal text-ink shadow-[0_0_0_4px_var(--color-signal)]"
            : "bg-transparent text-cream/60 shadow-[0_0_0_4px_transparent]"
        }
      />
    </button>
  );
}

function Prompt({ prompt, mark }) {
  return (
    <span className="text-[17px] leading-[1.3] font-bold lg:text-[clamp(17px,1.25vw,22px)]">
      {segmentsFor(prompt, locale).map((segment, index) =>
        segment.added ? (
          <mark
            key={index}
            className={`${mark} box-decoration-clone transition-[color,background-color,box-shadow] duration-300 ease-out`}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </span>
  );
}
