import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Button, Logo, Container } from "../index.js";
import Cart from "../cart/Cart.jsx";
import { logout } from "../../redux/actions/auth.action";
import { fetchCart } from "../../redux/actions/cart.action";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/restaurants" },
];

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { user } = useSelector((state) => state.auth);
  const {
    cart,
    count: cartCount,
    loading: cartLoading,
  } = useSelector((state) => state.cart);

  const cartItemsPreview = useMemo(
    () => cart?.items?.slice(0, 3) || [],
    [cart],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    dispatch(fetchCart());
  }, [dispatch, user]);

  const closePanels = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = searchInput.trim();
    const target = trimmedQuery
      ? `/restaurants?keyword=${encodeURIComponent(trimmedQuery)}`
      : "/restaurants";

    navigate(target);
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
    closePanels();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <Container className="flex items-center justify-between gap-3 py-4">
        <Logo to="/" />

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-400/15 text-orange-200 ring-1 ring-orange-300/30"
                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                }`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-400/15 text-orange-200 ring-1 ring-orange-300/30"
                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              Orders
            </NavLink>
          ) : null}
          {user?.role === "admin" ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-400/15 text-orange-200 ring-1 ring-orange-300/30"
                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              Admin
            </NavLink>
          ) : null}
          <NavLink
            to="/support"
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-orange-400/15 text-orange-200 ring-1 ring-orange-300/30"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            Support
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            variant={isSearchOpen ? "light" : "secondary"}
            size="md"
            className="px-3!"
            aria-label="Open search"
          >
            <FiSearch className="text-base" />
          </Button>
          <Cart
            itemCount={cartCount}
            onClick={() => setIsCartOpen((prev) => !prev)}
          />
          <div className="hidden md:flex md:items-center md:gap-3">
            {user ? (
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-slate-300">
                    {user.role}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="secondary"
                  size="md"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  variant="primary"
                  size="md"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
          <Button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            variant="secondary"
            size="md"
            className="px-3! md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="text-lg" />
            ) : (
              <FiMenu className="text-lg" />
            )}
          </Button>
        </div>
      </Container>

      {isSearchOpen ? (
        <div className="border-t border-white/10 bg-slate-950/90">
          <Container className="py-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by restaurant, cuisine, or area"
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500"
                aria-label="Search restaurants"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="light"
                  size="md"
                  className="rounded-2xl"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="rounded-2xl"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Close
                </Button>
              </div>
            </form>
          </Container>
        </div>
      ) : null}

      {isCartOpen ? (
        <div className="border-t border-white/10 bg-slate-950/90">
          <Container className="py-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Your cart</h2>
                  {cartLoading ? (
                    <p className="mt-1 text-sm text-slate-300">
                      Loading cart...
                    </p>
                  ) : cartItemsPreview.length ? (
                    <div className="mt-2 space-y-1 text-sm text-slate-300">
                      {cartItemsPreview.map((item) => (
                        <p key={item._id}>
                          {item.foodItem?.name || "Food item"} x {item.quantity}
                        </p>
                      ))}
                      {cart?.items?.length > cartItemsPreview.length ? (
                        <p className="text-xs text-slate-400">
                          +{cart.items.length - cartItemsPreview.length} more
                          item(s)
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-300">
                      Your cart is empty. Add items from restaurants to
                      continue.
                    </p>
                  )}
                </div>
                {cartItemsPreview.length ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      navigate("/cart");
                      setIsCartOpen(false);
                    }}
                  >
                    Go to cart
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      navigate("/restaurants");
                      setIsCartOpen(false);
                    }}
                  >
                    Explore restaurants
                  </Button>
                )}
              </div>
            </div>
          </Container>
        </div>
      ) : null}

      {isMenuOpen ? (
        <div className="border-t border-white/10 bg-slate-950/95 md:hidden">
          <Container className="grid gap-3 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={closePanels}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-400/15 text-orange-200"
                      : "bg-white/5 text-slate-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <NavLink
                to="/orders"
                onClick={closePanels}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-400/15 text-orange-200"
                      : "bg-white/5 text-slate-200"
                  }`
                }
              >
                Orders
              </NavLink>
            ) : null}

            {user?.role === "admin" ? (
              <NavLink
                to="/admin"
                onClick={closePanels}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-400/15 text-orange-200"
                      : "bg-white/5 text-slate-200"
                  }`
                }
              >
                Admin
              </NavLink>
            ) : null}

            <NavLink
              to="/support"
              onClick={closePanels}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-400/15 text-orange-200"
                    : "bg-white/5 text-slate-200"
                }`
              }
            >
              Support
            </NavLink>

            <div className="flex gap-2 pt-1">
              {user ? (
                <Button
                  onClick={handleLogout}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      navigate("/login");
                      closePanels();
                    }}
                    variant="secondary"
                    size="md"
                    className="flex-1"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/signup");
                      closePanels();
                    }}
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
