import { NavLink, useNavigate } from "react-router-dom";
import { Button, Logo, Container } from "../index.js";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/restaurants" },
  { label: "Map", to: "/map" },
  { label: "Support", to: "/support" },
];

function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <Container className="flex items-center justify-between gap-4 py-4">
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
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => navigate("/login")}
            variant="secondary"
            size="md"
          >
            Sign in
          </Button>
          <Button
            onClick={() => navigate("/#menu")}
            variant="primary"
            size="md"
          >
            Order now
          </Button>
        </div>
      </Container>
    </header>
  );
}

export default Header;
