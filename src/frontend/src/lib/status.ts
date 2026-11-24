import {
  PaymentStatus,
  ReferralStatus,
  TicketStatus,
  TransactionStatus,
  WithdrawalStatus,
} from "@/backend";

export type StatusTone = "pending" | "success" | "danger" | "neutral";

/** Map a payment status to a semantic tone for badges. */
export function paymentTone(status: PaymentStatus): StatusTone {
  switch (status) {
    case PaymentStatus.approved:
      return "success";
    case PaymentStatus.rejected:
      return "danger";
    default:
      return "pending";
  }
}

/** Map a withdrawal status to a semantic tone for badges. */
export function withdrawalTone(status: WithdrawalStatus): StatusTone {
  switch (status) {
    case WithdrawalStatus.completed:
    case WithdrawalStatus.approved:
      return "success";
    case WithdrawalStatus.rejected:
      return "danger";
    default:
      return "pending";
  }
}

/** Map a referral status to a semantic tone for badges. */
export function referralTone(status: ReferralStatus): StatusTone {
  switch (status) {
    case ReferralStatus.rewarded:
      return "success";
    case ReferralStatus.rejected:
      return "danger";
    case ReferralStatus.eligible:
      return "pending";
    default:
      return "neutral";
  }
}

/** Map a transaction status to a semantic tone for badges. */
export function transactionTone(status: TransactionStatus): StatusTone {
  switch (status) {
    case TransactionStatus.completed:
      return "success";
    case TransactionStatus.failed:
      return "danger";
    default:
      return "pending";
  }
}

/** Map a support ticket status to a semantic tone for badges. */
export function ticketTone(status: TicketStatus): StatusTone {
  switch (status) {
    case TicketStatus.resolved:
    case TicketStatus.closed:
      return "success";
    case TicketStatus.inProgress:
      return "pending";
    default:
      return "neutral";
  }
}

/** Tailwind classes for a status tone, using the design tokens. */
export function toneClasses(tone: StatusTone): string {
  switch (tone) {
    case "success":
      return "border-transparent bg-success/15 text-success";
    case "danger":
      return "border-transparent bg-destructive/15 text-destructive";
    case "pending":
      return "border-transparent bg-warning/15 text-warning";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}
