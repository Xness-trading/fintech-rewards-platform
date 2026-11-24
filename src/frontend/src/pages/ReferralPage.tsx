import type { ReferralView } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyReferrals, useReferralSummary } from "@/hooks/useQueries";
import { formatCurrency, formatDate, humanize } from "@/lib/format";
import { referralTone } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Gift,
  Link2,
  Share2,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const REWARD_AMOUNT = 199n;

interface StatCardProps {
  label: string;
  value: string;
  icon: typeof Users;
  accent?: boolean;
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card
      className={cn(
        "glass relative overflow-hidden rounded-2xl border-0 py-0 shadow-none",
        accent && "glow-primary",
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-gradient-primary text-primary-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight">
            {value}
          </p>
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralRow({
  referral,
  index,
}: { referral: ReferralView; index: number }) {
  const shortId = `${referral.referred.toString().slice(0, 5)}…${referral.referred
    .toString()
    .slice(-3)}`;
  return (
    <li
      data-ocid={`referral.item.${index + 1}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserPlus className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-foreground">
            {shortId}
          </p>
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(referral.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-display text-sm font-semibold text-foreground">
          {formatCurrency(referral.rewardAmount)}
        </span>
        <StatusBadge
          label={humanize(referral.status)}
          tone={referralTone(referral.status)}
        />
      </div>
    </li>
  );
}

function ReferralListSkeleton() {
  const ids = Array.from({ length: 3 }, (_, i) => `referral-skeleton-${i}`);
  return (
    <ul className="space-y-3">
      {ids.map((id) => (
        <li
          key={id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

export default function ReferralPage() {
  const { data: summary, isLoading: summaryLoading } = useReferralSummary();
  const { data: referrals, isLoading: referralsLoading } = useMyReferrals();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const reduceMotion = useReducedMotion();

  const referralLink = summary?.referralLink ?? "";
  const referralCode = summary?.referralCode ?? "";

  async function handleCopy() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  function handleWhatsAppShare() {
    if (!referralLink) return;
    const message = `Join KuberX and start earning rewards. Use my referral link: ${referralLink}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const stats: StatCardProps[] = [
    {
      label: "Total Referrals",
      value: summary ? summary.totalReferrals.toString() : "—",
      icon: Users,
    },
    {
      label: "Successful Referrals",
      value: summary ? summary.successfulReferrals.toString() : "—",
      icon: TrendingUp,
      accent: true,
    },
    {
      label: "Pending Referrals",
      value: summary ? summary.pendingReferrals.toString() : "—",
      icon: UserPlus,
    },
  ];

  return (
    <div data-ocid="referral.page" className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Referrals"
        description="Invite friends and earn rewards for every verified membership."
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
        }
        className="space-y-6"
      >
        {/* Referral code + link */}
        <Card className="glass-strong relative overflow-hidden rounded-2xl border-0 py-0 shadow-none">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl"
          />
          <CardContent className="relative space-y-5 p-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Your referral code
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background/40 px-4 py-3">
                <Gift className="size-5 text-primary" aria-hidden="true" />
                <span
                  data-ocid="referral.code"
                  className="font-mono text-xl font-bold tracking-[0.2em] text-foreground"
                >
                  {summaryLoading ? "••••••" : referralCode || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="referral-link"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Referral link
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-input bg-background/40 px-3 py-2.5">
                  <Link2
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="referral-link"
                    data-ocid="referral.link_input"
                    readOnly
                    value={summaryLoading ? "Loading…" : referralLink}
                    className="min-w-0 flex-1 truncate bg-transparent font-mono text-sm text-foreground outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    data-ocid="referral.copy_button"
                    onClick={handleCopy}
                    disabled={!referralLink}
                    className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
                  >
                    {copied ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                    {copied ? "Copied" : "Copy Referral Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="referral.whatsapp_button"
                    onClick={handleWhatsAppShare}
                    disabled={!referralLink}
                    className="rounded-full border-primary/40 text-primary transition-smooth hover:bg-primary/10 hover:text-primary"
                  >
                    <Share2 className="size-4" aria-hidden="true" />
                    WhatsApp
                  </Button>
                </div>
              </div>
              {copyError && (
                <p
                  data-ocid="referral.copy_error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  Could not copy automatically. Select the link above and copy
                  it manually.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
        </div>

        {/* Reward explanation */}
        <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Gift className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-sm font-semibold text-foreground">
              Earn {formatCurrency(REWARD_AMOUNT)} per eligible referral
            </p>
            <p className="text-sm text-muted-foreground">
              Your {formatCurrency(REWARD_AMOUNT)} reward is credited only after
              the referred customer completes an admin-verified membership
              purchase. Rewards stay pending until that purchase is approved.
            </p>
          </div>
        </div>

        {/* Reward history */}
        <section data-ocid="referral.history_section" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Referral reward history
            </h2>
            {summary && (
              <span className="text-sm text-muted-foreground">
                Total earned{" "}
                <span className="font-semibold text-primary">
                  {formatCurrency(summary.totalRewardEarned)}
                </span>
              </span>
            )}
          </div>

          {referralsLoading ? (
            <ReferralListSkeleton />
          ) : referrals && referrals.length > 0 ? (
            <ul data-ocid="referral.list" className="space-y-3">
              {referrals.map((referral, index) => (
                <ReferralRow
                  key={referral.id.toString()}
                  referral={referral}
                  index={index}
                />
              ))}
            </ul>
          ) : (
            <div
              data-ocid="referral.empty_state"
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/20 px-6 py-12 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="size-6" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="font-display font-semibold">No referrals yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Share your referral link to invite friends. Their rewards will
                  appear here once their membership purchase is verified.
                </p>
              </div>
              <Button
                type="button"
                data-ocid="referral.empty_share_button"
                onClick={handleWhatsAppShare}
                disabled={!referralLink}
                className="rounded-full bg-gradient-primary text-primary-foreground transition-smooth hover:opacity-90"
              >
                <Share2 className="size-4" aria-hidden="true" />
                Share on WhatsApp
              </Button>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
