import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import FlipGrid, { waveTotalMs } from "~/components/experience/FlipGrid";
import iconEye from "~/images/icons/icon_eye.png";
import { api } from "~/lib/api";
import {
  imagePaths,
  indexTree,
  lineage,
  randomMosaic,
  segmentsFor,
} from "~/lib/experience";
import { precacheExperienceImages } from "~/lib/offline";
import { useSettings } from "~/lib/settings";
import { locale, t } from "~/i18n";

const PRELOAD_TIMEOUT_MS = 4000;
const LEAVE_MS = 260;
const MOVE_MS = 480;
const IDLE_PARAM = "idle";
const APPEAR_MS = 380;
const APPEAR_STAGGER_MS = 110;
const PICK_KEY = "pick";
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const EXPLAIN_LINES = ["explain1", "explain2", "explain3", "explain4"];
const OBSERVATION_LINES = ["observation1", "observation2", "observation3"];

const lineItems = (keys, classes = {}) =>
  keys.map((key) => ({
    key,
    kind: "line",
    text: key,
    className: classes[key],
  }));

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
function columnItems(tree, path, started) {
  if (!tree) return [];
  if (path === null) {
    if (!tree.root) return [];
    return started
      ? [
          ...lineItems(EXPLAIN_LINES, {
            explain3: "mt-1",
            explain4: "text-lime mb-4",
          }),
          { key: tree.root.path, kind: "next", prompt: tree.root },
        ]
      : [
          { key: "intro", kind: "intro" },
          { key: "start", kind: "start" },
        ];
  }
  const next = tree.children.get(path) ?? [];
  return [
    ...lineage(tree, path).map((prompt) => ({
      key: prompt.path,
      kind: prompt.path === path ? "active" : "history",
      prompt,
    })),
    ...(path === tree.root?.path
      ? lineItems(OBSERVATION_LINES, {
          observation1: "mt-4",
          observation3: "mb-2",
        })
      : []),
    ...(next.length
      ? [
          { key: PICK_KEY, kind: "pick" },
          ...next.map((prompt) => ({ key: prompt.path, kind: "next", prompt })),
        ]
      : [
          { key: "help", kind: "help" },
          { key: "help-action", kind: "helpAction" },
        ]),
  ];
}

// History muted, current prompt bright, next prompts in between; the results float on the right.
export default function BiasExperience({ presentation = false }) {
  const settings = useSettings();
  const [tree, setTree] = useState(null);
  const [path, setPath] = useState(null);
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mosaic, setMosaic] = useState(null);
  const [round, setRound] = useState(0);
  const runRef = useRef(0);
  const columnRef = useRef(null);
  const snapshotRef = useRef(null);
  const delayRef = useRef(0);

  useEffect(() => {
    api.get("/api/public/experience").then((payload) => {
      setTree(indexTree(payload));
      setMosaic(randomMosaic(payload.prompts, payload.images_per_prompt));
      if (presentation) precacheExperienceImages(imagePaths(payload));
    });
  }, [presentation]);

  const count = tree?.imagesPerPrompt ?? 15;
  const current = tree && path ? tree.byPath.get(path) : null;
  const items = columnItems(tree, path, started);
  const staying = pending
    ? new Set(
        columnItems(tree, pending.path, started)
          .map((item) => item.key)
          .filter((key) => key !== PICK_KEY)
      )
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
    delayRef.current = waveTotalMs(count);
    setPath(target.path);
    setPending(null);
    setTimeout(
      () => {
        if (runId !== runRef.current) return;
        setBusy(false);
        (tree.children.get(target.path) ?? []).forEach((child) =>
          preload(child.images)
        );
      },
      waveTotalMs(count) + APPEAR_MS
    );
  };

  const start = async () => {
    if (busy) return;
    const runId = ++runRef.current;
    setBusy(true);
    setLeaving(true);
    await wait(reducedMotion() ? 0 : LEAVE_MS);
    if (runId !== runRef.current) return;
    snapshotRef.current = measure();
    delayRef.current = 0;
    setStarted(true);
    setLeaving(false);
    setBusy(false);
  };

  // FLIP: items that stay glide to their new place while the tiles turn; new items rise in once the tiles have turned.
  useLayoutEffect(() => {
    const before = snapshotRef.current;
    snapshotRef.current = null;
    if (!before || !columnRef.current || reducedMotion()) return;
    let appearing = 0;
    for (const node of columnRef.current.children) {
      const top = node.getBoundingClientRect().top;
      const old = before.get(node.dataset.key);
      if (old !== undefined && node.dataset.key !== PICK_KEY) {
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
            delay: delayRef.current + appearing++ * APPEAR_STAGGER_MS,
            easing: EASE,
            fill: "backwards",
          }
        );
      }
    }
  }, [path, started]);

  const idleSeconds =
    Number(new URLSearchParams(window.location.search).get(IDLE_PARAM)) ||
    settings?.limits?.experience_idle_seconds;
  useEffect(() => {
    if (!presentation || (path === null && !started) || !idleSeconds) return;
    let timer;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        runRef.current += 1;
        setPath(null);
        setStarted(false);
        setLeaving(false);
        setPending(null);
        setBusy(false);
        if (tree) {
          setMosaic(randomMosaic([...tree.byPath.values()], count));
          setRound((n) => n + 1);
        }
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
  }, [presentation, path, started, idleSeconds, tree, count]);

  const plainText = (prompt, lang = locale) =>
    segmentsFor(prompt, lang)
      .map((segment) => segment.text)
      .join("");

  return (
    <section
      className={`md:px-gutter mx-auto grid w-full max-w-[1900px] gap-8 px-4 py-6 lg:min-h-0 lg:flex-1 ${presentation ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.5fr)]" : "lg:grid-cols-[minmax(340px,1fr)_minmax(0,1.9fr)]"} lg:gap-14 lg:py-10`}
    >
      <div className="flex min-h-0 flex-col gap-6">
        {presentation && (
          <div className="flex items-center gap-3">
            <img src={iconEye} alt="" className="h-20 w-20" />
            <span className="display-caps text-[48px] leading-none tracking-[0.04em]">
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
              className={`transition-opacity ease-out ${leaving || (staying && !staying.has(item.key)) ? "pointer-events-none opacity-0" : ""}`}
              style={{ transitionDuration: `${LEAVE_MS}ms` }}
            >
              <ColumnItem
                item={item}
                presentation={presentation}
                first={path === null}
                busy={busy}
                loading={pending?.path === item.key}
                onRun={run}
                onStart={start}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="order-first flex min-h-0 flex-col items-center gap-4 lg:order-none">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center lg:[container-type:size]">
          <FlipGrid
            version={path ?? (mosaic ? `start-${round}` : null)}
            urls={current?.images ?? mosaic}
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
        </div>
        {current && (
          <ExecutionNote
            key={current.path}
            presentation={presentation}
            prompt={plainText(current, "en")}
            count={count}
          />
        )}
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
const STATEMENT_PRESENT =
  "text-cream text-[clamp(36px,2.6vw,56px)] leading-[1.15] font-bold";
const LABEL_PRESENT = "min-h-20 text-[22px] px-8";

const BUTTON =
  "w-full border-2 px-4 py-3 text-left transition-[color,border-color,box-shadow] duration-300 ease-out";

function ColumnItem({
  item,
  presentation,
  first,
  busy,
  loading,
  onRun,
  onStart,
}) {
  const statement = presentation ? STATEMENT_PRESENT : STATEMENT;
  if (item.kind === "intro") {
    return (
      <div className={`${statement} mb-6 space-y-4`}>
        <p>{t("experience.introLine1")}</p>
        <p>{t("experience.introLine2")}</p>
      </div>
    );
  }
  if (item.kind === "start") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={onStart}
        className={`border-cream text-cream enabled:hover:bg-cream enabled:hover:text-night mono-caps flex w-full items-center justify-between gap-3 border-2 font-bold transition-colors duration-300 enabled:cursor-pointer ${presentation ? LABEL_PRESENT : "min-h-12 px-5 text-[13px]"}`}
      >
        {t("experience.start")}
        <ArrowRightIcon
          aria-hidden="true"
          className={presentation ? "h-8 w-8" : "h-5 w-5"}
        />
      </button>
    );
  }
  if (item.kind === "line") {
    return (
      <p className={`${statement} ${item.className ?? ""}`}>
        {t(`experience.${item.text}`)}
      </p>
    );
  }
  if (item.kind === "help") {
    return <p className={`${statement} mt-6`}>{t("experience.help")}</p>;
  }
  if (item.kind === "helpAction") {
    return presentation ? (
      <div className="mt-2 flex items-end gap-4">
        <img
          src="/qr.svg"
          alt=""
          width="200"
          height="200"
          className="bg-cream h-48 w-48 p-3"
        />
        <p className="mono-caps text-cream/60 text-[20px] font-bold tracking-[0.14em]">
          {t("experience.scanQr")}
        </p>
      </div>
    ) : (
      <Link
        to="/"
        className="border-cream text-cream hover:bg-cream hover:text-night mono-caps mt-2 inline-flex min-h-12 items-center gap-3 border-2 px-5 text-[13px] font-bold transition-colors duration-300"
      >
        {t("experience.learnMore")}
        <ArrowRightIcon aria-hidden="true" className="h-5 w-5" />
      </Link>
    );
  }
  if (item.kind === "pick") {
    return (
      <p
        className={`mono-caps text-cream/40 mt-5 tracking-[0.16em] ${presentation ? "text-[18px]" : "text-[10px]"}`}
      >
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
        className={`${BUTTON} ${presentation ? "px-6 py-5" : ""} flex items-center gap-4 enabled:cursor-pointer ${loading ? "border-signal text-cream" : "border-cream/40 text-cream/80 enabled:hover:border-cream enabled:hover:text-cream"}`}
      >
        <Prompt
          presentation={presentation}
          prompt={item.prompt}
          mark="bg-transparent text-lime shadow-[0_0_0_4px_transparent]"
        />
        {first && (
          <ArrowRightIcon
            aria-hidden="true"
            className={`ml-auto ${presentation ? "h-10 w-10" : "h-6 w-6"} shrink-0 transition-opacity duration-300 ${loading ? "opacity-0" : ""}`}
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
      className={`${BUTTON} ${presentation ? "px-6 py-5" : ""} ${active ? "border-cream text-cream shadow-hard-signal" : "border-cream/10 text-cream/35 enabled:hover:text-cream/60 enabled:cursor-pointer"}`}
    >
      <Prompt
        presentation={presentation}
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

// The prompt is shown in English: it is the sentence the model actually received.
function ExecutionNote({ prompt, count, presentation }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (reducedMotion()) return;
    ref.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: APPEAR_MS,
      delay: waveTotalMs(count),
      easing: EASE,
      fill: "backwards",
    });
  }, [count]);
  return (
    <p
      ref={ref}
      className={`text-cream/40 font-mono leading-snug tracking-[0.04em] ${presentation ? "text-[18px]" : "text-[10px] lg:text-[11px]"}`}
    >
      {t("experience.executed", { prompt, count })}
    </p>
  );
}

function Prompt({ prompt, mark, presentation }) {
  return (
    <span
      className={`leading-[1.3] font-bold ${presentation ? "text-[clamp(26px,1.9vw,40px)]" : "text-[17px] lg:text-[clamp(17px,1.25vw,22px)]"}`}
    >
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
