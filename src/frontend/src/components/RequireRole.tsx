import { UserRole } from "@/backend";
import { SignInButton } from "@/components/InternetIdentity";
import { useCallerRole } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { ReactNode } from "react";

interface RequireRoleProps {
  children: ReactNode;
  /** When true, only the admin role may view the children. */
  adminOnly?: boolean;
}

/**
 * Route guard for the private subtree. Signed-out visitors get a sign-in
 * prompt; the admin console additionally requires the admin role.
 */
export function RequireRole({ children, adminOnly = false }: RequireRoleProps) {
  const { identity, isInitializing, isLoggingIn } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: role, isLoading } = useCallerRole();

  if (isInitializing || isLoggingIn) {
    return (
      <output
        data-ocid="auth.loading_state"
        className="flex min-h-[50vh] items-center justify-center text-muted-foreground"
      >
        Loading your session…
      </output>
    );
  }

  if (!signedIn) {
    return (
      <section
        aria-label="Sign in required"
        data-ocid="auth.panel"
        className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl px-6 py-10 text-center"
      >
        <h2 className="font-display text-2xl font-semibold">
          Sign in to continue
        </h2>
        <p className="text-sm text-muted-foreground">
          This area is private to your Internet Identity.
        </p>
        <SignInButton className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60" />
      </section>
    );
  }

  if (adminOnly) {
    if (isLoading) {
      return (
        <output
          data-ocid="auth.loading_state"
          className="flex min-h-[50vh] items-center justify-center text-muted-foreground"
        >
          Checking permissions…
        </output>
      );
    }
    if (role !== UserRole.admin) {
      return (
        <section
          aria-label="Access denied"
          data-ocid="auth.denied_state"
          className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center"
        >
          <h2 className="font-display text-2xl font-semibold">
            Admin access required
          </h2>
          <p className="text-sm text-muted-foreground">
            Your account does not have permission to view the admin console.
          </p>
        </section>
      );
    }
  }

  return <>{children}</>;
}
