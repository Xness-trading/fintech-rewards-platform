import { NotificationKind } from "@/backend";
import type { NotificationView } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMyNotifications,
} from "@/hooks/useQueries";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock,
  Gift,
  Loader2,
  MailCheck,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface KindMeta {
  icon: LucideIcon;
  /** Tailwind classes for the icon chip background + foreground. */
  tone: string;
}

const KIND_META: Record<NotificationKind, KindMeta> = {
  [NotificationKind.registration]: {
    icon: UserPlus,
    tone: "bg-primary/15 text-primary",
  },
  [NotificationKind.verification]: {
    icon: MailCheck,
    tone: "bg-accent/15 text-accent",
  },
  [NotificationKind.paymentSubmitted]: {
    icon: Clock,
    tone: "bg-warning/15 text-warning",
  },
  [NotificationKind.paymentApproved]: {
    icon: CircleCheck,
    tone: "bg-success/15 text-success",
  },
  [NotificationKind.paymentRejected]: {
    icon: CircleX,
    tone: "bg-destructive/15 text-destructive",
  },
  [NotificationKind.membershipActivated]: {
    icon: BadgeCheck,
    tone: "bg-primary/15 text-primary",
  },
  [NotificationKind.membershipExpiring]: {
    icon: CalendarClock,
    tone: "bg-warning/15 text-warning",
  },
  [NotificationKind.rewardCredited]: {
    icon: Gift,
    tone: "bg-accent/15 text-accent",
  },
  [NotificationKind.referralSuccessful]: {
    icon: ShieldCheck,
    tone: "bg-success/15 text-success",
  },
  [NotificationKind.withdrawalApproved]: {
    icon: Wallet,
    tone: "bg-primary/15 text-primary",
  },
  [NotificationKind.withdrawalRejected]: {
    icon: CircleX,
    tone: "bg-destructive/15 text-destructive",
  },
  [NotificationKind.withdrawalCompleted]: {
    icon: CircleCheck,
    tone: "bg-success/15 text-success",
  },
};

const FALLBACK_META: KindMeta = {
  icon: Bell,
  tone: "bg-muted text-muted-foreground",
};

function metaFor(kind: NotificationKind): KindMeta {
  return KIND_META[kind] ?? FALLBACK_META;
}

function NotificationRow({
  notification,
  index,
  onMarkRead,
  isMarking,
}: {
  notification: NotificationView;
  index: number;
  onMarkRead: (id: bigint) => void;
  isMarking: boolean;
}) {
  const meta = metaFor(notification.kind);
  const Icon = meta.icon;
  const unread = !notification.read;
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      data-ocid={`notifications.item.${index + 1}`}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.25, delay: Math.min(index * 0.03, 0.3) }
      }
      className={cn(
        "glass relative flex gap-4 rounded-2xl p-4 transition-smooth sm:p-5",
        unread
          ? "border-primary/30 shadow-[0_0_0_1px_oklch(0.82_0.15_195_/_0.18)]"
          : "opacity-90",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          meta.tone,
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 font-display text-sm font-semibold leading-snug text-foreground">
            {notification.title}
          </h3>
          {unread && (
            <span
              data-ocid={`notifications.unread_indicator.${index + 1}`}
              className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              New
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {notification.body}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <time className="font-mono text-xs text-muted-foreground">
            {formatDateTime(notification.createdAt)}
          </time>
          {unread && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid={`notifications.mark_read_button.${index + 1}`}
              disabled={isMarking}
              onClick={() => onMarkRead(notification.id)}
              className="h-8 gap-1.5 rounded-full px-3 text-xs text-primary hover:bg-primary/10 hover:text-primary"
            >
              {isMarking ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

function LoadingState() {
  const ids = Array.from({ length: 4 }, (_, i) => `notification-skeleton-${i}`);
  return (
    <ul data-ocid="notifications.loading_state" className="space-y-3">
      {ids.map((id) => (
        <li key={id} className="glass flex gap-4 rounded-2xl p-4 sm:p-5">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div
      data-ocid="notifications.empty_state"
      className="glass flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <BellRing className="size-8" />
      </span>
      <h2 className="mt-5 font-display text-lg font-semibold text-foreground">
        You're all caught up
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Payment updates, membership alerts and reward credits will appear here
        as soon as they happen.
      </p>
    </div>
  );
}

export default function NotificationsPage() {
  const notificationsQuery = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <div data-ocid="notifications.page" className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Alerts"
        description="Payment, membership and reward updates for your account."
        action={
          <Button
            type="button"
            variant="outline"
            data-ocid="notifications.mark_all_read_button"
            disabled={!hasUnread || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
            className="gap-2 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
          >
            {markAllRead.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}
            Mark all as read
          </Button>
        }
      />

      {hasUnread && (
        <p
          data-ocid="notifications.unread_summary"
          className="mb-4 text-sm text-muted-foreground"
        >
          <span className="font-semibold text-primary">{unreadCount}</span>{" "}
          unread {unreadCount === 1 ? "alert" : "alerts"}
        </p>
      )}

      {notificationsQuery.isLoading ? (
        <LoadingState />
      ) : notificationsQuery.isError ? (
        <div
          data-ocid="notifications.error_state"
          className="glass flex flex-col items-center rounded-3xl px-6 py-14 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <CircleX className="size-7" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
            Couldn't load your alerts
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Something went wrong while fetching your notifications.
          </p>
          <Button
            type="button"
            variant="outline"
            data-ocid="notifications.retry_button"
            onClick={() => notificationsQuery.refetch()}
            className="mt-5 rounded-full"
          >
            Try again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ul data-ocid="notifications.list" className="space-y-3">
          {notifications.map((notification, index) => (
            <NotificationRow
              key={notification.id.toString()}
              notification={notification}
              index={index}
              onMarkRead={(id) => markRead.mutate(id)}
              isMarking={
                markRead.isPending && markRead.variables === notification.id
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
