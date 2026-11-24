import { renderWithActor } from "@/__tests__/test-utils";
import type { WalletTransactionView } from "@/backend";
import { TransactionKind, TransactionStatus, TransactionType } from "@/backend";
import TransactionsPage from "@/pages/TransactionsPage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const navigate = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => search.current,
  useNavigate: () => navigate,
}));

const REWARD: WalletTransactionView = {
  id: 7n,
  status: TransactionStatus.completed,
  kind: TransactionKind.credit,
  createdAt: 1_700_000_000_000_000_000n,
  txType: TransactionType.referral,
  amount: 199n,
};

const WITHDRAWAL: WalletTransactionView = {
  id: 8n,
  status: TransactionStatus.completed,
  kind: TransactionKind.debit,
  createdAt: 1_700_000_000_000_000_000n,
  txType: TransactionType.withdrawal,
  amount: 500n,
};

function actor() {
  return {
    listMyTransactions: vi.fn(async () => [REWARD, WITHDRAWAL]),
  };
}

describe("TransactionsPage", () => {
  it("lists transactions and filters by type from the URL", async () => {
    search.current = { filter: "referral" };
    renderWithActor(<TransactionsPage />, actor());

    const table = await screen.findByTestId("transactions.table");
    expect(table).toHaveTextContent("Referral");
    expect(table).not.toHaveTextContent("Withdrawal");
    expect(screen.getByTestId("transactions.filter.referral")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("writes the selected filter into the URL", async () => {
    search.current = {};
    const user = userEvent.setup();
    renderWithActor(<TransactionsPage />, actor());

    await screen.findByTestId("transactions.table");
    await user.click(screen.getByTestId("transactions.filter.withdrawal"));

    expect(navigate).toHaveBeenCalledWith({
      to: "/transactions",
      search: { filter: "withdrawal" },
      replace: true,
    });
  });

  it("shows an empty state when a filter matches nothing", async () => {
    search.current = { filter: "payment" };
    renderWithActor(<TransactionsPage />, actor());

    expect(
      await screen.findByTestId("transactions.empty_state"),
    ).toHaveTextContent(/no matching transactions/i);
  });
});
