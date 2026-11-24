import { renderWithActor } from "@/__tests__/test-utils";
import type {
  AdminSettings,
  UpiWithdrawalInput,
  WalletSummary,
  WithdrawalView,
  backendInterface,
} from "@/backend";
import { WithdrawalMethod, WithdrawalStatus } from "@/backend";
import WithdrawPage from "@/pages/WithdrawPage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const WALLET: WalletSummary = {
  availableBalance: 1_000n,
  pendingRewards: 0n,
  totalRewards: 1_000n,
  referralRewards: 0n,
  totalWithdrawals: 0n,
  withdrawableBalance: 1_000n,
};

const SETTINGS: AdminSettings = {
  companyUpiId: "kuberx@upi",
  minWithdrawalAmount: 100n,
};

const PENDING: WithdrawalView = {
  id: 1n,
  upi: { accountHolderName: "Aarav Sharma", upiId: "aarav@bank" },
  status: WithdrawalStatus.pending,
  method: WithdrawalMethod.upi,
  amount: 500n,
  requestedAt: 1_700_000_000_000_000_000n,
};

type WithdrawActor = Pick<
  backendInterface,
  | "getWalletSummary"
  | "getAdminSettings"
  | "listMyWithdrawals"
  | "requestUpiWithdrawal"
>;

function actor(overrides: Partial<WithdrawActor> = {}): WithdrawActor {
  return {
    getWalletSummary: vi.fn(async () => WALLET),
    getAdminSettings: vi.fn(async () => SETTINGS),
    listMyWithdrawals: vi.fn(async () => [PENDING]),
    requestUpiWithdrawal: vi.fn<backendInterface["requestUpiWithdrawal"]>(
      async () => ({ __kind__: "ok", ok: PENDING }),
    ),
    ...overrides,
  };
}

describe("WithdrawPage", () => {
  it("shows the withdrawable balance, minimum and existing requests", async () => {
    renderWithActor(<WithdrawPage />, actor());

    expect(await screen.findByTestId("withdraw.balance")).toHaveTextContent(
      "₹1,000",
    );
    expect(screen.getByTestId("withdraw.minimum")).toHaveTextContent("₹100");
    expect(screen.getByTestId("withdraw.item.1")).toHaveTextContent("₹500");
    expect(screen.getByTestId("withdraw.item.1")).toHaveTextContent("Pending");
  });

  it("submits a UPI withdrawal request and shows the pending confirmation", async () => {
    const user = userEvent.setup();
    const requestUpiWithdrawal = vi.fn<
      backendInterface["requestUpiWithdrawal"]
    >(async () => ({ __kind__: "ok", ok: PENDING }));
    renderWithActor(<WithdrawPage />, actor({ requestUpiWithdrawal }));

    await screen.findByTestId("withdraw.balance");
    await user.type(
      screen.getByTestId("withdraw.upi.input.holder"),
      "Aarav Sharma",
    );
    await user.type(
      screen.getByTestId("withdraw.upi.input.upi_id"),
      "aarav@bank",
    );
    await user.type(screen.getByTestId("withdraw.upi.input.amount"), "500");
    await user.click(screen.getByTestId("withdraw.upi.submit_button"));

    expect(
      await screen.findByTestId("withdraw.upi.success_state"),
    ).toHaveTextContent(/submitted for review/i);
    expect(requestUpiWithdrawal).toHaveBeenCalledTimes(1);
    const input: UpiWithdrawalInput = requestUpiWithdrawal.mock.calls[0][0];
    expect(input.amount).toBe(500n);
  });

  it("rejects an amount above the withdrawable balance", async () => {
    const user = userEvent.setup();
    const requestUpiWithdrawal =
      vi.fn<backendInterface["requestUpiWithdrawal"]>();
    renderWithActor(<WithdrawPage />, actor({ requestUpiWithdrawal }));

    await screen.findByTestId("withdraw.balance");
    await user.type(
      screen.getByTestId("withdraw.upi.input.holder"),
      "Aarav Sharma",
    );
    await user.type(
      screen.getByTestId("withdraw.upi.input.upi_id"),
      "aarav@bank",
    );
    await user.type(screen.getByTestId("withdraw.upi.input.amount"), "5000");
    await user.click(screen.getByTestId("withdraw.upi.submit_button"));

    expect(
      await screen.findByTestId("withdraw.upi.error_state"),
    ).toHaveTextContent(/exceeds your withdrawable balance/i);
    expect(requestUpiWithdrawal).not.toHaveBeenCalled();
  });
});
