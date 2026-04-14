import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "../components";
import {
  changeCartItemQuantity,
  clearCart,
  deleteCartItem,
  fetchCart,
} from "../redux/actions/cart.action";
import { createCheckout } from "../redux/actions/order.action";
import { getApiErrorMessage } from "../utils/mealDashApi";

const DELIVERY_CHARGE = 40;
const TAX_RATE = 0.05;

const initialDeliveryInfo = {
  address: "",
  city: "",
  state: "",
  pinCode: "",
  phoneNumber: "",
  country: "India",
  deliveryDate: "",
  deliveryTime: "",
};

function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { cart, totalPrice, loading, updating, error } = useSelector(
    (state) => state.cart,
  );
  const { checkoutLoading } = useSelector((state) => state.order);

  const [deliveryInfo, setDeliveryInfo] = useState(() => {
    const saved = localStorage.getItem("mealdash:deliveryInfo");
    if (!saved) {
      return initialDeliveryInfo;
    }

    try {
      const parsed = JSON.parse(saved);
      return { ...initialDeliveryInfo, ...parsed };
    } catch {
      return initialDeliveryInfo;
    }
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    dispatch(fetchCart());
  }, [dispatch, navigate, user]);

  useEffect(() => {
    localStorage.setItem("mealdash:deliveryInfo", JSON.stringify(deliveryInfo));
  }, [deliveryInfo]);

  const subtotal = useMemo(() => Number(totalPrice || 0), [totalPrice]);
  const taxAmount = useMemo(
    () => Number((subtotal * TAX_RATE).toFixed(2)),
    [subtotal],
  );
  const deliveryCharge = subtotal > 0 ? DELIVERY_CHARGE : 0;
  const grandTotal = Number((subtotal + taxAmount + deliveryCharge).toFixed(2));

  const hasItems = Boolean(cart?.items?.length);

  const updateQuantity = async (itemId, quantity) => {
    await dispatch(changeCartItemQuantity({ itemId, quantity }));
  };

  const removeItem = async (itemId) => {
    await dispatch(deleteCartItem(itemId));
  };

  const handleCheckout = async () => {
    setFormError("");

    const requiredFields = [
      "address",
      "city",
      "state",
      "pinCode",
      "phoneNumber",
      "country",
      "deliveryDate",
      "deliveryTime",
    ];

    const missing = requiredFields.filter(
      (field) => !deliveryInfo[field]?.trim(),
    );
    if (missing.length) {
      setFormError("Please complete delivery information before checkout.");
      return;
    }

    try {
      const result = await dispatch(
        createCheckout({
          deliveryInfo,
          taxAmount,
          deliveryCharge,
        }),
      ).unwrap();

      if (result?.url) {
        window.location.href = result.url;
        return;
      }

      setFormError("Unable to start checkout right now.");
    } catch (checkoutError) {
      setFormError(getApiErrorMessage(checkoutError, "Checkout failed."));
    }
  };

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-100">
            Cart
          </span>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Review and checkout
          </h1>
          <p className="text-sm text-slate-300">
            Adjust item quantities, provide delivery details, and continue to
            payment.
          </p>
        </div>

        {!hasItems && !loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
            <p>Your cart is empty.</p>
            <div className="mt-4">
              <Button to="/restaurants" variant="primary" size="md">
                Explore restaurants
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Items</h2>
                {hasItems ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={updating}
                    onClick={() => dispatch(clearCart())}
                  >
                    Clear cart
                  </Button>
                ) : null}
              </div>

              {loading ? (
                <p className="text-sm text-slate-300">Loading cart...</p>
              ) : null}

              {cart?.items?.map((item) => {
                const foodItem = item.foodItem || {};
                const itemTotal =
                  Number(item.price || 0) * Number(item.quantity || 0);

                return (
                  <article
                    key={item._id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {foodItem.name}
                      </h3>
                      <p className="text-sm text-slate-300">
                        ${Number(item.price || 0).toFixed(2)} each
                      </p>
                      <p className="mt-1 text-sm text-orange-100">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updating || Number(item.quantity || 0) <= 1}
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            Number(item.quantity || 1) - 1,
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="min-w-8 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updating}
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            Number(item.quantity || 0) + 1,
                          )
                        }
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updating}
                        onClick={() => removeItem(item._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </article>
                );
              })}

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}
            </div>

            <aside className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white">Delivery info</h2>

              <div className="grid gap-3">
                {Object.entries(deliveryInfo).map(([key, value]) => (
                  <label key={key} className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <input
                      type={
                        key === "deliveryDate"
                          ? "date"
                          : key === "deliveryTime"
                            ? "time"
                            : "text"
                      }
                      value={value}
                      onChange={(event) =>
                        setDeliveryInfo((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm">
                <div className="flex justify-between text-slate-200">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>Delivery</span>
                  <span>${deliveryCharge.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {formError ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {formError}
                </div>
              ) : null}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={!hasItems || checkoutLoading || loading}
              >
                {checkoutLoading ? "Redirecting..." : "Proceed to payment"}
              </Button>
            </aside>
          </div>
        )}
      </section>
    </Container>
  );
}

export default CartPage;
