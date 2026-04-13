import { Link } from "react-router-dom";

function FoodItemCard({ item, href }) {
  const imageUrl = item.image?.url || item.images?.[0]?.url;
  const reviewCount = item.reviews?.length ?? 0;
  const averageRating = reviewCount
    ? (
        item.reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0,
        ) / reviewCount
      ).toFixed(1)
    : "0.0";

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-3xl border border-white/10 bg-slate-950/55 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-orange-300/30 hover:bg-white/[0.07]"
    >
      <article className="flex h-full flex-col">
        <div className="relative h-40 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-orange-500 via-amber-400 to-rose-400" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/5 to-transparent" />

          <div className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {item.category || "Chef special"}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <p className="mt-1 text-sm text-slate-300">{item.description}</p>
            </div>
            <div className="rounded-2xl bg-white/5 px-3 py-2 text-right">
              <div className="text-sm font-bold text-white">
                ${Number(item.price || 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-300">
                {item.isAvailable ? "Available" : "Unavailable"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-300">
            <span>{reviewCount} reviews</span>
            <span>Rating {averageRating}</span>
          </div>

          <span className="mt-4 inline-flex w-fit rounded-full bg-orange-400/10 px-3 py-2 text-xs font-semibold text-orange-100 ring-1 ring-orange-300/20 transition group-hover:bg-orange-400/15">
            Open item details
          </span>
        </div>
      </article>
    </Link>
  );
}

export default FoodItemCard;
