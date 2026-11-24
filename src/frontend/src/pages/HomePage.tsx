import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  Headphones,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Gift,
    title: "Reward eligibility",
    description:
      "Every membership unlocks reward eligibility, credited after admin verification of your purchase.",
  },
  {
    icon: Users,
    title: "Referral rewards",
    description:
      "Share your personal referral code and earn ₹199 for each verified referred membership purchase.",
  },
  {
    icon: Wallet,
    title: "Wallet dashboard",
    description:
      "Track available balance, pending rewards and every ledger entry from one clear dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Tiered membership",
    description:
      "Move from Starter to VIP with badges, boosted rewards and faster withdrawal review.",
  },
  {
    icon: ShieldCheck,
    title: "Verified payments",
    description:
      "Submit your UPI payment with a UTR reference and screenshot for a transparent review trail.",
  },
  {
    icon: Headphones,
    title: "Priority support",
    description:
      "Raise a support ticket and follow its status from open to resolved without leaving the app.",
  },
];

interface PlanRange {
  name: string;
  price: number;
  popular?: boolean;
}

const planRange: PlanRange[] = [
  { name: "Starter", price: 150 },
  { name: "Basic", price: 300 },
  { name: "Popular", price: 500, popular: true },
  { name: "Silver", price: 999 },
  { name: "Gold", price: 1999 },
  { name: "Premium", price: 4999 },
  { name: "VIP", price: 9999 },
];

const stats = [
  { value: "7", label: "Membership plans" },
  { value: "₹199", label: "Per referral reward" },
  { value: "30 days", label: "Plan validity" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  return (
    <div data-ocid="home.page" className="flex flex-col gap-20 pb-8">
      {/* Hero */}
      <section
        data-ocid="home.hero_section"
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-surface px-6 py-14 sm:px-10 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-accent/15 blur-3xl"
        />

        <motion.div
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={fadeUp}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }
          }
          className="relative mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Premium membership rewards
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Grow your rewards with{" "}
            <span className="text-gradient-primary">KuberX</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A premium membership platform built around transparent rewards,
            referral earnings and a wallet you can actually track. Choose from
            seven plans starting at {formatCurrency(150)}.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              data-ocid="home.create_account_button"
              className="w-full rounded-full bg-gradient-primary px-7 text-primary-foreground glow-primary transition-smooth hover:opacity-90 sm:w-auto"
            >
              <Link to="/register">
                Create account
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-ocid="home.sign_in_button"
              className="w-full rounded-full border-primary/40 bg-secondary/40 px-7 text-foreground transition-smooth hover:border-primary/70 hover:text-primary sm:w-auto"
            >
              <Link to="/login">Sign in</Link>
            </Button>
          </div>

          <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl px-3 py-4 text-center"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-xl font-bold text-primary sm:text-2xl">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </section>

      {/* Features */}
      <section
        data-ocid="home.features_section"
        aria-labelledby="features-title"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-title"
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Everything in one membership
          </h2>
          <p className="mt-3 text-muted-foreground">
            Rewards, referrals and withdrawals designed to stay clear and
            verifiable at every step.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              data-ocid={`home.feature_card.${index + 1}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.05,
              }}
              className="glass group rounded-2xl p-6 transition-smooth hover:border-primary/50"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-smooth group-hover:bg-primary/25">
                <feature.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Plan range */}
      <section
        data-ocid="home.plans_section"
        aria-labelledby="plans-title"
        className="rounded-3xl border border-border bg-card/50 px-6 py-12 sm:px-10"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="plans-title"
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Seven plans, one clear range
          </h2>
          <p className="mt-3 text-muted-foreground">
            From {formatCurrency(150)} to {formatCurrency(9999)} — pick the tier
            that matches your goals. Every plan runs for 30 days.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {planRange.map((plan) => (
            <li
              key={plan.name}
              data-ocid={`home.plan_tier.${plan.name.toLowerCase()}`}
              className={
                plan.popular
                  ? "glass-strong relative rounded-2xl p-4 text-center glow-primary"
                  : "glass rounded-2xl p-4 text-center transition-smooth hover:border-primary/40"
              }
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <p className="font-display text-sm font-semibold text-muted-foreground">
                {plan.name}
              </p>
              <p className="mt-2 font-display text-xl font-bold text-primary">
                {formatCurrency(plan.price)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            data-ocid="home.view_plans_button"
            className="rounded-full border-primary/40 bg-secondary/40 px-7 text-foreground transition-smooth hover:border-primary/70 hover:text-primary"
          >
            <Link to="/plans">
              Compare all plans
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        data-ocid="home.cta_section"
        className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-surface px-6 py-12 text-center sm:px-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto size-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <BadgeCheck
            className="mx-auto size-10 text-primary"
            aria-hidden="true"
          />
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start earning?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Create your account, activate a membership and track every reward
            from your dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              data-ocid="home.cta_create_account_button"
              className="w-full rounded-full bg-gradient-primary px-7 text-primary-foreground glow-primary transition-smooth hover:opacity-90 sm:w-auto"
            >
              <Link to="/register">
                Create account
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              data-ocid="home.support_link"
              className="w-full rounded-full px-7 text-foreground transition-smooth hover:text-primary sm:w-auto"
            >
              <Link to="/support">Visit support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
