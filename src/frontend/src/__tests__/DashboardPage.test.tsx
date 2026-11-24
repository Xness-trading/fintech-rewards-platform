import { renderWithActor } from "@/__tests__/test-utils";
import type {
  MembershipPlan,
  PaymentView,
  ReferralSummary,
  UserProfileView,
  WalletSummary,
  WalletTransactionView,
} from "@/backend";
import {
  PaymentStatus,
  TransactionKind,
  TransactionStatus,
  TransactionType,
} from "@/backend";
import DashboardPage from "@/pages/DashboardPage";
import { screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

const PROFILE: UserProfileView = {
  principal: { toString: () => "aaaaa-aa" } as UserProfileView["principal"],
  referralCode: "ABCD2345",
  emailVerified: true,
  blocked: false,
  fullName: "Aarav Sharma",
  mobileVerified: true,
  email: "aarav@example.com",
  mobile: "9876543210",
  registeredAt: 1_700_000_000_000_000_000n,
};

const WALLET: WalletSummary = {
  availableBalance: 12_450n,
  pendingRewards: 199n,
  totalRewards: 12_450n,
  referralRewards: 199n,
  totalWithdrawals: 0n,
  withdrawableBalance: 12_450n,
};

const REFERRAL: ReferralSummary = {
  totalRewardEarned: 199n,
  referralCode: "ABCD2345",
  referralLink: "https://app.caffeine.ai/register?ref=ABCD2345",
  successfulReferrals: 1n,
  totalReferrals: 3n,
  pendingReferrals: 2n,
};

const PLAN: MembershipPlan = {
  id: 3n,
  name: "Popular Plan",
  price: 500n,
  validityDays: 30n,
  benefits: ["All Basic benefits"],
  rewardDetails: "Boosted reward",
  popular: true,
};

const APPROVED_PAYMENT: PaymentView = {
  id: 1n,
  utr: "402312345678",
  status: PaymentStatus.approved,
  planId: 3n,
  user: PROFILE.principal,
  submittedAt: 1_700_000_000_000_000_000n,
  reviewedAt: 1_700_000_000_000_000_000n,
  amount: 500n,
  planName: "Popular Plan",
};

const TRANSACTION: WalletTransactionView = {
  id: 7n,
  status: TransactionStatus.completed,
  kind: TransactionKind.credit,
  createdAt: 1_700_000_000_000_000_000n,
  txType: TransactionType.referral,
  amount: 199n,
};

function actor() {
  return {
    getCallerProfile: vi.fn(async () => PROFILE),
    getWalletSummary: vi.fn(async () => structuredClone(WALLET)),
    getReferralSummary: vi.fn(async () => structuredClone(REFERRAL)),
    listMyTransactions: vi.fn(async () => [structuredClone(TRANSACTION)]),
    listMyPayments: vi.fn(async () => [APPROVED_PAYMENT]),
    listPlans: vi.fn(async () => [structuredClone(PLAN)]),
  };
}

describe("DashboardPage", () => {
  it("shows the user's name, balances, referrals and active membership", async () => {
    renderWithActor(<DashboardPage />, actor());

    expect(
      await screen.findByRole("heading", { name: /welcome back, aarav/i }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("dashboard.balance.card")).toHaveTextContent(
      "₹12,450",
    );
    expect(screen.getByTestId("dashboard.rewards.card")).toHaveTextContent(
      "₹12,450",
    );
    expect(screen.getByTestId("dashboard.referrals.card")).toHaveTextContent(
      "3",
    );

    const membership = screen.getByTestId("dashboard.membership.card");
    expect(membership).toHaveTextContent("Popular Plan");
    expect(membership).toHaveTextContent(/expires/i);
  });

  it("renders the six quick-access cards and a recent transaction", async () => {
    renderWithActor(<DashboardPage />, actor());

    await screen.findByTestId("dashboard.transactions.item.1");

    const quickAccess = screen.getByTestId("dashboard.quick_access.section");
    const cards = quickAccess.querySelectorAll(
      '[data-ocid^="dashboard.quick_access.item."]',
    );
    expect(cards).toHaveLength(6);

    expect(
      screen.getByTestId("dashboard.transactions.item.1"),
    ).toHaveTextContent("Referral");
  });

  it("shows an empty transaction state when there is no activity", async () => {
    const emptyActor = {
      ...actor(),
      listMyTransactions: vi.fn(async () => []),
    };
    renderWithActor(<DashboardPage />, emptyActor);

    expect(
      await screen.findByTestId("dashboard.transactions.empty_state"),
    ).toBeInTheDocument();
  });
});
