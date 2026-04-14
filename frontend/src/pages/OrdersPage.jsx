import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "../components";
import { cancelOrder, fetchMyOrders } from "../redux/actions/order.action";

function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { orders, loading, error, cancellingOrderId } = useSelector(
    (state) => state.order,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    dispatch(fetchMyOrders());
  }, [dispatch, navigate, user]);

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-6">
        <div>
          <span className="inline-flex w-fit rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-100">
            Orders
          </span>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Your order history
          </h1>
        </div>

        {loading ? (
          <p className="text-sm text-slate-300">Loading orders...</p>
        ) : null}

        {!loading && orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
            You have not placed any orders yet.
            <div className="mt-4">
              <Button to="/restaurants" variant="primary" size="md">
                Start ordering
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">
                    {order.restaurant?.name || "Restaurant"}
                  </h2>
                  <p className="text-sm text-slate-300">
                    Order ID: {order._id}
                  </p>
                  <p className="text-sm text-slate-300">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-base font-bold text-white">
                    ${Number(order.totalAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-100">
                    {order.orderStatus}
                  </p>
                  <p className="text-xs text-slate-300">
                    Payment: {order.paymentInfo?.status}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-slate-300">
                {order.items?.map((item, index) => (
                  <p key={`${order._id}-${item.foodItem?._id || index}`}>
                    {item.foodItem?.name || "Food item"} x {item.quantity}
                  </p>
                ))}
              </div>

              {order.orderStatus === "processing" ? (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={cancellingOrderId === order._id}
                    onClick={() => dispatch(cancelOrder(order._id))}
                  >
                    {cancellingOrderId === order._id
                      ? "Cancelling..."
                      : "Cancel order"}
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </section>
    </Container>
  );
}

export default OrdersPage;
