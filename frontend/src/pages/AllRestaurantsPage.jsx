import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurants } from "../redux/actions/restaurant.action";
import {
  Loader,
  Error,
  RestaurantCard,
  Container,
  Button,
} from "../components";

function AllRestaurants() {
  const dispatch = useDispatch();
  const { restaurants, loading, error } = useSelector(
    (state) => state.restaurants,
  );

  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);

  const mappedRestaurants = restaurants.map((restaurant, index) => ({
    ...restaurant,
    href: `/restaurants/${restaurant._id}`,
    gradient: [
      "from-orange-500 via-amber-400 to-rose-400",
      "from-amber-500 via-orange-500 to-red-500",
      "from-emerald-500 via-teal-400 to-cyan-400",
      "from-fuchsia-500 via-pink-500 to-rose-500",
      "from-sky-500 via-blue-500 to-indigo-500",
      "from-violet-500 via-fuchsia-500 to-orange-400",
    ][index % 6],
  }));

  return (
    <Container className="py-12 lg:py-16">
      <section className="space-y-10">
        <div className="space-y-5">
          <span className="inline-flex w-fit rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-200">
            All restaurants
          </span>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Browse the full lineup of restaurants available right now.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Compare ratings, delivery times, and cuisines in one place before
              you place your next order.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              "All",
              "Fast delivery",
              "Top rated",
              "Budget friendly",
              "Open now",
            ].map((item) => (
              <Button
                key={item}
                variant="secondary"
                size="md"
                className="font-semibold text-slate-200"
              >
                {item}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader label="Loading restaurants from the backend..." />
        ) : error ? (
          <Error
            title="Unable to load restaurants"
            message={
              typeof error === "string"
                ? error
                : error.message || "Failed to load restaurants."
            }
            onRetry={() => dispatch(getRestaurants())}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mappedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Want a faster route?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Jump back to the home page search bar to find restaurants by
                keyword or cuisine.
              </p>
            </div>

            <Button to="/" variant="primary" size="lg">
              Back to search
            </Button>
          </div>
        </div>
      </section>
    </Container>
  );
}

export default AllRestaurants;
