import { Link } from "react-router-dom";
import { Container, Logo, Button } from "../index.js";

function Signup({
  onSubmit,
  isLoading = false,
  values,
  onChange,
  onFileChange,
  error,
}) {
  const handleSubmit = (event) => {
    if (!onSubmit) {
      event.preventDefault();
      return;
    }

    onSubmit(event);
  };

  return (
    <Container className="py-12 lg:py-16" size="md">
      <section className="rounded-4xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="mb-8 space-y-4">
          <Logo compact />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Join MealDash to save favorites and keep every order in one place.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">
              Full name
            </span>
            <input
              type="text"
              required
              placeholder="Alex Johnson"
              name="name"
              value={values?.name || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">Email</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              name="email"
              value={values?.email || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">
              Phone number
            </span>
            <input
              type="tel"
              required
              placeholder="10 digit phone number"
              name="phoneNumber"
              value={values?.phoneNumber || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">
              Account type
            </span>
            <select
              name="role"
              value={values?.role || "user"}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-orange-300/40"
            >
              <option value="user" className="bg-slate-950">
                Customer
              </option>
              <option value="restaurant-owner" className="bg-slate-950">
                Restaurant owner
              </option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">
              Password
            </span>
            <input
              type="password"
              required
              placeholder="Create a strong password"
              name="password"
              value={values?.password || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">
              Confirm password
            </span>
            <input
              type="password"
              required
              placeholder="Repeat your password"
              name="passwordConfirm"
              value={values?.passwordConfirm || ""}
              onChange={onChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300/40"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-200">
              Profile photo
            </span>
            <input
              type="file"
              accept="image/*"
              name="avatar"
              onChange={onFileChange}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-orange-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <Link
              to="/login"
              className="text-sm font-semibold text-orange-200 transition hover:text-orange-100"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </section>
    </Container>
  );
}

export default Signup;
