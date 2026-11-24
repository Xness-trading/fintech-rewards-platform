import { TransactionKind } from "@/backend";
import type { WalletTransactionView } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTransactions, useWalletSummary } from "@/hooks/useQueries";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import { transactionTone } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  History,
  PiggyBank,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface BalanceStat {
  key: string;
  label: string;
  value: bigint;
  icon: LucideIcon;
  accent: string;
}

const SKELETON_IDS = Array.from(
  { length: 5 },
  (_, i) => `wallet-skeleton-${i}`,
);

export default function WalletPage() {
  const summaryQuery = useWalletSummary();
  const transactionsQuery = useMyTransactions();
  const reduceMotion = useReducedMotion();

  const summary = summaryQuery.data ?? null;
  const transactions = transactionsQuery.data ?? [];

  const stats: BalanceStat[] = [
    {
      key: "available",
      label: "Available Balance",
      value: summary?.availableBalance ?? 0n,
      icon: Wallet,
      accent: "text-primary",
    },
    {
      key: "withdrawable",
      label: "Withdrawable Balance",
      value: summary?.withdrawableBalance ?? 0n,
      icon: PiggyBank,
      accent: "text-accent",
    },
    {
      key: "totalRewards",
      label: "Total Rewards",
      value: summary?.totalRewards ?? 0n,
      icon: Gift,
      accent: "text-primary",
    },
    {
      key: "referralRewards",
      label: "Referral Rewards",
      value: summary?.referralRewards ?? 0n,
      icon: Users,
      accent: "text-accent",
    },
    {
      key: "pendingRewards",
      label: "Pending Rewards",
      value: summary?.pendingRewards ?? 0n,
      icon: History,
      accent: "text-warning",
    },
    {
      key: "totalWithdrawals",
      label: "Total Withdrawals",
      value: summary?.totalWithdrawals ?? 0n,
      icon: ArrowUpRight,
      accent: "text-muted-foreground",
    },
  ];

  const isLoading = summaryQuery.isLoading || transactionsQuery.isLoading;

  return (
    <div data-ocid="wallet.page" className="space-y-8">
      <PageHeader
        title="Wallet"
        description="Your balances, rewards and every credit and debit on your account."
      />

      {/* Balance overview */}
      <section data-ocid="wallet.section.balances" aria-label="Wallet balances">
        {summaryQuery.isLoading ? (
          <div
            data-ocid="wallet.loading_state"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SKELETON_IDS.map((id) => (
              <Skeleton key={id} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.35, delay: index * 0.05 }
                }
              >
                <Card
                  data-ocid={`wallet.card.${stat.key}`}
                  className="glass h-full gap-3 rounded-2xl border-border/60 py-5 shadow-none"
                >
                  <CardHeader className="px-5">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/50",
                          stat.accent,
                        )}
                      >
                        <stat.icon className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5">
                    <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
                      {formatCurrency(stat.value)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Transaction history */}
      <section
        data-ocid="wallet.section.history"
        aria-label="Transaction history"
      >
        <Card className="glass overflow-hidden rounded-2xl border-border/60 shadow-none">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <CardTitle className="font-display text-lg font-semibold">
              Credit &amp; debit history
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                data-ocid="wallet.history.loading_state"
                className="space-y-3 p-5"
              >
                {SKELETON_IDS.map((id) => (
                  <Skeleton key={id} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div
                data-ocid="wallet.history.empty_state"
                className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                  <History className="size-6" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="font-display text-base font-semibold">
                    No transactions yet
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Your credits and debits will appear here once your first
                    reward or withdrawal is processed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  data-ocid="wallet.history.table"
                  className="w-full min-w-[640px] border-collapse text-sm"
                >
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="px-5 py-3 font-medium">
                        Transaction ID
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-right font-medium"
                      >
                        Amount
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Date &amp; time
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <TransactionRow
                        key={tx.id.toString()}
                        tx={tx}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface TransactionRowProps {
  tx: WalletTransactionView;
  index: number;
}

function TransactionRow({ tx, index }: TransactionRowProps) {
  const isCredit = tx.kind === TransactionKind.credit;
  return (
    <tr
      data-ocid={`wallet.history.row.${index + 1}`}
      className="border-b border-border/40 transition-smooth last:border-0 hover:bg-muted/30"
    >
      <td className="px-5 py-3.5">
        <span className="font-mono text-xs text-muted-foreground">
          #{tx.id.toString()}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full",
              isCredit
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {isCredit ? (
              <ArrowDownLeft className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            )}
          </span>
          <span className="font-medium">{humanize(tx.txType)}</span>
        </div>
      </td>
      <td
        className={cn(
          "px-5 py-3.5 text-right font-mono font-semibold tabular-nums",
          isCredit ? "text-success" : "text-destructive",
        )}
      >
        {isCredit ? "+" : "−"}
        {formatCurrency(tx.amount)}
      </td>
      <td className="px-5 py-3.5 text-muted-foreground">
        {formatDateTime(tx.createdAt)}
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge
          label={humanize(tx.status)}
          tone={transactionTone(tx.status)}
        />
      </td>
    </tr>
  );
}
