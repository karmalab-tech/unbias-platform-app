import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-3 border-2 mono-caps font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-70";

const variants = {
  primary:
    "press border-ink bg-signal text-ink disabled:bg-peach disabled:shadow-none",
  ink: "press press-signal border-ink bg-ink text-cream disabled:bg-peach disabled:text-ink disabled:shadow-none",
  secondary:
    "border-ink bg-transparent text-ink hover:bg-ink hover:text-cream active:bg-peach active:text-ink disabled:hover:bg-transparent disabled:hover:text-ink",
  ghost:
    "border-transparent bg-transparent text-ink underline-offset-4 hover:underline",
};

const sizes = {
  md: "min-h-14 px-[22px] text-[14px]",
  sm: "min-h-11 px-4 text-[12px]",
  lg: "min-h-14 px-7 text-[15px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  className = "",
  type = "button",
  full = false,
  children,
  ...props
}) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
