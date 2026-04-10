import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { Button, Logo, Container } from "../index.js";
import Cart from "../cart/Cart.jsx";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/restaurants" },
];

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const isOnRestaurants = location.pathname === "/restaurants";
  const isSupportActive = location.hash === "#support";
  const cartCount = useMemo(() => 0, []);

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
          <a
            href="/#support"
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              isSupportActive
                ? "bg-orange-400/15 text-orange-200 ring-1 ring-orange-300/30"
                : "text-slate-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            Support
          </a>
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
            <Button
              onClick={() => navigate("/login")}
              variant="secondary"
              size="md"
            >
              Sign in
            </Button>
            <Button
              onClick={() =>
                navigate(isOnRestaurants ? "/restaurants" : "/#menu")
              }
              variant="primary"
              size="md"
            >
              Order now
            </Button>
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
                  <p className="mt-1 text-sm text-slate-300">
                    Your cart is empty. Add items from restaurants to continue.
                  </p>
                </div>
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

            <a
              href="/#support"
              onClick={closePanels}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isSupportActive
                  ? "bg-orange-400/15 text-orange-200"
                  : "bg-white/5 text-slate-200"
              }`}
            >
              Support
            </a>

            <div className="flex gap-2 pt-1">
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
                  navigate("/#menu");
                  closePanels();
                }}
                variant="primary"
                size="md"
                className="flex-1"
              >
                Order now
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
