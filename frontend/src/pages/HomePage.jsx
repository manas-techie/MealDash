import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader, Container } from "../components";

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = (nextQuery) => {
    const trimmedQuery = String(nextQuery || "").trim();
    setQuery(trimmedQuery);

    const target = trimmedQuery
      ? `/restaurants?keyword=${encodeURIComponent(trimmedQuery)}`
      : "/restaurants";

    navigate(target);
  };

  const handleClear = () => {
    setQuery("");
  };
  return (
    <div>
      <Container as="main" className="py-12 lg:py-16">
        <section className="grid gap-8">
          <div className="space-y-5">
            <span className="inline-flex w-fit rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-200">
              Delivery made simple
            </span>

            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
                Meals that move at the speed of your appetite.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Search local favorites, compare quick picks, and jump straight
                into the dishes you want without extra friction.
              </p>
            </div>
          </div>

          <Search
            value={query}
            onChange={handleChange}
            onSearch={handleSearch}
            onClear={handleClear}
          />

          <div id="offers" className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Fast delivery",
                text: "Pick from nearby restaurants and get an updated view of what is ready now.",
              },
              {
                title: "Better discovery",
                text: "Use search chips to jump to popular meals instead of scrolling endlessly.",
              },
              {
                title: "Clean checkout",
                text: "A simple path from browse to order keeps the interface focused and quick.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur"
              >
                <h2 className="text-lg font-bold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" id="orders">
            <Loader
              label={
                query
                  ? `Searching for ${query}...`
                  : "Loading fresh recommendations..."
              }
            />

            <aside className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
              <h2 className="text-lg font-bold text-white">
                Popular right now
              </h2>
              <div className="mt-5 space-y-4">
                {[
                  "Neapolitan pizza",
                  "Smash burgers",
                  "Chicken biryani",
                  "Chocolate cake",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-200">
                      {item}
                    </span>
                    <span className="text-xs font-semibold text-orange-200">
                      20 min
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </Container>
    </div>
  );
}

export default Home;
