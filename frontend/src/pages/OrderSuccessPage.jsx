import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Container } from "../components";
import { fetchCart } from "../redux/actions/cart.action";
import { fetchMyOrders } from "../redux/actions/order.action";

function OrderSuccessPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <Container className="py-14 lg:py-20">
      <section className="mx-auto max-w-2xl space-y-6 rounded-4xl border border-emerald-400/25 bg-emerald-500/10 p-6 text-center sm:p-8">
        <span className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
          Payment successful
        </span>
        <h1 className="text-3xl font-black text-white sm:text-4xl">
          Your order is confirmed
        </h1>
        <p className="text-sm leading-7 text-slate-200">
          We have received your payment and your order is now being processed.
          You can track progress in your orders page.
        </p>
        {sessionId ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
            Stripe session: {sessionId}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button to="/orders" variant="primary" size="md">
            View my orders
          </Button>
          <Link
            to="/restaurants"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Order more food
          </Link>
        </div>
      </section>
    </Container>
  );
}

export default OrderSuccessPage;
