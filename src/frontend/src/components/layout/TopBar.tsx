import { SignInButton } from "@/components/InternetIdentity";
import {
  useCallerProfile,
  useUnreadNotificationCount,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bell, Sparkles } from "lucide-react";

interface TopBarProps {
  signedIn: boolean;
}

/** Sticky top bar with the app mark, alerts indicator and account control. */
export function TopBar({ signedIn }: TopBarProps) {
  const { data: profile } = useCallerProfile();
  const { data: unread } = useUnreadNotificationCount();
  const unreadCount = unread ? Number(unread) : 0;

  return (
    <header
      data-ocid="nav.topbar"
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl lg:px-8"
    >
      <Link
        to="/"
        className="flex items-center gap-2 lg:hidden"
        aria-label="KuberX home"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          Kuber<span className="text-primary">X</span>
        </span>
      </Link>

      <div className="hidden min-w-0 lg:block">
        <p className="truncate font-display text-lg font-semibold">
          {signedIn && profile ? `Welcome back, ${profile.fullName}` : "KuberX"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {signedIn
            ? "Your rewards dashboard"
            : "Premium membership rewards platform"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {signedIn && (
          <Link
            to="/alerts"
            data-ocid="nav.alerts_link"
            aria-label={
              unreadCount > 0 ? `Alerts, ${unreadCount} unread` : "Alerts"
            }
            className="relative flex size-10 items-center justify-center rounded-full border border-border bg-secondary/60 text-foreground transition-smooth hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="size-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span
                data-ocid="nav.alerts_badge"
                className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-[18px] text-destructive-foreground"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        <SignInButton
          className={cn(
            "rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground transition-smooth",
            "hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
          )}
        />
      </div>
    </header>
  );
}
