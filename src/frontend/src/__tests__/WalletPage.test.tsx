import { renderWithActor } from "@/__tests__/test-utils";
import type { WalletSummary, WalletTransactionView } from "@/backend";
import { TransactionKind, TransactionStatus, TransactionType } from "@/backend";
import WalletPage from "@/pages/WalletPage";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const WALLET: WalletSummary = {
  availableBalance: 12_450n,
  pendingRewards: 199n,
  totalRewards: 12_450n,
  referralRewards: 199n,
  totalWithdrawals: 500n,
  withdrawableBalance: 11_950n,
};

const CREDIT: WalletTransactionView = {
  id: 7n,
  status: TransactionStatus.completed,
  kind: TransactionKind.credit,
  createdAt: 1_700_000_000_000_000_000n,
  txType: TransactionType.referral,
  amount: 199n,
};

const DEBIT: WalletTransactionView = {
  id: 8n,
  status: TransactionStatus.completed,
  kind: TransactionKind.debit,
  createdAt: 1_700_000_000_000_000_000n,
  txType: TransactionType.withdrawal,
  amount: 500n,
};

function actor(transactions: WalletTransactionView[] = [CREDIT, DEBIT]) {
  return {
    getWalletSummary: vi.fn(async () => WALLET),
    listMyTransactions: vi.fn(async () => transactions),
  };
}

describe("WalletPage", () => {
  it("shows all six balances with credit and debit history", async () => {
    renderWithActor(<WalletPage />, actor());

    expect(
      await screen.findByTestId("wallet.card.available"),
    ).toHaveTextContent("₹12,450");
    expect(screen.getByTestId("wallet.card.withdrawable")).toHaveTextContent(
      "₹11,950",
    );
    expect(screen.getByTestId("wallet.card.totalRewards")).toHaveTextContent(
      "₹12,450",
    );
    expect(screen.getByTestId("wallet.card.referralRewards")).toHaveTextContent(
      "₹199",
    );
    expect(screen.getByTestId("wallet.card.pendingRewards")).toHaveTextContent(
      "₹199",
    );
    expect(
      screen.getByTestId("wallet.card.totalWithdrawals"),
    ).toHaveTextContent("₹500");

    const table = screen.getByTestId("wallet.history.table");
    expect(table).toHaveTextContent("Referral");
    expect(table).toHaveTextContent("Withdrawal");
    expect(table).toHaveTextContent("+₹199");
    expect(table).toHaveTextContent("−₹500");
  });

  it("shows an empty history state when there is no activity", async () => {
    renderWithActor(<WalletPage />, actor([]));

    expect(
      await screen.findByTestId("wallet.history.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("wallet.history.table"),
    ).not.toBeInTheDocument();
  });
});
