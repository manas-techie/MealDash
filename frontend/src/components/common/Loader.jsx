function Loader({ label = "Loading fresh recommendations..." }) {
  return (
    <div
      className="flex min-h-[220px] w-full items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/70 px-6 py-12 shadow-2xl shadow-black/20"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/15 border-t-orange-400" />
        <p className="text-sm font-medium text-slate-300">{label}</p>
      </div>
    </div>
  );
}

export default Loader;
