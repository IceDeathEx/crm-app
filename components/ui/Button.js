import Link from "next/link";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500",
  secondary: "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  type = "button",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
