import { Badge } from "@/components/ui/badge";
import { type StatusTone, toneClasses } from "@/lib/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
  className?: string;
}

/** Small semantic status pill used across payments, withdrawals and referrals. */
export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 font-medium",
        toneClasses(tone),
        className,
      )}
    >
      {label}
    </Badge>
  );
}
