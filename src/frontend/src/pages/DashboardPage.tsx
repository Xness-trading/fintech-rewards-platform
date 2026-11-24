import { PaymentStatus, TransactionKind } from "@/backend";
import type {
  MembershipPlan,
  PaymentView,
  WalletTransactionView,
} from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCallerProfile,
  useMyPayments,
  useMyTransactions,
  usePlans,
  useReferralSummary,
  useWalletSummary,
} from "@/hooks/useQueries";
import { formatCurrency, formatDate, humanize } from "@/lib/format";
import { transactionTone } from "@/lib/status";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Gift,
  Receipt,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const DAY_MS = 24 * 60 * 60 * 1000;

interface ActiveMembership {
  planName: string;
  expiresAt: Date;
}

/** Derive the caller's active membership from their most recent approved payment. */
function deriveMembership(
  payments: PaymentView[] | undefined,
  plans: MembershipPlan[] | undefined,
): ActiveMembership | null {
  if (!payments || payments.length === 0) return null;
  const approved = payments
    .filter((p) => p.status === PaymentStatus.approved)
    .sort((a, b) =>
      Number((b.reviewedAt ?? b.submittedAt) - (a.reviewedAt ?? a.submittedAt)),
    );
  const latest = approved[0];
  if (!latest) return null;

  const plan = plans?.find((p) => p.id === latest.planId);
  const validityDays = plan ? Number(plan.validityDays) : 30;
  const startMs = Number(
    (latest.reviewedAt ?? latest.submittedAt) / 1_000_000n,
  );
  const expiresAt = new Date(startMs + validityDays * DAY_MS);
  return { planName: latest.planName, expiresAt };
}

const quickActions: {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    to: "/plans",
    label: "Plans",
    description: "Explore memberships",
    icon: CreditCard,
  },
  {
    to: "/wallet",
    label: "Wallet",
    description: "Balances & rewards",
    icon: Wallet,
  },
  {
    to: "/referral",
    label: "Referral",
    description: "Invite & earn",
    icon: Users,
  },
  {
    to: "/withdraw",
    label: "Withdraw",
    description: "Cash out rewards",
    icon: Gift,
  },
  {
    to: "/profile",
    label: "Profile",
    description: "Account details",
    icon: User,
  },
  {
    to: "/transactions",
    label: "History",
    description: "All transactions",
    icon: Receipt,
  },
];

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: wallet, isLoading: walletLoading } = useWalletSummary();
  const { data: referral, isLoading: referralLoading } = useReferralSummary();
  const { data: transactions, isLoading: txLoading } = useMyTransactions();
  const { data: payments, isLoading: paymentsLoading } = useMyPayments();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const membership = deriveMembership(payments, plans);
  const recentTransactions = (transactions ?? []).slice(0, 5);
  const firstName = profile?.fullName?.trim().split(/\s+/)[0] ?? "there";

  return (
    <div data-ocid="dashboard.page" className="space-y-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is how your rewards are performing today."
      />

      {/* Summary tiles */}
      <section
        aria-label="Account summary"
        data-ocid="dashboard.summary.section"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryTile
          data-ocid="dashboard.balance.card"
          icon={Wallet}
          label="Available balance"
          value={formatCurrency(wallet?.availableBalance ?? 0n)}
          hint="Ready to withdraw"
          loading={walletLoading}
          accent
        />
        <SummaryTile
          data-ocid="dashboard.rewards.card"
          icon={TrendingUp}
          label="Total rewards earned"
          value={formatCurrency(wallet?.totalRewards ?? 0n)}
          hint={`${formatCurrency(wallet?.pendingRewards ?? 0n)} pending`}
          loading={walletLoading}
        />
        <SummaryTile
          data-ocid="dashboard.referrals.card"
          icon={Users}
          label="Total referrals"
          value={String(referral?.totalReferrals ?? 0n)}
          hint={`${String(referral?.successfulReferrals ?? 0n)} successful`}
          loading={referralLoading}
        />
        <MembershipTile
          membership={membership}
          loading={paymentsLoading || plansLoading || profileLoading}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent transactions */}
        <section
          aria-label="Recent transactions"
          data-ocid="dashboard.transactions.section"
          className="lg:col-span-3"
        >
          <Card className="glass gap-0 overflow-hidden rounded-2xl border-border/60 py-0 shadow-none">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" aria-hidden="true" />
                <h2 className="font-display text-base font-semibold">
                  Recent transactions
                </h2>
              </div>
              <Link
                to="/transactions"
                data-ocid="dashboard.transactions.link"
                className="text-xs font-medium text-primary underline-offset-4 transition-smooth hover:underline"
              >
                View all
              </Link>
            </div>

            {txLoading ? (
              <ul className="divide-y divide-border/50">
                {Array.from({ length: 4 }, (_, i) => `tx-skeleton-${i}`).map(
                  (id) => (
                    <li key={id} className="flex items-center gap-3 px-5 py-4">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </li>
                  ),
                )}
              </ul>
            ) : recentTransactions.length === 0 ? (
              <div
                data-ocid="dashboard.transactions.empty_state"
                className="flex flex-col items-center gap-3 px-6 py-12 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                  <Receipt className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">No transactions yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your credits and debits will appear here once you start
                    earning.
                  </p>
                </div>
                <Link
                  to="/plans"
                  data-ocid="dashboard.transactions.empty_state.button"
                  className="mt-1 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Browse plans
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentTransactions.map((tx, index) => (
                  <TransactionRow
                    key={tx.id.toString()}
                    tx={tx}
                    index={index + 1}
                  />
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Quick access */}
        <section
          aria-label="Quick access"
          data-ocid="dashboard.quick_access.section"
          className="lg:col-span-2"
        >
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Quick access
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.to}
                action={action}
                index={index + 1}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface SummaryTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  loading: boolean;
  accent?: boolean;
  "data-ocid": string;
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  loading,
  accent = false,
  "data-ocid": ocid,
}: SummaryTileProps) {
  return (
    <Card
      data-ocid={ocid}
      className={cn(
        "glass gap-0 rounded-2xl border-border/60 py-5 shadow-none",
        accent && "glow-primary",
      )}
    >
      <div className="flex items-start justify-between px-5">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            accent
              ? "bg-gradient-primary text-primary-foreground"
              : "bg-muted/50 text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 px-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-28" />
        ) : (
          <p className="mt-1 font-display text-2xl font-bold tracking-tight">
            {value}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </Card>
  );
}

function MembershipTile({
  membership,
  loading,
}: {
  membership: ActiveMembership | null;
  loading: boolean;
}) {
  return (
    <Card
      data-ocid="dashboard.membership.card"
      className="glass gap-0 rounded-2xl border-border/60 py-5 shadow-none"
    >
      <div className="flex items-start justify-between px-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-accent">
          <BadgeCheck className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 px-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Active membership
        </p>
        {loading ? (
          <>
            <Skeleton className="mt-2 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </>
        ) : membership ? (
          <>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight">
              {membership.planName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Expires{" "}
              {formatDate(BigInt(membership.expiresAt.getTime()) * 1_000_000n)}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight text-muted-foreground">
              No active plan
            </p>
            <Link
              to="/plans"
              data-ocid="dashboard.membership.card.button"
              className="mt-1 inline-block text-xs font-medium text-primary underline-offset-4 transition-smooth hover:underline"
            >
              Choose a membership
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}

function TransactionRow({
  tx,
  index,
}: {
  tx: WalletTransactionView;
  index: number;
}) {
  const isCredit = tx.kind === TransactionKind.credit;
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
  return (
    <li
      data-ocid={`dashboard.transactions.item.${index}`}
      className="flex items-center gap-3 px-5 py-4 transition-smooth hover:bg-muted/30"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          isCredit
            ? "bg-success/15 text-success"
            : "bg-destructive/15 text-destructive",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{humanize(tx.txType)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(tx.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "font-mono text-sm font-semibold",
            isCredit ? "text-success" : "text-foreground",
          )}
        >
          {isCredit ? "+" : "−"}
          {formatCurrency(tx.amount)}
        </span>
        <StatusBadge
          label={humanize(tx.status)}
          tone={transactionTone(tx.status)}
        />
      </div>
    </li>
  );
}

function QuickActionCard({
  action,
  index,
}: {
  action: (typeof quickActions)[number];
  index: number;
}) {
  const Icon = action.icon;
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.3, delay: index * 0.04 }
      }
    >
      <Link
        to={action.to}
        data-ocid={`dashboard.quick_access.item.${index}`}
        className="glass group flex h-full flex-col gap-3 rounded-2xl border-border/60 p-4 transition-smooth hover:border-primary/50 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-primary transition-smooth group-hover:bg-gradient-primary group-hover:text-primary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {action.label}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {action.description}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
