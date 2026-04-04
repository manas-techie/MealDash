import { Link } from "react-router-dom";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Logo({
  to = "/",
  href,
  subtitle = "Fast food, fresh flow",
  className = "",
  compact = false,
}) {
  const wrapperClasses = joinClasses(
    "flex items-center gap-3 text-left text-white no-underline",
    className,
  );

  const content = (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-orange-500 to-amber-300 text-sm font-black text-slate-950 shadow-lg shadow-orange-500/25">
        MD
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight">MealDash</span>
        {!compact ? (
          <span className="text-xs font-medium text-slate-300">{subtitle}</span>
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={wrapperClasses}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={wrapperClasses}>
      {content}
    </Link>
  );
}

export default Logo;
