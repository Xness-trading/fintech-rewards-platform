import { ExternalBlob, PaymentStatus } from "@/backend";
import type { Id, PaymentInput } from "@/backend";
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
import {
  useAdminSettings,
  usePlan,
  useSubmitPayment,
} from "@/hooks/useQueries";
import { formatCurrency } from "@/lib/format";
import { paymentTone } from "@/lib/status";
import { useSearch } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Copy,
  ImageUp,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const UPI_APPS = [
  "Google Pay",
  "PhonePe",
  "Paytm",
  "BHIM UPI",
  "Amazon Pay",
  "CRED",
  "Navi",
  "WhatsApp Pay",
];

const STEPS = [
  "Open any UPI app and tap Scan & Pay.",
  "Scan the company QR code or enter the UPI ID shown above.",
  "Enter the exact plan amount and complete the payment.",
  "Copy the 12-digit UTR / Transaction ID from your UPI app.",
  "Upload a clear screenshot of the successful payment below.",
  "Submit the form — your membership activates after admin verification.",
];

function toId(value: unknown): Id | undefined {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value)) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  return undefined;
}

export default function PaymentPage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const planId = toId(search.planId);

  const { data: plan, isLoading: planLoading } = usePlan(planId);
  const { data: settings } = useAdminSettings();
  const submitPayment = useSubmitPayment();

  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrUrl = useMemo(() => {
    const bytes = settings?.paymentQrImage;
    if (bytes && bytes.length > 0) {
      try {
        const copy = new Uint8Array(bytes);
        return ExternalBlob.fromBytes(copy).getDirectURL();
      } catch {
        return "/assets/images/upi-qr.jpg";
      }
    }
    return "/assets/images/upi-qr.jpg";
  }, [settings?.paymentQrImage]);

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const handleCopyUpi = async () => {
    if (!settings?.companyUpiId) return;
    try {
      await navigator.clipboard.writeText(settings.companyUpiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleFile = (file: File | null) => {
    setFormError(null);
    if (!file) {
      setScreenshot(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormError("Please upload an image file (PNG or JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Screenshot must be 5 MB or smaller.");
      return;
    }
    setScreenshot(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedUtr = utr.trim();
    if (!plan) {
      setFormError("Select a membership plan before submitting payment.");
      return;
    }
    if (trimmedUtr.length < 6) {
      setFormError("Enter the UTR / Transaction ID from your UPI app.");
      return;
    }
    if (!screenshot) {
      setFormError("Upload a screenshot of your payment.");
      return;
    }

    let blob: ExternalBlob;
    try {
      const bytes = new Uint8Array(await screenshot.arrayBuffer());
      blob = ExternalBlob.fromBytes(bytes, screenshot.type, screenshot.name);
    } catch {
      setFormError("Could not read the screenshot. Please try again.");
      return;
    }

    const input: PaymentInput = {
      utr: trimmedUtr,
      planId: plan.id,
      screenshot: blob as unknown as PaymentInput["screenshot"],
    };

    submitPayment.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "ok") {
          setSubmitted(true);
          setUtr("");
          setScreenshot(null);
        } else {
          setFormError(result.err);
        }
      },
      onError: (error) => {
        setFormError(
          error instanceof Error
            ? error.message
            : "Payment submission failed. Please try again.",
        );
      },
    });
  };

  if (submitted) {
    return (
      <div data-ocid="payment.page" className="mx-auto max-w-2xl">
        <PageHeader
          title="Payment submitted"
          description="Your payment is now awaiting verification."
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Card
            data-ocid="payment.success_state"
            className="glass-strong rounded-2xl border-primary/30 shadow-none"
          >
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="size-8" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold">
                  Payment Submitted Successfully
                </h2>
                <p className="text-sm text-muted-foreground">
                  We received your payment details. Your membership will be
                  activated once an admin verifies the transaction.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label="Pending Verification"
                  tone={paymentTone(PaymentStatus.pending)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2 rounded-full"
                data-ocid="payment.submit_another_button"
                onClick={() => setSubmitted(false)}
              >
                Submit another payment
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div data-ocid="payment.page" className="mx-auto max-w-5xl">
      <PageHeader
        title="Complete payment"
        description="Pay via UPI and submit your transaction details for verification."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Plan summary + QR */}
        <div className="space-y-6">
          <Card className="glass rounded-2xl border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Selected plan
              </CardTitle>
              <CardDescription>
                Confirm the plan and amount before paying.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {planLoading ? (
                <div
                  data-ocid="payment.plan.loading_state"
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Loading plan details…
                </div>
              ) : plan ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold">
                      {plan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.validityDays.toString()} days validity
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-2xl font-bold text-gradient-primary">
                    {formatCurrency(plan.price)}
                  </p>
                </div>
              ) : (
                <div
                  data-ocid="payment.plan.empty_state"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <TriangleAlert className="size-4" aria-hidden="true" />
                  No plan selected. Choose a plan from the plans page.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <QrCode className="size-5 text-primary" aria-hidden="true" />
                Pay with UPI
              </CardTitle>
              <CardDescription>
                Scan the QR code or use the company UPI ID below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="glow-primary shrink-0 rounded-2xl bg-white p-3">
                  <img
                    src={qrUrl}
                    alt="Company UPI payment QR code"
                    data-ocid="payment.qr_image"
                    className="size-44 rounded-lg object-contain"
                  />
                </div>
                <div className="w-full min-w-0 space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Company UPI ID
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code
                        data-ocid="payment.upi_id"
                        className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm"
                      >
                        {settings?.companyUpiId ?? "—"}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 rounded-lg"
                        aria-label="Copy UPI ID"
                        data-ocid="payment.copy_upi_button"
                        onClick={handleCopyUpi}
                        disabled={!settings?.companyUpiId}
                      >
                        {copied ? (
                          <CheckCircle2
                            className="size-4 text-success"
                            aria-hidden="true"
                          />
                        ) : (
                          <Copy className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    {copied && (
                      <p className="mt-1 text-xs text-success">UPI ID copied</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                    <ShieldCheck
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    Pay only to the official company UPI ID shown here. We never
                    ask for your UPI PIN.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-lg">How to pay</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {STEPS.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Smartphone className="size-5 text-accent" aria-hidden="true" />
                Supported UPI apps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {UPI_APPS.map((app) => (
                  <span
                    key={app}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission form */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="glass-strong rounded-2xl border-primary/25 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <BadgeCheck
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                Submit payment proof
              </CardTitle>
              <CardDescription>
                Enter your UTR and upload a screenshot for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="utr">UTR / Transaction ID</Label>
                  <Input
                    id="utr"
                    name="utr"
                    data-ocid="payment.utr_input"
                    value={utr}
                    onChange={(event) => {
                      setUtr(event.target.value);
                      setFormError(null);
                    }}
                    placeholder="e.g. 402312345678"
                    autoComplete="off"
                    inputMode="numeric"
                    aria-invalid={formError ? true : undefined}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find this in your UPI app under payment details.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment screenshot</Label>
                  <input
                    ref={fileInputRef}
                    id="screenshot"
                    name="screenshot"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    data-ocid="payment.screenshot_input"
                    onChange={(event) =>
                      handleFile(event.target.files?.[0] ?? null)
                    }
                  />
                  {previewUrl ? (
                    <div className="relative overflow-hidden rounded-xl border border-border">
                      <img
                        src={previewUrl}
                        alt="Selected payment screenshot preview"
                        className="max-h-56 w-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 size-8 rounded-full"
                        aria-label="Remove screenshot"
                        data-ocid="payment.remove_screenshot_button"
                        onClick={() => {
                          setScreenshot(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-ocid="payment.upload_button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-smooth hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ImageUp
                        className="size-7 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">
                        Upload payment screenshot
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG or WebP · up to 5 MB
                      </span>
                    </button>
                  )}
                </div>

                {formError && (
                  <div
                    role="alert"
                    data-ocid="payment.error_state"
                    className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    <TriangleAlert
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{formError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full"
                  data-ocid="payment.submit_button"
                  disabled={submitPayment.isPending}
                >
                  {submitPayment.isPending ? (
                    <>
                      <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                      Submitting…
                    </>
                  ) : (
                    "Submit Payment"
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  Membership activates only after admin verification.
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
