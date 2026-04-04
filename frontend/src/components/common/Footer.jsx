import { Logo, Container } from "../index.js";

function Footer() {
  return (
    <footer id="support" className="border-t border-white/10 bg-slate-950/95">
      <Container className="grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo to="/" subtitle="Food delivery, rebuilt for speed" />

          <p className="max-w-md text-sm leading-6 text-slate-300">
            Browse local restaurants, save favorites, and get quick access to
            the dishes you want without friction.
          </p>

          <div className="flex items-center gap-3">
            {["IG", "FB", "X"].map((item) => (
              <a
                key={item}
                href="#"
                aria-label={item}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
            Explore
          </h2>
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <a className="transition hover:text-white" href="#menu">
              Menu
            </a>
            <a className="transition hover:text-white" href="#offers">
              Deals
            </a>
            <a className="transition hover:text-white" href="#orders">
              Track order
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
            Contact
          </h2>
          <div className="flex flex-col gap-3 text-sm text-slate-300">
            <a
              className="transition hover:text-white"
              href="mailto:support@mealdash.app"
            >
              support@mealdash.app
            </a>
            <a className="transition hover:text-white" href="tel:+10000000000">
              +1 (000) 000-0000
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 py-5">
        <Container className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 MealDash. All rights reserved.</p>
          <p>Built for quick browsing, clean checkout, and repeat orders.</p>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
