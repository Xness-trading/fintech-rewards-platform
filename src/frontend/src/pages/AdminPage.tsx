import type {
  MembershipPlan,
  PaymentView,
  ReferralView,
  SupportTicketView,
  UserProfileView,
  WithdrawalView,
} from "@/backend";
import { TicketStatus } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminApprovePayment,
  useAdminApproveReferralReward,
  useAdminApproveWithdrawal,
  useAdminMarkReferralEligible,
  useAdminMarkWithdrawalPaid,
  useAdminOverview,
  useAdminPayments,
  useAdminReferrals,
  useAdminRejectPayment,
  useAdminRejectReferral,
  useAdminRejectWithdrawal,
  useAdminSearchUsers,
  useAdminSetTicketStatus,
  useAdminSetUserBlocked,
  useAdminSettings,
  useAdminTickets,
  useAdminUpdatePlan,
  useAdminUpdateSettings,
  useAdminUsers,
  useAdminWithdrawals,
  usePlans,
} from "@/hooks/useQueries";
import { formatCurrency, formatDateTime, humanize } from "@/lib/format";
import {
  paymentTone,
  referralTone,
  ticketTone,
  withdrawalTone,
} from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Layers,
  LifeBuoy,
  Loader2,
  Search,
  Settings2,
  ShieldCheck,
  Ticket,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function shortPrincipal(principal: { toString(): string }): string {
  const text = principal.toString();
  return `${text.slice(0, 5)}…${text.slice(-3)}`;
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn("glass rounded-2xl border-0 py-0 shadow-none", className)}
    >
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  ocid,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-12 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="font-display font-semibold">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  const ids = Array.from({ length: rows }, (_, i) => `admin-skeleton-${i}`);
  return (
    <div className="space-y-3">
      {ids.map((id) => (
        <div
          key={id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "glass relative overflow-hidden rounded-2xl border-0 py-0 shadow-none",
        accent && "glow-primary",
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-gradient-primary text-primary-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight">
            {value}
          </p>
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  const { data, isLoading } = useAdminOverview();

  if (isLoading || !data) {
    return (
      <div
        data-ocid="admin.overview.loading_state"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, i) => `overview-skeleton-${i}`).map(
          (id) => (
            <Skeleton key={id} className="h-24 rounded-2xl" />
          ),
        )}
      </div>
    );
  }

  const metrics: Array<{
    label: string;
    value: string;
    icon: typeof Users;
    accent?: boolean;
  }> = [
    {
      label: "Total users",
      value: data.totalUsers.toString(),
      icon: Users,
      accent: true,
    },
    {
      label: "Active memberships",
      value: data.activeMemberships.toString(),
      icon: BadgeCheck,
    },
    {
      label: "Pending payments",
      value: data.pendingPayments.toString(),
      icon: Clock,
    },
    {
      label: "Verified payments",
      value: data.verifiedPayments.toString(),
      icon: CheckCircle2,
    },
    {
      label: "Payment volume",
      value: formatCurrency(data.totalPaymentAmount),
      icon: IndianRupee,
    },
    {
      label: "Pending withdrawals",
      value: data.pendingWithdrawals.toString(),
      icon: Wallet,
    },
    {
      label: "Total withdrawals",
      value: data.totalWithdrawals.toString(),
      icon: TrendingUp,
    },
    {
      label: "Referral rewards paid",
      value: formatCurrency(data.totalReferralRewards),
      icon: UserCheck,
    },
  ];

  return (
    <div
      data-ocid="admin.overview.section"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          icon={metric.icon}
          accent={metric.accent}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

function UserRow({
  user,
  index,
}: {
  user: UserProfileView;
  index: number;
}) {
  const setBlocked = useAdminSetUserBlocked();

  function toggleBlocked() {
    setBlocked.mutate(
      { user: user.principal, blocked: !user.blocked },
      {
        onSuccess: () =>
          toast.success(user.blocked ? "User unblocked" : "User blocked"),
        onError: () => toast.error("Could not update the user"),
      },
    );
  }

  return (
    <li
      data-ocid={`admin.users.item.${index + 1}`}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {user.fullName || "Unnamed user"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email || "—"} · {user.mobile || "—"}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {shortPrincipal(user.principal)} · joined{" "}
            {formatDateTime(user.registeredAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge
          label={user.blocked ? "Blocked" : "Active"}
          tone={user.blocked ? "danger" : "success"}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid={`admin.users.block_button.${index + 1}`}
          onClick={toggleBlocked}
          disabled={setBlocked.isPending}
          className={cn(
            "rounded-full transition-smooth",
            user.blocked
              ? "border-success/40 text-success hover:bg-success/10 hover:text-success"
              : "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          {setBlocked.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : user.blocked ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Ban className="size-4" aria-hidden="true" />
          )}
          {user.blocked ? "Unblock" : "Block"}
        </Button>
      </div>
    </li>
  );
}

function UsersTab() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(term.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [term]);

  const allUsers = useAdminUsers();
  const search = useAdminSearchUsers(debounced);
  const searching = debounced.length > 0;
  const users = searching ? search.data : allUsers.data;
  const isLoading = searching ? search.isLoading : allUsers.isLoading;

  return (
    <div data-ocid="admin.users.section" className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          data-ocid="admin.users.search_input"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by name, email or mobile"
          aria-label="Search users"
          className="rounded-xl pl-9"
        />
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : users && users.length > 0 ? (
        <ul data-ocid="admin.users.list" className="space-y-3">
          {users.map((user, index) => (
            <UserRow
              key={user.principal.toString()}
              user={user}
              index={index}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          ocid="admin.users.empty_state"
          title={searching ? "No matching users" : "No users yet"}
          description={
            searching
              ? "Try a different name, email or mobile number."
              : "Registered users will appear here once they sign up."
          }
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

function PaymentRow({
  payment,
  index,
}: {
  payment: PaymentView;
  index: number;
}) {
  const approve = useAdminApprovePayment();
  const reject = useAdminRejectPayment();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const pending = payment.status === "pending";

  function handleApprove() {
    approve.mutate(payment.id, {
      onSuccess: () => toast.success("Payment approved"),
      onError: () => toast.error("Could not approve the payment"),
    });
  }

  function handleReject() {
    const trimmed = reason.trim();
    if (!trimmed) return;
    reject.mutate(
      { paymentId: payment.id, reason: trimmed },
      {
        onSuccess: () => {
          toast.success("Payment rejected");
          setRejectOpen(false);
          setReason("");
        },
        onError: () => toast.error("Could not reject the payment"),
      },
    );
  }

  return (
    <li
      data-ocid={`admin.payments.item.${index + 1}`}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary/50"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CreditCard className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {payment.planName} · {formatCurrency(payment.amount)}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              UTR {payment.utr || "—"} · {shortPrincipal(payment.user)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Submitted {formatDateTime(payment.submittedAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge
            label={humanize(payment.status)}
            tone={paymentTone(payment.status)}
          />
          {pending && (
            <>
              <Button
                type="button"
                size="sm"
                data-ocid={`admin.payments.approve_button.${index + 1}`}
                onClick={handleApprove}
                disabled={approve.isPending}
                className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
              >
                {approve.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid={`admin.payments.reject_button.${index + 1}`}
                onClick={() => setRejectOpen(true)}
                className="rounded-full border-destructive/40 text-destructive transition-smooth hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" aria-hidden="true" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {payment.screenshot && (
        <p className="text-xs text-muted-foreground">
          Screenshot attached ({payment.screenshot.length} bytes)
        </p>
      )}
      {payment.rejectionReason && (
        <p className="text-xs text-destructive">
          Rejected: {payment.rejectionReason}
        </p>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent data-ocid="admin.payments.reject_dialog">
          <DialogHeader>
            <DialogTitle>Reject payment</DialogTitle>
            <DialogDescription>
              Give a reason for rejecting this payment. The user will see it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reject-payment-${payment.id}`}>Reason</Label>
            <Textarea
              id={`reject-payment-${payment.id}`}
              data-ocid="admin.payments.reject_reason_input"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. UTR does not match any received payment"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.payments.reject_cancel_button"
              onClick={() => setRejectOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.payments.reject_confirm_button"
              onClick={handleReject}
              disabled={reject.isPending || reason.trim().length === 0}
              className="rounded-full bg-destructive text-destructive-foreground transition-smooth hover:bg-destructive/90"
            >
              {reject.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Reject payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

function PaymentsTab() {
  const { data, isLoading } = useAdminPayments();

  if (isLoading) return <ListSkeleton />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        ocid="admin.payments.empty_state"
        title="No payments yet"
        description="Manual UPI payment submissions will appear here for review."
      />
    );
  }

  return (
    <ul data-ocid="admin.payments.list" className="space-y-3">
      {data.map((payment, index) => (
        <PaymentRow
          key={payment.id.toString()}
          payment={payment}
          index={index}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Withdrawals                                                         */
/* ------------------------------------------------------------------ */

function WithdrawalRow({
  withdrawal,
  index,
}: {
  withdrawal: WithdrawalView;
  index: number;
}) {
  const approve = useAdminApproveWithdrawal();
  const reject = useAdminRejectWithdrawal();
  const markPaid = useAdminMarkWithdrawalPaid();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [paidOpen, setPaidOpen] = useState(false);
  const [reference, setReference] = useState("");

  const isPending = withdrawal.status === "pending";
  const isApproved = withdrawal.status === "approved";

  function handleApprove() {
    approve.mutate(withdrawal.id, {
      onSuccess: () => toast.success("Withdrawal approved"),
      onError: () => toast.error("Could not approve the withdrawal"),
    });
  }

  function handleReject() {
    const trimmed = reason.trim();
    if (!trimmed) return;
    reject.mutate(
      { withdrawalId: withdrawal.id, reason: trimmed },
      {
        onSuccess: () => {
          toast.success("Withdrawal rejected");
          setRejectOpen(false);
          setReason("");
        },
        onError: () => toast.error("Could not reject the withdrawal"),
      },
    );
  }

  function handleMarkPaid() {
    const trimmed = reference.trim();
    if (!trimmed) return;
    markPaid.mutate(
      { withdrawalId: withdrawal.id, reference: trimmed },
      {
        onSuccess: () => {
          toast.success("Withdrawal marked as paid");
          setPaidOpen(false);
          setReference("");
        },
        onError: () => toast.error("Could not mark the withdrawal as paid"),
      },
    );
  }

  const payout = withdrawal.upi
    ? `UPI · ${withdrawal.upi.upiId} (${withdrawal.upi.accountHolderName})`
    : withdrawal.bank
      ? `Bank · ${withdrawal.bank.bankName} · A/C ${withdrawal.bank.accountNumber} · IFSC ${withdrawal.bank.ifscCode}`
      : "Payout details unavailable";

  return (
    <li
      data-ocid={`admin.withdrawals.item.${index + 1}`}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary/50"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {formatCurrency(withdrawal.amount)} ·{" "}
              {humanize(withdrawal.method)}
            </p>
            <p className="truncate text-xs text-muted-foreground">{payout}</p>
            <p className="truncate text-xs text-muted-foreground">
              Requested {formatDateTime(withdrawal.requestedAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge
            label={humanize(withdrawal.status)}
            tone={withdrawalTone(withdrawal.status)}
          />
          {isPending && (
            <>
              <Button
                type="button"
                size="sm"
                data-ocid={`admin.withdrawals.approve_button.${index + 1}`}
                onClick={handleApprove}
                disabled={approve.isPending}
                className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
              >
                {approve.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid={`admin.withdrawals.reject_button.${index + 1}`}
                onClick={() => setRejectOpen(true)}
                className="rounded-full border-destructive/40 text-destructive transition-smooth hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" aria-hidden="true" />
                Reject
              </Button>
            </>
          )}
          {isApproved && (
            <Button
              type="button"
              size="sm"
              data-ocid={`admin.withdrawals.mark_paid_button.${index + 1}`}
              onClick={() => setPaidOpen(true)}
              className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
            >
              <IndianRupee className="size-4" aria-hidden="true" />
              Mark paid
            </Button>
          )}
        </div>
      </div>

      {withdrawal.paymentReference && (
        <p className="text-xs text-muted-foreground">
          Reference: {withdrawal.paymentReference}
        </p>
      )}
      {withdrawal.rejectionReason && (
        <p className="text-xs text-destructive">
          Rejected: {withdrawal.rejectionReason}
        </p>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent data-ocid="admin.withdrawals.reject_dialog">
          <DialogHeader>
            <DialogTitle>Reject withdrawal</DialogTitle>
            <DialogDescription>
              Give a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reject-withdrawal-${withdrawal.id}`}>Reason</Label>
            <Textarea
              id={`reject-withdrawal-${withdrawal.id}`}
              data-ocid="admin.withdrawals.reject_reason_input"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Payout details could not be verified"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.withdrawals.reject_cancel_button"
              onClick={() => setRejectOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.withdrawals.reject_confirm_button"
              onClick={handleReject}
              disabled={reject.isPending || reason.trim().length === 0}
              className="rounded-full bg-destructive text-destructive-foreground transition-smooth hover:bg-destructive/90"
            >
              {reject.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Reject withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paidOpen} onOpenChange={setPaidOpen}>
        <DialogContent data-ocid="admin.withdrawals.paid_dialog">
          <DialogHeader>
            <DialogTitle>Mark withdrawal as paid</DialogTitle>
            <DialogDescription>
              Record the payment reference for this payout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`paid-withdrawal-${withdrawal.id}`}>
              Payment reference
            </Label>
            <Input
              id={`paid-withdrawal-${withdrawal.id}`}
              data-ocid="admin.withdrawals.paid_reference_input"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. UPI transaction id"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.withdrawals.paid_cancel_button"
              onClick={() => setPaidOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin.withdrawals.paid_confirm_button"
              onClick={handleMarkPaid}
              disabled={markPaid.isPending || reference.trim().length === 0}
              className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
            >
              {markPaid.isPending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Mark paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

function WithdrawalsTab() {
  const { data, isLoading } = useAdminWithdrawals();

  if (isLoading) return <ListSkeleton />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        ocid="admin.withdrawals.empty_state"
        title="No withdrawal requests"
        description="Payout requests from members will appear here for review."
      />
    );
  }

  return (
    <ul data-ocid="admin.withdrawals.list" className="space-y-3">
      {data.map((withdrawal, index) => (
        <WithdrawalRow
          key={withdrawal.id.toString()}
          withdrawal={withdrawal}
          index={index}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

function PlanEditor({
  plan,
  index,
}: {
  plan: MembershipPlan;
  index: number;
}) {
  const update = useAdminUpdatePlan();
  const [rewardDetails, setRewardDetails] = useState(plan.rewardDetails);
  const [benefits, setBenefits] = useState(plan.benefits.join("\n"));
  const [validityDays, setValidityDays] = useState(
    plan.validityDays.toString(),
  );

  const dirty =
    rewardDetails !== plan.rewardDetails ||
    benefits !== plan.benefits.join("\n") ||
    validityDays !== plan.validityDays.toString();

  function handleSave() {
    const days = Number.parseInt(validityDays, 10);
    if (!Number.isFinite(days) || days <= 0) {
      toast.error("Validity must be a positive number of days");
      return;
    }
    const benefitList = benefits
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    update.mutate(
      {
        planId: plan.id,
        update: {
          rewardDetails: rewardDetails.trim(),
          benefits: benefitList,
          validityDays: BigInt(days),
        },
      },
      {
        onSuccess: () => toast.success(`${plan.name} updated`),
        onError: () => toast.error("Could not update the plan"),
      },
    );
  }

  return (
    <SectionCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            {plan.name}
          </h3>
          <span className="font-display text-sm font-semibold text-primary">
            {formatCurrency(plan.price)}
          </span>
          {plan.popular && <StatusBadge label="Most popular" tone="pending" />}
        </div>
        <Button
          type="button"
          size="sm"
          data-ocid={`admin.plans.save_button.${index + 1}`}
          onClick={handleSave}
          disabled={update.isPending || !dirty}
          className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
        >
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          Save plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`plan-validity-${plan.id}`}>Validity (days)</Label>
          <Input
            id={`plan-validity-${plan.id}`}
            data-ocid={`admin.plans.validity_input.${index + 1}`}
            type="number"
            min={1}
            value={validityDays}
            onChange={(event) => setValidityDays(event.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`plan-reward-${plan.id}`}>Reward details</Label>
          <Input
            id={`plan-reward-${plan.id}`}
            data-ocid={`admin.plans.reward_input.${index + 1}`}
            value={rewardDetails}
            onChange={(event) => setRewardDetails(event.target.value)}
            placeholder="Describe the reward for this plan"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`plan-benefits-${plan.id}`}>
          Benefits (one per line)
        </Label>
        <Textarea
          id={`plan-benefits-${plan.id}`}
          data-ocid={`admin.plans.benefits_input.${index + 1}`}
          value={benefits}
          onChange={(event) => setBenefits(event.target.value)}
          rows={4}
          placeholder={"Priority support\nWeekly reward boost"}
        />
      </div>
    </SectionCard>
  );
}

function PlansTab() {
  const { data, isLoading } = usePlans();

  if (isLoading) return <ListSkeleton rows={3} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        ocid="admin.plans.empty_state"
        title="No plans configured"
        description="Membership plans will appear here once they are set up."
      />
    );
  }

  return (
    <div data-ocid="admin.plans.section" className="space-y-4">
      {data.map((plan, index) => (
        <PlanEditor key={plan.id.toString()} plan={plan} index={index} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Referrals                                                           */
/* ------------------------------------------------------------------ */

function ReferralRow({
  referral,
  index,
}: {
  referral: ReferralView;
  index: number;
}) {
  const markEligible = useAdminMarkReferralEligible();
  const approve = useAdminApproveReferralReward();
  const reject = useAdminRejectReferral();

  const busy = markEligible.isPending || approve.isPending || reject.isPending;

  return (
    <li
      data-ocid={`admin.referrals.item.${index + 1}`}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCheck className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {formatCurrency(referral.rewardAmount)} reward
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortPrincipal(referral.referrer)} →{" "}
            {shortPrincipal(referral.referred)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Created {formatDateTime(referral.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <StatusBadge
          label={humanize(referral.status)}
          tone={referralTone(referral.status)}
        />
        {referral.status === "pending" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid={`admin.referrals.eligible_button.${index + 1}`}
            onClick={() =>
              markEligible.mutate(referral.id, {
                onSuccess: () => toast.success("Referral marked eligible"),
                onError: () => toast.error("Could not update the referral"),
              })
            }
            disabled={busy}
            className="rounded-full border-primary/40 text-primary transition-smooth hover:bg-primary/10 hover:text-primary"
          >
            {markEligible.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <BadgeCheck className="size-4" aria-hidden="true" />
            )}
            Mark eligible
          </Button>
        )}
        {referral.status === "eligible" && (
          <>
            <Button
              type="button"
              size="sm"
              data-ocid={`admin.referrals.approve_button.${index + 1}`}
              onClick={() =>
                approve.mutate(referral.id, {
                  onSuccess: () => toast.success("Referral reward approved"),
                  onError: () => toast.error("Could not approve the reward"),
                })
              }
              disabled={busy}
              className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
            >
              {approve.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Check className="size-4" aria-hidden="true" />
              )}
              Approve reward
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid={`admin.referrals.reject_button.${index + 1}`}
              onClick={() =>
                reject.mutate(referral.id, {
                  onSuccess: () => toast.success("Referral rejected"),
                  onError: () => toast.error("Could not reject the referral"),
                })
              }
              disabled={busy}
              className="rounded-full border-destructive/40 text-destructive transition-smooth hover:bg-destructive/10 hover:text-destructive"
            >
              {reject.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <X className="size-4" aria-hidden="true" />
              )}
              Reject
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

function ReferralsTab() {
  const { data, isLoading } = useAdminReferrals();

  if (isLoading) return <ListSkeleton />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        ocid="admin.referrals.empty_state"
        title="No referrals yet"
        description="Referral records will appear here as members invite friends."
      />
    );
  }

  return (
    <ul data-ocid="admin.referrals.list" className="space-y-3">
      {data.map((referral, index) => (
        <ReferralRow
          key={referral.id.toString()}
          referral={referral}
          index={index}
        />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Support                                                             */
/* ------------------------------------------------------------------ */

const TICKET_STATUSES: TicketStatus[] = [
  TicketStatus.open,
  TicketStatus.inProgress,
  TicketStatus.resolved,
  TicketStatus.closed,
];

function TicketRow({
  ticket,
  index,
}: {
  ticket: SupportTicketView;
  index: number;
}) {
  const setStatus = useAdminSetTicketStatus();

  return (
    <li
      data-ocid={`admin.tickets.item.${index + 1}`}
      className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary/50"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Ticket className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {ticket.subject}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
              {ticket.message}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Opened {formatDateTime(ticket.createdAt)} · Updated{" "}
              {formatDateTime(ticket.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge
            label={humanize(ticket.status)}
            tone={ticketTone(ticket.status)}
          />
          <Select
            value={ticket.status}
            onValueChange={(value) =>
              setStatus.mutate(
                { ticketId: ticket.id, status: value as TicketStatus },
                {
                  onSuccess: () => toast.success("Ticket status updated"),
                  onError: () => toast.error("Could not update the ticket"),
                },
              )
            }
            disabled={setStatus.isPending}
          >
            <SelectTrigger
              data-ocid={`admin.tickets.status_select.${index + 1}`}
              aria-label={`Status for ${ticket.subject}`}
              className="w-36 rounded-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {humanize(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </li>
  );
}

function SupportTab() {
  const { data, isLoading } = useAdminTickets();

  if (isLoading) return <ListSkeleton />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={LifeBuoy}
        ocid="admin.tickets.empty_state"
        title="No support tickets"
        description="Member support requests will appear here for triage."
      />
    );
  }

  return (
    <ul data-ocid="admin.tickets.list" className="space-y-3">
      {data.map((ticket, index) => (
        <TicketRow key={ticket.id.toString()} ticket={ticket} index={index} />
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function SettingsTab() {
  const { data, isLoading } = useAdminSettings();
  const update = useAdminUpdateSettings();
  const [upiId, setUpiId] = useState("");
  const [minWithdrawal, setMinWithdrawal] = useState("");
  const [qrImage, setQrImage] = useState<Uint8Array | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setUpiId(data.companyUpiId);
      setMinWithdrawal(data.minWithdrawalAmount.toString());
      setQrImage(data.paymentQrImage);
      setInitialized(true);
    }
  }, [data, initialized]);

  if (isLoading || !data) {
    return (
      <div data-ocid="admin.settings.loading_state" className="space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  function handleSave() {
    const amount = Number.parseInt(minWithdrawal, 10);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Minimum withdrawal must be a valid amount");
      return;
    }
    update.mutate(
      {
        companyUpiId: upiId.trim(),
        minWithdrawalAmount: BigInt(amount),
        paymentQrImage: qrImage,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: () => toast.error("Could not save the settings"),
      },
    );
  }

  async function handleQrChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    setQrImage(new Uint8Array(buffer));
  }

  return (
    <SectionCard className="space-y-5">
      <div className="flex items-center gap-2 text-primary">
        <Settings2 className="size-4" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Platform settings
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-upi">Company UPI ID</Label>
          <Input
            id="settings-upi"
            data-ocid="admin.settings.upi_input"
            value={upiId}
            onChange={(event) => setUpiId(event.target.value)}
            placeholder="company@upi"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-min">Minimum withdrawal amount (₹)</Label>
          <Input
            id="settings-min"
            data-ocid="admin.settings.min_withdrawal_input"
            type="number"
            min={0}
            value={minWithdrawal}
            onChange={(event) => setMinWithdrawal(event.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-qr">Payment QR image</Label>
        <Input
          id="settings-qr"
          data-ocid="admin.settings.qr_input"
          type="file"
          accept="image/*"
          onChange={handleQrChange}
          className="rounded-xl file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary"
        />
        <p className="text-xs text-muted-foreground">
          {qrImage
            ? `Current QR image loaded (${qrImage.length} bytes). Upload a new file to replace it.`
            : "No QR image uploaded yet."}
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          data-ocid="admin.settings.save_button"
          onClick={handleSave}
          disabled={update.isPending}
          className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
        >
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          Save settings
        </Button>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const TABS = [
  { value: "overview", label: "Overview", icon: TrendingUp },
  { value: "users", label: "Users", icon: Users },
  { value: "payments", label: "Payments", icon: CreditCard },
  { value: "withdrawals", label: "Withdrawals", icon: Wallet },
  { value: "plans", label: "Plans", icon: Layers },
  { value: "referrals", label: "Referrals", icon: UserCheck },
  { value: "support", label: "Support", icon: LifeBuoy },
  { value: "settings", label: "Settings", icon: Settings2 },
] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<string>("overview");
  const reduceMotion = useReducedMotion();

  return (
    <div data-ocid="admin.page" className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Admin console"
        description="Review payments, payouts, members and platform settings."
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Secure area
          </span>
        }
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
        }
      >
        <Tabs value={tab} onValueChange={setTab} className="gap-6">
          <TabsList
            data-ocid="admin.tabs"
            className="glass h-auto w-full flex-wrap justify-start gap-1 rounded-2xl border-0 p-1.5"
          >
            {TABS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                data-ocid={`admin.tab.${item.value}`}
                className="gap-2 rounded-xl px-3 py-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>
          <TabsContent value="withdrawals">
            <WithdrawalsTab />
          </TabsContent>
          <TabsContent value="plans">
            <PlansTab />
          </TabsContent>
          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>
          <TabsContent value="support">
            <SupportTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
