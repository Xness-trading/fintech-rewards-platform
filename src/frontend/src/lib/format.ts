/** Formatting helpers shared across the KuberX rewards platform. */

/** Render a whole-rupee amount in Indian digit grouping, e.g. 12450 -> "₹12,450". */
export function formatCurrency(amount: bigint | number): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Render a plain count with Indian digit grouping, e.g. 12450 -> "12,450". */
export function formatNumber(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-IN").format(n);
}

/** Convert a backend nanosecond timestamp into a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as a readable date, e.g. "4 Nov 2026". */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Format a backend timestamp as date + time, e.g. "4 Nov 2026, 3:20 pm". */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Turn a camelCase enum value into a readable label, e.g. "inProgress" -> "In progress". */
export function humanize(value: string): string {
  const spaced = value.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}
