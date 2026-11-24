import { TransactionType } from "@/backend";
import type { WalletTransactionView } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyTransactions } from "@/hooks/useQueries";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import { transactionTone } from "@/lib/status";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

type FilterValue = "all" | TransactionType;

interface FilterOption {
  value: FilterValue;
  label: string;
}

const FILTERS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: TransactionType.payment, label: "Payments" },
  { value: TransactionType.reward, label: "Rewards" },
  { value: TransactionType.referral, label: "Referrals" },
  { value: TransactionType.withdrawal, label: "Withdrawals" },
];

const FILTER_VALUES = new Set<string>(FILTERS.map((option) => option.value));

function normalizeFilter(value: string | undefined): FilterValue {
  return value && FILTER_VALUES.has(value) ? (value as FilterValue) : "all";
}

/** Human label for a transaction type, e.g. "payment" -> "Payment". */
function typeLabel(type: TransactionType): string {
  return humanize(type);
}

/** Payment method shown for a transaction, derived from its type. */
function methodLabel(type: TransactionType): string {
  switch (type) {
    case TransactionType.payment:
      return "UPI / Bank transfer";
    case TransactionType.withdrawal:
      return "Payout";
    case TransactionType.reward:
      return "Reward credit";
    case TransactionType.referral:
      return "Referral bonus";
    default:
      return "—";
  }
}

export default function TransactionsPage() {
  const search = useSearch({ from: "/shell/transactions" });
  const navigate = useNavigate();
  const activeFilter = normalizeFilter(search.filter);

  const { data: transactions, isLoading } = useMyTransactions();

  const rows = transactions ?? [];
  const filtered =
    activeFilter === "all"
      ? rows
      : rows.filter((tx) => tx.txType === activeFilter);

  const totalIn = filtered
    .filter((tx) => tx.kind === "credit")
    .reduce((sum, tx) => sum + tx.amount, 0n);
  const totalOut = filtered
    .filter((tx) => tx.kind === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0n);

  function selectFilter(value: FilterValue) {
    void navigate({
      to: "/transactions",
      search: value === "all" ? {} : { filter: value },
      replace: true,
    });
  }

  return (
    <div data-ocid="transactions.page">
      <PageHeader
        title="Transaction history"
        description="Every credit and debit on your account."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <SummaryCard
          label="Money in"
          value={formatCurrency(totalIn)}
          tone="in"
          data-ocid="transactions.summary.in"
        />
        <SummaryCard
          label="Money out"
          value={formatCurrency(totalOut)}
          tone="out"
          data-ocid="transactions.summary.out"
        />
      </div>

      <div
        role="tablist"
        aria-label="Filter transactions"
        className="mb-4 flex flex-wrap gap-2"
      >
        {FILTERS.map((option) => {
          const active = option.value === activeFilter;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              data-ocid={`transactions.filter.${option.value}`}
              onClick={() => selectFilter(option.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-transparent bg-gradient-primary text-primary-foreground glow-primary"
                  : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5" data-ocid="transactions.loading_state">
            {Array.from({ length: 5 }, (_, i) => `tx-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-12 w-full rounded-lg" />
              ),
            )}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filtered={activeFilter !== "all"} />
        ) : (
          <Table data-ocid="transactions.table">
            <TableHeader>
              <TableRow className="border-border/70 hover:bg-transparent">
                <TableHead className="px-4 text-xs uppercase tracking-wider text-muted-foreground">
                  Transaction ID
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Payment method
                </TableHead>
                <TableHead className="pr-4 text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx, index) => (
                <TransactionRow
                  key={tx.id.toString()}
                  tx={tx}
                  index={index + 1}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function TransactionRow({
  tx,
  index,
}: {
  tx: WalletTransactionView;
  index: number;
}) {
  const isCredit = tx.kind === "credit";
  return (
    <TableRow
      data-ocid={`transactions.row.${index}`}
      className="border-border/60 transition-colors hover:bg-primary/5"
    >
      <TableCell className="px-4 font-mono text-xs text-muted-foreground">
        #{tx.id.toString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full",
              isCredit
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {isCredit ? (
              <ArrowDownLeft className="size-4" aria-hidden="true" />
            ) : (
              <ArrowUpRight className="size-4" aria-hidden="true" />
            )}
          </span>
          <span className="font-medium text-foreground">
            {typeLabel(tx.txType)}
          </span>
        </div>
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono font-semibold tabular-nums",
          isCredit ? "text-success" : "text-foreground",
        )}
      >
        {isCredit ? "+" : "−"}
        {formatCurrency(tx.amount)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDateTime(tx.createdAt)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {methodLabel(tx.txType)}
      </TableCell>
      <TableCell className="pr-4">
        <StatusBadge
          label={humanize(tx.status)}
          tone={transactionTone(tx.status)}
        />
      </TableCell>
    </TableRow>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  ...rest
}: {
  label: string;
  value: string;
  tone: "in" | "out";
  "data-ocid": string;
}) {
  return (
    <div
      {...rest}
      className="glass rounded-2xl p-4 transition-smooth hover:border-primary/40"
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-2xl font-bold tabular-nums",
          tone === "in" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      data-ocid="transactions.empty_state"
      className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Receipt className="size-7" aria-hidden="true" />
      </span>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {filtered ? "No matching transactions" : "No transactions yet"}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {filtered
          ? "Try a different filter to see other activity on your account."
          : "Your payments, rewards, referrals and withdrawals will appear here."}
      </p>
    </div>
  );
}
