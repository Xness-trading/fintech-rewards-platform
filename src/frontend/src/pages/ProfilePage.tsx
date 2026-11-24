import { PaymentStatus } from "@/backend";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useCallerProfile,
  useMyPayments,
  usePlans,
  useUpdateProfile,
} from "@/hooks/useQueries";
import { formatDate } from "@/lib/format";
import { fileRefToUrl, uploadFileRef } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Ticket,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

interface DetailRowProps {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}

function DetailRow({ icon: Icon, label, value, mono }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/30 px-4 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-medium text-foreground",
            mono && "font-mono",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KX";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "KX";
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const { data: profile, isLoading } = useCallerProfile();
  const { data: payments } = useMyPayments();
  const { data: plans } = usePlans();
  const updateProfile = useUpdateProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [storedPictureUrl, setStoredPictureUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed the editable name once the profile arrives, without clobbering edits.
  useEffect(() => {
    if (profile && fullName === "") {
      setFullName(profile.fullName);
    }
  }, [profile, fullName]);

  // Resolve the stored profile picture reference into a displayable URL.
  useEffect(() => {
    let active = true;
    const ref = profile?.profilePicture;
    if (!ref) {
      setStoredPictureUrl(null);
      return;
    }
    void fileRefToUrl(ref)
      .then((url) => {
        if (active) setStoredPictureUrl(url);
      })
      .catch(() => {
        if (active) setStoredPictureUrl(null);
      });
    return () => {
      active = false;
    };
  }, [profile?.profilePicture]);

  // Revoke the local preview object URL when it changes or unmounts.
  useEffect(() => {
    return () => {
      if (picturePreview) URL.revokeObjectURL(picturePreview);
    };
  }, [picturePreview]);

  const membership = useMemo(() => {
    const approved = (payments ?? [])
      .filter((payment) => payment.status === PaymentStatus.approved)
      .sort((a, b) => Number(b.submittedAt - a.submittedAt));
    const latest = approved[0];
    if (!latest) return { active: false, planName: null as string | null };
    const plan = (plans ?? []).find((item) => item.id === latest.planId);
    const validityDays = plan ? Number(plan.validityDays) : 30;
    const start = latest.reviewedAt ?? latest.submittedAt;
    const expiresAt = start + BigInt(validityDays) * 86_400_000_000_000n;
    return {
      active: Date.now() < Number(expiresAt / 1_000_000n),
      planName: latest.planName,
    };
  }, [payments, plans]);

  const avatarUrl = picturePreview ?? storedPictureUrl;

  function handlePictureChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (PNG or JPG).");
      return;
    }
    setFormError(null);
    setSaved(false);
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    setFormError(null);
    setSaved(false);

    void (async () => {
      try {
        const profilePicture = pictureFile
          ? await uploadFileRef(pictureFile)
          : undefined;
        updateProfile.mutate(
          { fullName: trimmed, profilePicture },
          {
            onSuccess: () => {
              setSaved(true);
              setPictureFile(null);
              setPicturePreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            },
            onError: () => {
              setFormError("We could not save your changes. Please try again.");
            },
          },
        );
      } catch {
        setFormError("The picture upload failed. Please try again.");
      }
    })();
  }

  function handleSignOut() {
    void queryClient.cancelQueries();
    queryClient.clear();
    clear();
  }

  if (isLoading) {
    return (
      <div data-ocid="profile.page">
        <PageHeader
          title="Profile"
          description="Manage your account details."
        />
        <output
          data-ocid="profile.loading_state"
          className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground"
        >
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Loading your profile…
        </output>
      </div>
    );
  }

  if (!profile) {
    return (
      <div data-ocid="profile.page">
        <PageHeader
          title="Profile"
          description="Manage your account details."
        />
        <Card
          data-ocid="profile.empty_state"
          className="glass rounded-2xl border-border/70"
        >
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <UserRound className="size-10 text-primary" aria-hidden="true" />
            <p className="font-display text-lg font-semibold">
              No profile found
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Complete your registration to create your KuberX profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-ocid="profile.page" className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account details and membership."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Summary */}
        <Card
          data-ocid="profile.card"
          className="glass rounded-2xl border-border/70"
        >
          <CardContent className="flex flex-col items-center gap-4 pt-2 text-center">
            <Avatar className="size-24 border-2 border-primary/40 shadow-glow">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={`${profile.fullName} avatar`}
                />
              )}
              <AvatarFallback className="bg-gradient-primary font-display text-2xl font-bold text-primary-foreground">
                {initialsOf(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-bold">
                {profile.fullName}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {profile.email}
              </p>
            </div>
            <div data-ocid="profile.membership_badge">
              <StatusBadge
                label={
                  membership.active
                    ? `Active${membership.planName ? ` · ${membership.planName}` : ""}`
                    : "No active membership"
                }
                tone={membership.active ? "success" : "neutral"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card
          data-ocid="profile.details_card"
          className="glass rounded-2xl border-border/70"
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Account details
            </CardTitle>
            <CardDescription>
              Your registered information on KuberX.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailRow
              icon={Mail}
              label="Email address"
              value={profile.email}
            />
            <DetailRow
              icon={Phone}
              label="Mobile number"
              value={profile.mobile || "—"}
            />
            <DetailRow
              icon={CalendarDays}
              label="Registration date"
              value={formatDate(profile.registeredAt)}
            />
            <DetailRow
              icon={Ticket}
              label="Referral code"
              value={profile.referralCode}
              mono
            />
            <DetailRow
              icon={ShieldCheck}
              label="Membership status"
              value={
                membership.active
                  ? `Active${membership.planName ? ` · ${membership.planName}` : ""}`
                  : "No active membership"
              }
            />
            <DetailRow
              icon={CheckCircle2}
              label="Email verified"
              value={profile.emailVerified ? "Verified" : "Not verified"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit profile */}
      <Card
        data-ocid="profile.edit_card"
        className="glass rounded-2xl border-border/70"
      >
        <CardHeader>
          <CardTitle className="font-display text-lg">Edit profile</CardTitle>
          <CardDescription>
            Update your display name and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            data-ocid="profile.edit_form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-16 border border-border">
                {avatarUrl && (
                  <AvatarImage src={avatarUrl} alt="Profile picture preview" />
                )}
                <AvatarFallback className="bg-secondary font-display text-lg font-semibold text-foreground">
                  {initialsOf(fullName || profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <input
                  ref={fileInputRef}
                  id="profile-picture"
                  data-ocid="profile.upload_button"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handlePictureChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-border bg-secondary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" aria-hidden="true" />
                  {pictureFile ? "Change picture" : "Upload picture"}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  PNG, JPG or WebP. Square images look best.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  data-ocid="profile.name_input"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-mobile">Mobile number</Label>
                <Input
                  id="profile-mobile"
                  data-ocid="profile.mobile_input"
                  value={profile.mobile || "—"}
                  readOnly
                  disabled
                  aria-describedby="profile-mobile-note"
                />
                <p
                  id="profile-mobile-note"
                  className="text-xs text-muted-foreground"
                >
                  Mobile number is verified at registration and cannot be
                  changed here.
                </p>
              </div>
            </div>

            {formError && (
              <p
                role="alert"
                data-ocid="profile.error_state"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            )}
            {saved && (
              <p
                data-ocid="profile.success_state"
                className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
              >
                Your profile has been updated.
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                data-ocid="profile.save_button"
                disabled={updateProfile.isPending}
                className="rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-glow transition-smooth hover:opacity-90"
              >
                {updateProfile.isPending && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card
        data-ocid="profile.signout_card"
        className="glass rounded-2xl border-border/70"
      >
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-semibold">
              Sign out of KuberX
            </p>
            <p className="text-sm text-muted-foreground">
              End this session on the current device.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            data-ocid="profile.signout_button"
            onClick={handleSignOut}
            className="rounded-full border-destructive/40 bg-destructive/10 text-destructive transition-smooth hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
