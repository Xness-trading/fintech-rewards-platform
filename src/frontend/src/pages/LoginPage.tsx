import { SignInButton } from "@/components/InternetIdentity";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";

/**
 * Public sign-in page. Renders for signed-out visitors and redirects to the
 * dashboard once an Internet Identity session is active.
 */
export default function LoginPage() {
  const { isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      data-ocid="login.page"
      className="relative mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center py-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-64 w-64 rounded-full bg-primary/20 blur-3xl"
      />

      <section
        data-ocid="login.card"
        className="glass-strong relative rounded-3xl px-6 py-8 shadow-glow sm:px-8 sm:py-10"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome to Kuber<span className="text-primary">X</span>
          </h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Sign in to access your rewards dashboard, wallet and membership.
          </p>
        </div>

        <div className="mt-8">
          <SignInButton className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60" />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Secure sign-in is handled by Internet Identity. Your account is
            protected by a cryptographic passkey — no passwords are ever stored
            or shared.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">New to KuberX?</span>
          <Link
            to="/register"
            data-ocid="login.register_link"
            className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create an account
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {(isInitializing || isLoggingIn) && (
          <output
            data-ocid="login.loading_state"
            className="mt-4 block text-center text-xs text-muted-foreground"
          >
            {isInitializing
              ? "Restoring your session…"
              : "Waiting for sign-in to complete…"}
          </output>
        )}
      </section>
    </div>
  );
}
