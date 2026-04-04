import { Link } from "react-router-dom";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

const variantStyles = {
  primary:
    "bg-linear-to-r from-orange-500 to-amber-300 text-slate-950 shadow-lg shadow-orange-500/20 hover:scale-[1.02]",
  light: "bg-white text-slate-950 hover:scale-[1.02]",
  secondary:
    "border border-white/10 bg-white/5 text-white hover:border-orange-300/40 hover:bg-orange-400/10",
  ghost: "text-slate-200 hover:bg-white/5 hover:text-white",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-sm",
};

function Button({
  as: Component,
  to,
  href,
  type = "button",
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const classes = joinClasses(
    "inline-flex items-center justify-center rounded-full font-semibold transition",
    variantStyles[variant] || variantStyles.secondary,
    sizeStyles[size] || sizeStyles.md,
    className,
  );

  if (Component) {
    return (
      <Component className={classes} {...props}>
        {children}
      </Component>
    );
  }

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

export default Button;
