import { useState } from "react";
import { GRID_COLUMNS, floatTiming, waveDelay } from "~/lib/experience";

export const FLIP_MS = 620;
export const WAVE_STEP_MS = 70;

export function waveTotalMs(count) {
  return waveDelay(count - 1, WAVE_STEP_MS) + FLIP_MS;
}

// Portrait tiles (3:4) that float on their own; a new set goes on the hidden face and the tiles turn in a diagonal wave.
export default function FlipGrid({ version, urls, count, label }) {
  const empty = Array(count).fill(null);
  const [state, setState] = useState({
    version: null,
    turns: 0,
    faces: [empty, empty],
  });

  if (version !== state.version) {
    const turns = state.turns + 1;
    const faces = [...state.faces];
    faces[turns % 2] = urls ?? empty;
    setState({ version, turns, faces });
  }

  const rows = Math.ceil(count / GRID_COLUMNS);
  const ratio = (GRID_COLUMNS * 3) / (rows * 4);

  return (
    <ul
      aria-label={label}
      style={{
        "--grid-ratio": ratio,
        aspectRatio: ratio,
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
      className="grid w-full gap-2.5 sm:gap-4 lg:w-[min(100cqw,calc(100cqh*var(--grid-ratio)))] lg:gap-5"
    >
      {empty.map((_, index) => {
        const timing = floatTiming(index);
        return (
          <li
            key={index}
            className="animate-float relative min-h-0 min-w-0 perspective-[1400px]"
            style={{
              animationDuration: `${timing.duration}s`,
              animationDelay: `${timing.delay}s`,
            }}
          >
            <div
              className="absolute inset-0 transition-transform ease-[cubic-bezier(0.45,0,0.2,1)] transform-3d"
              style={{
                transform: `rotateY(${state.turns * 180}deg)`,
                transitionDuration: `${FLIP_MS}ms`,
                transitionDelay: `${waveDelay(index, WAVE_STEP_MS)}ms`,
              }}
            >
              <Face src={state.faces[0][index]} />
              <Face src={state.faces[1][index]} back />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Face({ src, back = false }) {
  return (
    <div
      className={`bg-cream/5 absolute inset-0 overflow-hidden backface-hidden ${back ? "rotate-y-180" : ""}`}
    >
      {src && <Picture key={src} src={src} />}
    </div>
  );
}

function Picture({ src }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
