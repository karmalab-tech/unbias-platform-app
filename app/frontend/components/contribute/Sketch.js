// Hand-drawn chrome for the contribute flow only, layered over the design
// tokens rather than replacing them: drawably keeps the real button, input and
// checkbox in the DOM and draws an aria-hidden SVG behind them.
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { drawablyButton } from "drawably";
import { DrawablyCard, DrawablyCheckbox } from "drawably/react";
import { seedFrom } from "~/lib/sketch";

// A steadier hand than the library default: this is a consent flow, not a toy.
const PEN = { roughness: 0.85, boil: 0.18, width: 1.8 };

const buttonVariants = {
  primary: { variant: "solid", className: "sketch-pen--accent text-white" },
  ink: { variant: "solid", className: "text-canvas" },
  secondary: { variant: "outline", className: "text-ink" },
  ghost: { variant: "outline", className: "sketch-pen--muted text-ink-72" },
};

const buttonSizes = {
  md: "px-[22px] py-[14px] text-[15.5px]",
  sm: "px-4 py-2.5 text-[14px]",
  lg: "px-7 py-4 text-[16px]",
};

export function SketchButton({
  sketchKey,
  variant = "primary",
  size = "md",
  state = "idle",
  to,
  href,
  full = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  const { variant: pen, className: tone } = buttonVariants[variant];
  const seed = seedFrom(sketchKey);
  const ref = useRef(null);
  const sketch = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    const handle = drawablyButton(ref.current, { ...PEN, seed, variant: pen });
    sketch.current = handle;
    return () => {
      sketch.current = null;
      handle.destroy();
    };
  }, [seed, pen]);

  // Re-applied after a re-attach, which resets the button to idle.
  useEffect(() => {
    sketch.current?.setState(state);
  }, [state, seed, pen]);

  const classes = `font-ui inline-flex items-center justify-center gap-2.5 font-semibold ${tone} ${buttonSizes[size]} ${full ? "w-full" : ""} ${className}`;

  if (to)
    return (
      <Link to={to} ref={ref} className={classes} {...props}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a href={href} ref={ref} className={classes} {...props}>
        {children}
      </a>
    );
  return (
    <button type={type} ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
}

// drawably reads the tick off the input's `change` event, which React does not
// fire when it sets `checked` itself: drive this from user input only.
export function SketchCheckbox({
  sketchKey,
  checked,
  onChange,
  children,
  required = false,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15.5px] leading-[1.5]">
      <DrawablyCheckbox
        {...PEN}
        seed={seedFrom(sketchKey)}
        className="mt-0.5 shrink-0"
        checked={checked}
        required={required}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-ink">{children}</span>
    </label>
  );
}

export function SketchCard({ sketchKey, className = "", children, ...props }) {
  return (
    <DrawablyCard
      {...PEN}
      seed={seedFrom(sketchKey)}
      className={className}
      {...props}
    >
      {children}
    </DrawablyCard>
  );
}
