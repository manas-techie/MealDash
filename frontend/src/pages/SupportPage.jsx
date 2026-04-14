import { useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import { Button, Container } from "../components";

const supportChannels = [
  {
    icon: FiMessageCircle,
    title: "Live Chat",
    detail: "Average response time: under 3 minutes",
    accent: "from-cyan-400/30 to-sky-500/20",
    cta: "Start chat",
  },
  {
    icon: FiMail,
    title: "Email Support",
    detail: "support@mealdash.app",
    accent: "from-emerald-400/30 to-lime-400/20",
    cta: "Send email",
  },
  {
    icon: FiPhone,
    title: "Phone Hotline",
    detail: "+91 80000 00000 (9am - 11pm)",
    accent: "from-amber-400/35 to-orange-500/25",
    cta: "Call now",
  },
];

const faqs = [
  {
    question:
      "My payment succeeded but order is not visible. What should I do?",
    answer:
      "Stripe can take a few seconds to confirm through webhook. Wait a moment and refresh your Orders page. If it still does not appear, contact support with your Stripe session ID from the success page.",
  },
  {
    question: "Can I cancel an order after payment?",
    answer:
      "Yes. Orders in processing state can be cancelled from the Orders page. If paid online, refund status is reflected in the payment details.",
  },
  {
    question: "Why can I add items from only one restaurant in cart?",
    answer:
      "MealDash keeps one active restaurant per cart to ensure accurate delivery timeline and kitchen preparation flow.",
  },
  {
    question: "How do I track my delivery?",
    answer:
      "Open Orders and check the latest status: processing, out for delivery, delivered, or cancelled.",
  },
];

function SupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <Container className="py-10 lg:py-14">
      <section className="space-y-8">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.15),transparent_35%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100">
                MealDash Support
              </span>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Real humans. Fast help. Zero stress.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                From order delays to payment questions, our support team is
                built for urgency. Choose a channel and we will fix it fast.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                  <FiClock /> 24/7 ticket support
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                  <FiShield /> Payment-safe assistance
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                  <FiCheckCircle /> Order resolution specialists
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Priority lane
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Payment or order issue?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Include your order ID and we will jump the queue for faster
                resolution.
              </p>
              <div className="mt-4">
                <Button
                  href="mailto:support@mealdash.app"
                  variant="light"
                  size="md"
                >
                  Open priority email <FiArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {supportChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 p-5"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${channel.accent} opacity-70 transition group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <span className="inline-flex rounded-full bg-slate-950/70 p-2 text-white">
                    <Icon className="text-lg" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-white">
                    {channel.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-100">
                    {channel.detail}
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/55 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {channel.cta} <FiArrowRight />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">Quick FAQ</h2>
            <p className="mt-2 text-sm text-slate-300">
              The most common issues and instant answers.
            </p>

            <div className="mt-5 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <article
                    key={faq.question}
                    className="rounded-2xl border border-white/10 bg-slate-950/60"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-white">
                        {faq.question}
                      </span>
                      <FiHelpCircle
                        className={
                          isOpen ? "text-orange-200" : "text-slate-400"
                        }
                      />
                    </button>
                    {isOpen ? (
                      <p className="border-t border-white/10 px-4 py-3 text-sm leading-6 text-slate-200">
                        {faq.answer}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <h2 className="text-2xl font-black text-white">
              Need tailored help?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Send us context and we will route your issue to the right team.
            </p>

            <form className="mt-5 grid gap-3">
              <input
                type="text"
                placeholder="Your full name"
                className="h-11 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <input
                type="email"
                placeholder="Email address"
                className="h-11 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <input
                type="text"
                placeholder="Order ID (optional)"
                className="h-11 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <textarea
                rows="5"
                placeholder="Describe your issue..."
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-1 w-full"
              >
                Submit support request
              </Button>
            </form>
          </div>
        </section>
      </section>
    </Container>
  );
}

export default SupportPage;
