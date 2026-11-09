import { useState } from "react";
import { IMAGES_PER_PROMPT, waveDelay } from "~/lib/experience";

export const FLIP_MS = 520;
export const WAVE_STEP_MS = 70;
export const WAVE_TOTAL_MS =
  waveDelay(IMAGES_PER_PROMPT - 1, WAVE_STEP_MS) + FLIP_MS;

const EMPTY = Array(IMAGES_PER_PROMPT).fill(null);

// Two layers of images on the two faces of each tile: a new set goes on the hidden face, then every tile turns.
export default function FlipGrid({ version, urls, label }) {
  const [state, setState] = useState({
    version: null,
    turns: 0,
    faces: [EMPTY, EMPTY],
  });

  if (version !== state.version) {
    const turns = state.turns + 1;
    const faces = [...state.faces];
    faces[turns % 2] = urls ?? EMPTY;
    setState({ version, turns, faces });
  }

  return (
    <ul
      aria-label={label}
      className="grid aspect-[5/4] w-full grid-cols-5 grid-rows-4 gap-1.5 perspective-[1600px] lg:w-[min(100cqw,125cqh)] lg:gap-2"
    >
      {EMPTY.map((_, index) => (
        <li key={index} className="relative min-h-0 min-w-0">
          <div
            className="absolute inset-0 transition-transform ease-in-out transform-3d"
            style={{
              transform: `rotateY(${state.turns * 180}deg)`,
              transitionDuration: `${FLIP_MS}ms`,
              transitionDelay: `${waveDelay(index, WAVE_STEP_MS)}ms`,
            }}
          >
            <Face src={state.faces[0][index]} index={index} />
            <Face src={state.faces[1][index]} index={index} back />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Face({ src, index, back = false }) {
  return (
    <div
      className={`border-ink absolute inset-0 overflow-hidden border-2 backface-hidden ${back ? "rotate-y-180" : ""}`}
    >
      {src ? (
        <Picture key={src} src={src} index={index} />
      ) : (
        <div className="hatch-well h-full w-full" />
      )}
    </div>
  );
}

function Picture({ src, index }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="bg-surface mono-caps text-ink-45 flex h-full w-full items-center justify-center text-[12px] font-bold">
        {String(index + 1).padStart(2, "0")}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="bg-surface h-full w-full object-cover"
    />
  );
}
