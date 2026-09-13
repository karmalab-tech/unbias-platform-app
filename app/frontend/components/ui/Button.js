import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-btn font-ui text-[15.5px] font-semibold transition-colors duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  ink: "bg-ink text-canvas hover:bg-shell",
  secondary: "border border-ink/20 bg-transparent text-ink hover:bg-surface",
  ghost: "bg-transparent text-ink-72 hover:text-ink",
};

const sizes = {
  md: "px-[22px] py-[14px]",
  sm: "px-4 py-2.5 text-sm",
  lg: "px-7 py-4 text-base",
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
