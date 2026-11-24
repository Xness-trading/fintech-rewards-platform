import type { MembershipPlan } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { usePlans } from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  Crown,
  Gift,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

/** Per-plan accent icon, keyed by the plan's price tier. */
const PLAN_ICONS: Record<string, LucideIcon> = {
  "150": Sparkles,
  "300": ShieldCheck,
  "500": Crown,
  "999": BadgeCheck,
  "1999": TrendingUp,
  "4999": Gift,
  "9999": Crown,
};

function planIcon(plan: MembershipPlan): LucideIcon {
  return PLAN_ICONS[plan.price.toString()] ?? Sparkles;
}

export default function PlansPage() {
  const { data: plans, isLoading, isError, refetch } = usePlans();
  const navigate = useNavigate();

  const ordered = [...(plans ?? [])].sort((a, b) =>
    a.price < b.price ? -1 : a.price > b.price ? 1 : 0,
  );

  const handleBuy = (plan: MembershipPlan) => {
    void navigate({
      to: "/payment",
      search: { planId: plan.id.toString() },
    });
  };

  return (
    <div data-ocid="plans.page" className="pb-4">
      <PageHeader
        title="Membership plans"
        description="Seven tiers of eligibility-based rewards. Pick the one that fits your goals."
      />

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          Transparent, eligibility-based benefits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="size-4 text-accent" aria-hidden="true" />
          30-day validity on every plan
        </span>
      </div>

      {isLoading && <PlansSkeleton />}

      {isError && (
        <div
          data-ocid="plans.error_state"
          className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center"
        >
          <p className="font-display text-lg font-semibold">
            We couldn&apos;t load the plans
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Something went wrong while fetching membership plans. Please try
            again.
          </p>
          <button
            type="button"
            data-ocid="plans.retry_button"
            onClick={() => void refetch()}
            className="mt-1 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && ordered.length === 0 && (
        <div
          data-ocid="plans.empty_state"
          className="glass flex flex-col items-center gap-2 rounded-2xl px-6 py-12 text-center"
        >
          <Sparkles className="size-8 text-primary" aria-hidden="true" />
          <p className="font-display text-lg font-semibold">
            No plans available yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Membership plans will appear here as soon as they are published.
          </p>
        </div>
      )}

      {!isLoading && !isError && ordered.length > 0 && (
        <ul
          data-ocid="plans.list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {ordered.map((plan, index) => (
            <PlanCard
              key={plan.id.toString()}
              plan={plan}
              index={index}
              onBuy={handleBuy}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: MembershipPlan;
  index: number;
  onBuy: (plan: MembershipPlan) => void;
}

function PlanCard({ plan, index, onBuy }: PlanCardProps) {
  const Icon = planIcon(plan);
  const popular = plan.popular;

  return (
    <motion.li
      data-ocid={`plans.item.${index + 1}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col rounded-2xl p-6 transition-smooth",
        popular
          ? "glass-strong glow-primary border-primary/60"
          : "glass hover:border-primary/40 hover:shadow-glow",
      )}
    >
      {popular && (
        <span
          data-ocid="plans.popular_badge"
          className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-primary px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow"
        >
          <Crown className="size-3.5" aria-hidden="true" />
          Most popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            popular
              ? "bg-gradient-primary text-primary-foreground"
              : "bg-secondary text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold tracking-tight">
            {plan.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            {plan.validityDays.toString()}-day validity
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end gap-1.5">
        <span
          className={cn(
            "font-display text-4xl font-bold tracking-tight",
            popular && "text-gradient-primary",
          )}
        >
          {formatCurrency(plan.price)}
        </span>
        <span className="pb-1 text-xs text-muted-foreground">/ 30 days</span>
      </div>

      <div className="my-5 h-px bg-border" />

      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm">
            <Check
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="text-foreground/90">{benefit}</span>
          </li>
        ))}
      </ul>

      {plan.rewardDetails && (
        <div className="mt-5 rounded-xl border border-accent/25 bg-accent/5 px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <Gift className="size-3.5" aria-hidden="true" />
            Eligible rewards
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {plan.rewardDetails}
          </p>
        </div>
      )}

      <button
        type="button"
        data-ocid={`plans.buy_button.${index + 1}`}
        onClick={() => onBuy(plan)}
        className={cn(
          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-smooth",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          popular
            ? "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
            : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
        )}
      >
        Buy now
      </button>
    </motion.li>
  );
}

function PlansSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `plan-skeleton-${i}`);
  return (
    <ul
      data-ocid="plans.loading_state"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      {ids.map((id) => (
        <li
          key={id}
          className="glass flex flex-col gap-4 rounded-2xl p-6"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <div className="size-11 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </div>
          </div>
          <div className="h-9 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
          <div className="mt-auto h-11 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        </li>
      ))}
    </ul>
  );
}
