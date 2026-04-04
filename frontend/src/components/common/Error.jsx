import Button from "./Button";

function Error({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
  retryLabel = "Try again",
  actionTo,
  actionLabel,
  className = "",
}) {
  return (
    <section
      className={`rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-6 shadow-2xl shadow-black/10 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200">
            Error
          </p>
          <h2 className="text-lg font-bold text-rose-50">{title}</h2>
          <p className="text-sm leading-6 text-rose-100/90">{message}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {typeof onRetry === "function" ? (
            <Button onClick={onRetry} variant="secondary" size="md">
              {retryLabel}
            </Button>
          ) : null}

          {actionTo && actionLabel ? (
            <Button to={actionTo} variant="light" size="md">
              {actionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Error;
