import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, Container, Error, Loader } from "../components";
import {
  generateFoodItemReviewSummary,
  getApiErrorMessage,
  getCurrentUser,
  getFoodItemDetails,
  getRestaurantDetails,
  postFoodItemReview,
} from "../utils/mealDashApi";
import { addItemToCart, fetchCart } from "../redux/actions/cart.action";

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

function FoodItemDetailsPage() {
  const { restaurantId, foodItemId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [restaurant, setRestaurant] = useState(null);
  const [foodItem, setFoodItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageIsError, setCartMessageIsError] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryError, setAiSummaryError] = useState("");
  const [generatingAiSummary, setGeneratingAiSummary] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFoodItem = async () => {
      setLoading(true);
      setError("");

      const [restaurantResult, foodItemResult, userResult] =
        await Promise.allSettled([
          getRestaurantDetails(restaurantId),
          getFoodItemDetails(restaurantId, foodItemId),
          getCurrentUser(),
        ]);

      if (!active) {
        return;
      }

      if (restaurantResult.status === "rejected") {
        setError(
          getApiErrorMessage(
            restaurantResult.reason,
            "Failed to load the restaurant.",
          ),
        );
        setLoading(false);
        return;
      }

      if (foodItemResult.status === "rejected") {
        setError(
          getApiErrorMessage(
            foodItemResult.reason,
            "Failed to load the food item.",
          ),
        );
        setLoading(false);
        return;
      }

      setRestaurant(restaurantResult.value);
      setFoodItem(foodItemResult.value);
      setCurrentUser(
        userResult.status === "fulfilled" ? userResult.value : null,
      );
      setLoading(false);
    };

    loadFoodItem();

    return () => {
      active = false;
    };
  }, [foodItemId, restaurantId]);

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
      const updatedFoodItem = await postFoodItemReview(
        restaurantId,
        foodItemId,
        {
          rating: Number(reviewRating),
          comment: reviewComment,
        },
      );

      setFoodItem(updatedFoodItem);
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

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    setCartMessage("");
    setCartMessageIsError(false);

    try {
      await dispatch(addItemToCart({ foodItemId, quantity: 1 })).unwrap();
      dispatch(fetchCart());
      setCartMessage("Item added to your cart.");
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "Unable to add the item to cart.",
      );
      if (requestError?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setCartMessageIsError(true);
      setCartMessage(message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    setGeneratingAiSummary(true);
    setAiSummaryError("");

    try {
      const summary = await generateFoodItemReviewSummary(
        restaurantId,
        foodItemId,
      );
      setAiSummary(summary?.text || "");
    } catch (requestError) {
      setAiSummaryError(
        getApiErrorMessage(
          requestError,
          "Unable to generate AI summary right now.",
        ),
      );
    } finally {
      setGeneratingAiSummary(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-12 lg:py-16">
        <Loader label="Loading food item details..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12 lg:py-16">
        <Error
          title="Unable to load this food item"
          message={error}
          onRetry={() => window.location.reload()}
          actionTo={`/restaurants/${restaurantId}`}
          actionLabel="Back to restaurant"
        />
      </Container>
    );
  }

  if (!foodItem || !restaurant) {
    return null;
  }

  const imageUrl = foodItem.image?.url;
  const reviewCount = foodItem.reviews?.length || 0;
  const averageRating = reviewCount
    ? (
        foodItem.reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0,
        ) / reviewCount
      ).toFixed(1)
    : "0.0";

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            to={`/restaurants/${restaurantId}#menu`}
            variant="secondary"
            size="md"
          >
            Back to menu
          </Button>
          <Link
            to={`/restaurants/${restaurantId}`}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Restaurant overview
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="overflow-hidden rounded-4xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/20">
            <div className="relative h-104">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={foodItem.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-orange-500 via-amber-400 to-rose-400" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/10 to-transparent" />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {foodItem.category || "Chef special"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {foodItem.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100/90">
                    Food item
                  </span>
                  <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {foodItem.name}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                    {foodItem.description}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-right backdrop-blur">
                  <div className="text-3xl font-black text-white">
                    ₹{Number(foodItem.price || 0).toFixed(2)}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                    Price
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  {restaurant.name}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  {foodItem.menu?.category || foodItem.category || "Menu item"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Rating
                  </div>
                  <div className="mt-2 text-3xl font-black text-white">
                    {averageRating}
                  </div>
                  <StarRating
                    value={
                      reviewCount
                        ? foodItem.reviews.reduce(
                            (sum, review) => sum + Number(review.rating || 0),
                            0,
                          ) / reviewCount
                        : 0
                    }
                  />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">
                    {reviewCount}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                    Reviews
                  </div>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  Restaurant: {restaurant.name}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  Category: {foodItem.category}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  Stock: {foodItem.stock}
                </div>
              </div>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!foodItem.isAvailable || addingToCart}
                  className="w-full"
                >
                  {addingToCart
                    ? "Adding to cart..."
                    : foodItem.isAvailable
                      ? "Add to cart"
                      : "Unavailable"}
                </Button>

                {cartMessage ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      cartMessageIsError
                        ? "border border-rose-400/20 bg-rose-400/10 text-rose-100"
                        : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    }`}
                  >
                    {cartMessage}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-5 text-sm leading-6 text-orange-100">
                Sign in to add this item to your cart.
                <div>
                  <Button to="/login" variant="light" size="md">
                    Sign in to continue
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm leading-6 text-slate-300">
              Ordered from{" "}
              <span className="font-semibold text-white">
                {restaurant.name}
              </span>
              . Open the restaurant page to browse the full menu or read
              restaurant reviews.
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur">
            <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-slate-200">
              Reviews
            </span>
            <h2 className="mt-4 text-2xl font-black text-white">
              Write a review
            </h2>

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
                    placeholder="Tell others what stood out about this food item"
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
                Sign in to leave a review. Anyone can still read the existing
                reviews.
                <div className="mt-4">
                  <Button to="/login" variant="light" size="md">
                    Sign in to review
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-bold text-white">
                  AI review summary
                </h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerateAiSummary}
                  disabled={generatingAiSummary}
                >
                  {generatingAiSummary
                    ? "Generating summary..."
                    : "Generate AI summary"}
                </Button>
              </div>

              {aiSummary ? (
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  {aiSummary}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-300">
                  Click the button to generate an overall summary from all
                  reviews.
                </p>
              )}

              {aiSummaryError ? (
                <div className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {aiSummaryError}
                </div>
              ) : null}
            </div>

            {foodItem.reviews?.length > 0 ? (
              foodItem.reviews.map((review) => (
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
                No reviews yet. Be the first person to review this item.
              </div>
            )}
          </div>
        </section>
      </section>
    </Container>
  );
}

export default FoodItemDetailsPage;
