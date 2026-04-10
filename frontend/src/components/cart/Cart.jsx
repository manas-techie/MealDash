import { FiShoppingCart } from "react-icons/fi";

function Cart({ itemCount = 0, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition hover:bg-white/10 ${className}`}
      aria-label="Open cart"
    >
      <FiShoppingCart className="text-lg" />
      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-400 px-1 text-[10px] font-bold text-slate-950">
        {itemCount}
      </span>
    </button>
  );
}

export default Cart;
