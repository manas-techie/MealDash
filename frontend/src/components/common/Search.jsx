import Button from "./Button";

const suggestions = ["Pizza", "Burgers", "Biryani", "Dessert", "Healthy bowls"];

function Search({
  value = "",
  onChange,
  onSearch,
  onClear,
  placeholder = "Search restaurants, dishes, or cuisines",
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(value);
  };

  return (
    <div id="menu" className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-950/80 p-3 shadow-2xl shadow-black/20 md:flex-row md:items-center"
      >
        <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-slate-300 md:flex-1">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">
            Search
          </span>
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            type="search"
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            aria-label="Search restaurants and dishes"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="light"
            size="lg"
            className="rounded-2xl"
          >
            Find food
          </Button>
          <Button
            onClick={onClear}
            variant="secondary"
            size="lg"
            className="rounded-2xl"
          >
            Clear
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <Button
            key={item}
            onClick={() => onSearch?.(item)}
            variant="secondary"
            size="md"
            className="font-medium text-slate-200"
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Search;
