import { renderWithActor } from "@/__tests__/test-utils";
import type { AdminOverview, PaymentView, backendInterface } from "@/backend";
import { PaymentStatus } from "@/backend";
import AdminPage from "@/pages/AdminPage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const OVERVIEW: AdminOverview = {
  totalUsers: 12n,
  activeMemberships: 5n,
  pendingPayments: 2n,
  verifiedPayments: 7n,
  totalPaymentAmount: 12_450n,
  pendingWithdrawals: 1n,
  totalWithdrawals: 3n,
  totalReferralRewards: 398n,
};

const PENDING_PAYMENT: PaymentView = {
  id: 1n,
  utr: "402312345678",
  status: PaymentStatus.pending,
  planId: 3n,
  user: { toString: () => "aaaaa-aa" } as PaymentView["user"],
  submittedAt: 1_700_000_000_000_000_000n,
  amount: 500n,
  planName: "Popular Plan",
};

type AdminActor = Pick<
  backendInterface,
  | "adminGetOverview"
  | "adminListPayments"
  | "adminApprovePayment"
  | "adminRejectPayment"
>;

function actor(overrides: Partial<AdminActor> = {}): AdminActor {
  return {
    adminGetOverview: vi.fn(async () => OVERVIEW),
    adminListPayments: vi.fn(async () => [PENDING_PAYMENT]),
    adminApprovePayment: vi.fn(async () => PENDING_PAYMENT),
    adminRejectPayment: vi.fn(async () => PENDING_PAYMENT),
    ...overrides,
  };
}

describe("AdminPage", () => {
  it("shows the overview metrics", async () => {
    renderWithActor(<AdminPage />, actor());

    const overview = await screen.findByTestId("admin.overview.section");
    expect(overview).toHaveTextContent("Total users");
    expect(overview).toHaveTextContent("12");
    expect(overview).toHaveTextContent("₹12,450");
  });

  it("approves a pending payment from the payments tab", async () => {
    const user = userEvent.setup();
    const adminApprovePayment = vi.fn(async () => PENDING_PAYMENT);
    renderWithActor(<AdminPage />, actor({ adminApprovePayment }));

    await screen.findByTestId("admin.overview.section");
    await user.click(screen.getByTestId("admin.tab.payments"));

    expect(
      await screen.findByTestId("admin.payments.item.1"),
    ).toHaveTextContent("Popular Plan");
    await user.click(screen.getByTestId("admin.payments.approve_button.1"));
    expect(adminApprovePayment).toHaveBeenCalledWith(1n);
  });

  it("rejects a pending payment with a reason", async () => {
    const user = userEvent.setup();
    const adminRejectPayment = vi.fn(async () => PENDING_PAYMENT);
    renderWithActor(<AdminPage />, actor({ adminRejectPayment }));

    await screen.findByTestId("admin.overview.section");
    await user.click(screen.getByTestId("admin.tab.payments"));
    await screen.findByTestId("admin.payments.item.1");

    await user.click(screen.getByTestId("admin.payments.reject_button.1"));
    await user.type(
      screen.getByTestId("admin.payments.reject_reason_input"),
      "UTR does not match any received payment",
    );
    await user.click(
      screen.getByTestId("admin.payments.reject_confirm_button"),
    );

    expect(adminRejectPayment).toHaveBeenCalledWith(
      1n,
      "UTR does not match any received payment",
    );
  });
});
