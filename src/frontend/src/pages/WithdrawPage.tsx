import type { WithdrawalView } from "@/backend";
import { WithdrawalMethod, WithdrawalStatus } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminSettings,
  useMyWithdrawals,
  useRequestBankWithdrawal,
  useRequestUpiWithdrawal,
  useWalletSummary,
} from "@/hooks/useQueries";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { withdrawalTone } from "@/lib/status";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

const STATUS_ORDER: WithdrawalStatus[] = [
  WithdrawalStatus.pending,
  WithdrawalStatus.approved,
  WithdrawalStatus.rejected,
  WithdrawalStatus.completed,
];

const STATUS_LABEL: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.pending]: "Pending",
  [WithdrawalStatus.approved]: "Approved",
  [WithdrawalStatus.rejected]: "Rejected",
  [WithdrawalStatus.completed]: "Completed",
};

/** Parse a rupee amount typed by the user into a whole-rupee bigint. */
function parseAmount(raw: string): bigint | null {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (cleaned.length === 0) return null;
  try {
    return BigInt(cleaned);
  } catch {
    return null;
  }
}

interface MethodFormProps {
  method: WithdrawalMethod;
  withdrawable: bigint;
  minimum: bigint;
}

function MethodForm({ method, withdrawable, minimum }: MethodFormProps) {
  const isUpi = method === WithdrawalMethod.upi;
  const upiMutation = useRequestUpiWithdrawal();
  const bankMutation = useRequestBankWithdrawal();
  const mutation = isUpi ? upiMutation : bankMutation;

  const [accountHolderName, setAccountHolderName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const amountValue = parseAmount(amount);

  function validate(): string | null {
    if (accountHolderName.trim().length < 2) {
      return "Enter the account holder name.";
    }
    if (isUpi) {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        return "Enter a valid UPI ID, for example name@bank.";
      }
    } else {
      if (bankName.trim().length < 2) return "Enter the bank name.";
      if (!/^\d{9,18}$/.test(accountNumber.trim())) {
        return "Enter a valid account number (9–18 digits).";
      }
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode.trim())) {
        return "Enter a valid IFSC code, for example HDFC0001234.";
      }
    }
    if (amountValue === null || amountValue <= 0n) {
      return "Enter a withdrawal amount.";
    }
    if (amountValue > withdrawable) {
      return `Amount exceeds your withdrawable balance of ${formatCurrency(withdrawable)}.`;
    }
    if (amountValue < minimum) {
      return `Minimum withdrawal amount is ${formatCurrency(minimum)}.`;
    }
    return null;
  }

  function resetFields() {
    setAccountHolderName("");
    setUpiId("");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setAmount("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    const parsedAmount = amountValue as bigint;

    const onError = (message: string) => {
      setError(message);
    };

    if (isUpi) {
      upiMutation.mutate(
        {
          accountHolderName: accountHolderName.trim(),
          upiId: upiId.trim(),
          amount: parsedAmount,
        },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") {
              resetFields();
              setSuccess(
                `UPI withdrawal request for ${formatCurrency(parsedAmount)} submitted for review.`,
              );
            } else {
              onError(result.err);
            }
          },
          onError: () =>
            onError("Could not submit the request. Please try again."),
        },
      );
    } else {
      bankMutation.mutate(
        {
          accountHolderName: accountHolderName.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          amount: parsedAmount,
        },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "ok") {
              resetFields();
              setSuccess(
                `Bank withdrawal request for ${formatCurrency(parsedAmount)} submitted for review.`,
              );
            } else {
              onError(result.err);
            }
          },
          onError: () =>
            onError("Could not submit the request. Please try again."),
        },
      );
    }
  }

  const prefix = isUpi ? "withdraw.upi" : "withdraw.bank";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}-holder`}>Account holder name</Label>
        <Input
          id={`${prefix}-holder`}
          data-ocid={`${prefix}.input.holder`}
          value={accountHolderName}
          onChange={(e) => setAccountHolderName(e.target.value)}
          placeholder="As per bank records"
          autoComplete="name"
        />
      </div>

      {isUpi ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${prefix}-upi`}>UPI ID</Label>
          <Input
            id={`${prefix}-upi`}
            data-ocid={`${prefix}.input.upi_id`}
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="name@bank"
            autoComplete="off"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${prefix}-bank`}>Bank name</Label>
            <Input
              id={`${prefix}-bank`}
              data-ocid={`${prefix}.input.bank_name`}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="State Bank of India"
              autoComplete="organization"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${prefix}-account`}>Account number</Label>
            <Input
              id={`${prefix}-account`}
              data-ocid={`${prefix}.input.account_number`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="9–18 digit account number"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${prefix}-ifsc`}>IFSC code</Label>
            <Input
              id={`${prefix}-ifsc`}
              data-ocid={`${prefix}.input.ifsc`}
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="HDFC0001234"
              autoComplete="off"
              className="font-mono uppercase"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}-amount`}>Withdrawal amount (₹)</Label>
        <Input
          id={`${prefix}-amount`}
          data-ocid={`${prefix}.input.amount`}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          inputMode="numeric"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Available {formatCurrency(withdrawable)} · Minimum{" "}
          {formatCurrency(minimum)}
        </p>
      </div>

      {error && (
        <p
          data-ocid={`${prefix}.error_state`}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {success && (
        <output
          data-ocid={`${prefix}.success_state`}
          className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </output>
      )}

      <Button
        type="submit"
        data-ocid={`${prefix}.submit_button`}
        disabled={mutation.isPending}
        className="glow-primary w-full rounded-full font-semibold"
      >
        {mutation.isPending ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}

function WithdrawalRow({
  withdrawal,
  index,
}: {
  withdrawal: WithdrawalView;
  index: number;
}) {
  const isUpi = withdrawal.method === WithdrawalMethod.upi;
  const destination = isUpi
    ? withdrawal.upi?.upiId
    : withdrawal.bank
      ? `${withdrawal.bank.bankName} · ${withdrawal.bank.accountNumber}`
      : undefined;

  return (
    <li
      data-ocid={`withdraw.item.${index + 1}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isUpi ? (
            <Smartphone className="size-4" aria-hidden="true" />
          ) : (
            <Landmark className="size-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold">
            {formatCurrency(withdrawal.amount)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {isUpi ? "UPI" : "Bank"}
            {destination ? ` · ${destination}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Requested {formatDateTime(withdrawal.requestedAt)}
          </p>
          {withdrawal.rejectionReason && (
            <p className="mt-1 text-xs text-destructive">
              Reason: {withdrawal.rejectionReason}
            </p>
          )}
          {withdrawal.paymentReference && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Ref: {withdrawal.paymentReference}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 sm:text-right">
        <StatusBadge
          label={STATUS_LABEL[withdrawal.status]}
          tone={withdrawalTone(withdrawal.status)}
        />
      </div>
    </li>
  );
}

function WithdrawalList({
  withdrawals,
  emptyLabel,
}: {
  withdrawals: WithdrawalView[];
  emptyLabel: string;
}) {
  if (withdrawals.length === 0) {
    return (
      <div
        data-ocid="withdraw.empty_state"
        className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center"
      >
        <Wallet className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <ul data-ocid="withdraw.list" className="flex flex-col gap-3">
      {withdrawals.map((withdrawal, index) => (
        <WithdrawalRow
          key={withdrawal.id.toString()}
          withdrawal={withdrawal}
          index={index}
        />
      ))}
    </ul>
  );
}

export default function WithdrawPage() {
  const { data: wallet, isLoading: walletLoading } = useWalletSummary();
  const { data: settings, isLoading: settingsLoading } = useAdminSettings();
  const { data: withdrawals, isLoading: withdrawalsLoading } =
    useMyWithdrawals();

  const withdrawable = wallet?.withdrawableBalance ?? 0n;
  const minimum = settings?.minWithdrawalAmount ?? 0n;

  const grouped = useMemo(() => {
    const map = new Map<WithdrawalStatus, WithdrawalView[]>();
    for (const status of STATUS_ORDER) map.set(status, []);
    for (const withdrawal of withdrawals ?? []) {
      map.get(withdrawal.status)?.push(withdrawal);
    }
    return map;
  }, [withdrawals]);

  const history = useMemo(
    () =>
      [...(withdrawals ?? [])].sort((a, b) =>
        a.requestedAt < b.requestedAt
          ? 1
          : a.requestedAt > b.requestedAt
            ? -1
            : 0,
      ),
    [withdrawals],
  );

  const loading = walletLoading || settingsLoading;

  return (
    <div data-ocid="withdraw.page" className="flex flex-col gap-6">
      <PageHeader
        title="Withdraw"
        description="Move your rewards to UPI or a bank account. Every request is reviewed by an admin."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass rounded-lg border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" aria-hidden="true" />
              Withdrawable balance
            </CardDescription>
            <CardTitle className="font-display text-3xl">
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <span data-ocid="withdraw.balance">
                  {formatCurrency(withdrawable)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Pending rewards are released once your referrals are approved.
            </p>
          </CardContent>
        </Card>

        <Card className="glass rounded-lg border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Banknote className="size-4 text-accent" aria-hidden="true" />
              Minimum withdrawal
            </CardDescription>
            <CardTitle className="font-display text-3xl">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <span data-ocid="withdraw.minimum">
                  {formatCurrency(minimum)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Requests below this amount are rejected automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-strong rounded-lg border-0 shadow-none">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Request a withdrawal
          </CardTitle>
          <CardDescription>
            Choose UPI for instant transfers or bank for direct deposit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={WithdrawalMethod.upi} data-ocid="withdraw.tabs">
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger
                value={WithdrawalMethod.upi}
                data-ocid="withdraw.tab.upi"
              >
                <Smartphone className="size-4" aria-hidden="true" />
                UPI
              </TabsTrigger>
              <TabsTrigger
                value={WithdrawalMethod.bank}
                data-ocid="withdraw.tab.bank"
              >
                <Landmark className="size-4" aria-hidden="true" />
                Bank
              </TabsTrigger>
            </TabsList>
            <TabsContent value={WithdrawalMethod.upi}>
              <MethodForm
                method={WithdrawalMethod.upi}
                withdrawable={withdrawable}
                minimum={minimum}
              />
            </TabsContent>
            <TabsContent value={WithdrawalMethod.bank}>
              <MethodForm
                method={WithdrawalMethod.bank}
                withdrawable={withdrawable}
                minimum={minimum}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold">Your withdrawals</h2>
        {withdrawalsLoading ? (
          <div
            data-ocid="withdraw.loading_state"
            className="flex flex-col gap-3"
          >
            {Array.from({ length: 3 }, (_, i) => `withdraw-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-20 w-full rounded-xl" />
              ),
            )}
          </div>
        ) : (
          <Tabs defaultValue="all" data-ocid="withdraw.status.tabs">
            <TabsList className="mb-4 flex w-full flex-wrap sm:w-auto">
              <TabsTrigger value="all" data-ocid="withdraw.status.tab.all">
                All
              </TabsTrigger>
              {STATUS_ORDER.map((status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  data-ocid={`withdraw.status.tab.${status}`}
                >
                  {STATUS_LABEL[status]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <WithdrawalList
                withdrawals={history}
                emptyLabel="No withdrawal requests yet. Submit your first request above."
              />
            </TabsContent>

            {STATUS_ORDER.map((status) => (
              <TabsContent key={status} value={status}>
                <WithdrawalList
                  withdrawals={grouped.get(status) ?? []}
                  emptyLabel={`No ${STATUS_LABEL[status].toLowerCase()} withdrawals.`}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        Requests are typically reviewed within 24–48 hours.
      </p>
    </div>
  );
}
