import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container, Error, FoodItemCard, Loader } from "../components";
import {
  getApiErrorMessage,
  getCurrentUser,
  getRestaurantDetails,
  getRestaurantFoodItems,
  getRestaurantMenus,
  postRestaurantReview,
} from "../utils/mealDashApi";

function StarRating({ value = 0 }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < Math.round(rating) ? "text-amber-300" : "text-white/20"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function RestaurantDetailsPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRestaurant = async () => {
      setLoading(true);
      setError("");

      const [restaurantResult, menusResult, foodItemsResult, userResult] =
        await Promise.allSettled([
          getRestaurantDetails(restaurantId),
          getRestaurantMenus(restaurantId),
          getRestaurantFoodItems(restaurantId),
          getCurrentUser(),
        ]);

      if (!active) {
        return;
      }

      if (restaurantResult.status === "rejected") {
        setError(
          getApiErrorMessage(
            restaurantResult.reason,
            "Failed to load restaurant details.",
          ),
        );
        setLoading(false);
        return;
      }

      setRestaurant(restaurantResult.value);
      setMenus(menusResult.status === "fulfilled" ? menusResult.value : []);
      setFoodItems(
        foodItemsResult.status === "fulfilled" ? foodItemsResult.value : [],
      );
      setCurrentUser(
        userResult.status === "fulfilled" ? userResult.value : null,
      );
      setLoading(false);
    };

    loadRestaurant();

    return () => {
      active = false;
    };
  }, [restaurantId]);

  const submitReview = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewMessage("");

    try {
      const updatedRestaurant = await postRestaurantReview(restaurantId, {
        rating: Number(reviewRating),
        comment: reviewComment,
      });

      setRestaurant(updatedRestaurant);
      setReviewComment("");
      setReviewRating("5");
      setReviewMessage("Your review has been posted.");
    } catch (requestError) {
      setReviewError(
        getApiErrorMessage(requestError, "Unable to submit review."),
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const categories = [];
  const categoryLookup = new Map();

  const registerItem = (categoryName, item) => {
    if (!item || !item._id) {
      return;
    }

    if (!categoryLookup.has(categoryName)) {
      const categoryBucket = { category: categoryName, items: [] };
      categoryLookup.set(categoryName, categoryBucket);
      categories.push(categoryBucket);
    }

    const bucket = categoryLookup.get(categoryName);
    if (!bucket.items.some((existingItem) => existingItem._id === item._id)) {
      bucket.items.push(item);
    }
  };

  menus.forEach((menuDoc) => {
    menuDoc.menu?.forEach((section) => {
      section.items?.forEach((item) => {
        const nextItem =
          typeof item === "object"
            ? item
            : foodItems.find((entry) => entry._id === item);
        registerItem(
          section.category || nextItem?.category || "Featured",
          nextItem,
        );
      });
    });
  });

  if (!categories.length && foodItems.length > 0) {
    foodItems.forEach((item) =>
      registerItem(item.category || "Featured", item),
    );
  }

  const imageUrl = restaurant?.images?.[0]?.url;
  const restaurantReviews = restaurant?.reviews || [];

  if (loading) {
    return (
      <Container className="py-12 lg:py-16">
        <Loader label="Loading restaurant details..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12 lg:py-16">
        <Error
          title="Unable to load this restaurant"
          message={error}
          onRetry={() => window.location.reload()}
          actionTo="/restaurants"
          actionLabel="Back to restaurants"
        />
      </Container>
    );
  }

  if (!restaurant) {
    return null;
  }

  const averageRating = Number(restaurant.rating || 0).toFixed(1);

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button to="/restaurants" variant="secondary" size="md">
                Back to restaurants
              </Button>
              <a
                href="#menu"
                className="rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-400/15"
              >
                Menu
              </a>
              <a
                href="#reviews"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Reviews
              </a>
            </div>

            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-200">
                Restaurant details
              </span>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {restaurant.name}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {restaurant.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full bg-white/5 px-4 py-2">
                {restaurant.address}
              </span>
              <span className="rounded-full bg-white/5 px-4 py-2">
                {restaurant.openingHours}
              </span>
              <span className="rounded-full bg-white/5 px-4 py-2">
                {restaurant.isVegetarian
                  ? "Vegetarian friendly"
                  : "All day dining"}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/20">
            <div className="relative h-72">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-orange-500 via-amber-400 to-rose-400" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/10 to-transparent" />

              <div className="absolute left-5 top-5 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {restaurant.isOpen !== false ? "Open now" : "Closed"}
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100/90">
                    Rating
                  </div>
                  <div className="mt-2 text-4xl font-black text-white">
                    {averageRating}
                  </div>
                  <StarRating value={restaurant.rating} />
                </div>

                <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-right backdrop-blur">
                  <div className="text-2xl font-black text-white">
                    {restaurant.noOfReviews || 0}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                    Reviews
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="menu" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-200">
                Menu
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                Categories and food items
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Browse each category, open a food item for full details, and add
              it to your cart from the item page.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-10">
              {categories.map((category) => (
                <section key={category.category} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-white">
                      {category.category}
                    </h3>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {category.items.length} items
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {category.items.map((item) => (
                      <FoodItemCard
                        key={item._id}
                        item={item}
                        href={`/restaurants/${restaurantId}/food-items/${item._id}`}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              No menu items are available for this restaurant yet.
            </div>
          )}
        </section>

        <section
          id="reviews"
          className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-slate-200">
                  Reviews
                </span>
                <h2 className="mt-4 text-2xl font-black text-white">
                  Share your experience
                </h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">
                  {averageRating}
                </div>
                <StarRating value={restaurant.rating} />
              </div>
            </div>

            {currentUser ? (
              <form onSubmit={submitReview} className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-200">
                    Rating
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="1"
                    value={reviewRating}
                    onChange={(event) => setReviewRating(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-200">
                    Comment
                  </span>
                  <textarea
                    rows="4"
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Tell others what stood out about the restaurant"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
                  />
                </label>

                {reviewError ? (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {reviewError}
                  </div>
                ) : null}

                {reviewMessage ? (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    {reviewMessage}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submittingReview}
                >
                  {submittingReview ? "Posting review..." : "Post review"}
                </Button>
              </form>
            ) : (
              <div className="mt-6 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-5 text-sm leading-6 text-orange-100">
                Sign in to leave a review. Anyone can browse the restaurant
                reviews below.
                <div className="mt-4">
                  <Button to="/login" variant="light" size="md">
                    Sign in to review
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {restaurantReviews.length > 0 ? (
              restaurantReviews.map((review) => (
                <article
                  key={`${review.user?._id || review.user}-${review.comment}`}
                  className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {review.user?.name || "Guest reviewer"}
                      </h3>
                      <div className="mt-2">
                        <StarRating value={review.rating} />
                      </div>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      {Number(review.rating || 0).toFixed(1)} / 5
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {review.comment}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                No reviews yet. Be the first to leave feedback for this
                restaurant.
              </div>
            )}
          </div>
        </section>
      </section>
    </Container>
  );
}

export default RestaurantDetailsPage;
