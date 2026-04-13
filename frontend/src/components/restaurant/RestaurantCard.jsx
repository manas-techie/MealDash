import { Link } from "react-router-dom";

function RestaurantCard({ restaurant }) {
  const imageUrl = restaurant.images?.[0]?.url;

  return (
    <Link
      to={restaurant.href || `/restaurants/${restaurant._id}`}
      className="group block overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl shadow-black/15 transition duration-200 hover:-translate-y-1 hover:border-orange-300/30 hover:bg-white/[0.07]"
    >
      <article>
        <div className="relative h-48 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-linear-to-br ${
                restaurant.gradient ||
                "from-orange-500 via-amber-400 to-rose-400"
              }`}
            />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/10 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {restaurant.time || restaurant.openingHours || "Today"}
            </span>
            {restaurant.isOpen !== false ? (
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/20">
                Open now
              </span>
            ) : (
              <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-200 ring-1 ring-rose-300/20">
                Closed
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-100/90">
                {restaurant.cuisine ||
                  (restaurant.isVegetarian ? "Vegetarian" : "All day dining")}
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                {restaurant.name}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-950/75 px-3 py-2 text-right backdrop-blur">
              <div className="text-sm font-bold text-white">
                {restaurant.rating}
              </div>
              <div className="text-[11px] font-medium text-slate-300">
                {restaurant.noOfReviews ?? restaurant.reviews ?? 0} reviews
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <p className="text-sm leading-6 text-slate-300">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {(restaurant.tags?.length
              ? restaurant.tags
              : [
                  restaurant.address,
                  restaurant.openingHours,
                  restaurant.isVegetarian ? "Vegetarian" : "Non-vegetarian",
                ].filter(Boolean)
            ).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                Location
              </div>
              <div className="mt-1 max-w-[12rem] text-sm font-bold leading-6 text-white">
                {restaurant.address || "View restaurant details"}
              </div>
            </div>

            <span className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition group-hover:scale-[1.02]">
              View details
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default RestaurantCard;
