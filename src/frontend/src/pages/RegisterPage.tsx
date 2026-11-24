import { SignInButton } from "@/components/InternetIdentity";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterUser } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Gift,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface FieldErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
  terms?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\d{10}$/;

/**
 * Public registration page. Renders for signed-out visitors; submitting
 * requires an Internet Identity session, so the primary action signs in first.
 */
export default function RegisterPage() {
  const { isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const navigate = useNavigate();
  const registerUser = useRegisterUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (registered) {
      void navigate({ to: "/dashboard" });
    }
  }, [registered, navigate]);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!MOBILE_PATTERN.test(mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number.";
    }
    if (!acceptedTerms) {
      errors.terms = "You must accept the Terms and Conditions to continue.";
    }
    return errors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    registerUser.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        referralCode:
          referralCode.trim() === "" ? undefined : referralCode.trim(),
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setFormError(result.err);
          } else {
            setRegistered(true);
          }
        },
        onError: () => {
          setFormError(
            "We could not complete your registration. Please try again.",
          );
        },
      },
    );
  }

  const pending = registerUser.isPending;

  return (
    <div
      data-ocid="register.page"
      className="relative mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center py-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-64 w-64 rounded-full bg-accent/20 blur-3xl"
      />

      <section
        data-ocid="register.card"
        className="glass-strong relative rounded-3xl px-6 py-8 shadow-glow sm:px-8 sm:py-10"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Join KuberX to unlock membership rewards, referrals and your wallet.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Registration is secured by Internet Identity. Sign in with your
              passkey to submit your details.
            </p>
          </div>
        )}

        <form
          data-ocid="register.form"
          className="mt-6 flex flex-col gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-full-name">Full Name</Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="register-full-name"
                data-ocid="register.full_name_input"
                className="h-11 rounded-xl pl-9"
                placeholder="e.g. Aarav Sharma"
                autoComplete="name"
                value={fullName}
                aria-invalid={!!fieldErrors.fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            {fieldErrors.fullName && (
              <p
                data-ocid="register.full_name_error"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-email">Email Address</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="register-email"
                data-ocid="register.email_input"
                type="email"
                className="h-11 rounded-xl pl-9"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                aria-invalid={!!fieldErrors.email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {fieldErrors.email && (
              <p
                data-ocid="register.email_error"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-mobile">Mobile Number</Label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="register-mobile"
                data-ocid="register.mobile_input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="h-11 rounded-xl pl-9"
                placeholder="10-digit mobile number"
                autoComplete="tel"
                value={mobile}
                aria-invalid={!!fieldErrors.mobile}
                onChange={(event) =>
                  setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />
            </div>
            {fieldErrors.mobile && (
              <p
                data-ocid="register.mobile_error"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {fieldErrors.mobile}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-referral">
              Referral Code{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Gift
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="register-referral"
                data-ocid="register.referral_input"
                className="h-11 rounded-xl pl-9"
                placeholder="Enter a friend's code"
                value={referralCode}
                onChange={(event) => setReferralCode(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="register-terms"
                data-ocid="register.terms_checkbox"
                className="mt-0.5"
                checked={acceptedTerms}
                aria-invalid={!!fieldErrors.terms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
              />
              <Label
                htmlFor="register-terms"
                className="text-sm font-normal leading-snug text-muted-foreground"
              >
                I agree to the KuberX Terms and Conditions and Privacy Policy.
              </Label>
            </div>
            {fieldErrors.terms && (
              <p
                data-ocid="register.terms_error"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {fieldErrors.terms}
              </p>
            )}
          </div>

          {formError && (
            <div
              data-ocid="register.error_state"
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          {registered && (
            <div
              data-ocid="register.success_state"
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary"
            >
              <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              <span>Account created. Taking you to your dashboard…</span>
            </div>
          )}

          {isAuthenticated ? (
            <Button
              type="submit"
              data-ocid="register.submit_button"
              disabled={pending}
              className="h-12 w-full rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
            >
              {pending ? "Creating your account…" : "Create account"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <SignInButton className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60" />
              <p className="text-center text-xs text-muted-foreground">
                {isInitializing || isLoggingIn
                  ? "Preparing secure sign-in…"
                  : "Sign in to submit your registration."}
              </p>
            </div>
          )}
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-muted-foreground">
            Already have an account?
          </span>
          <Link
            to="/login"
            data-ocid="register.login_link"
            className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
