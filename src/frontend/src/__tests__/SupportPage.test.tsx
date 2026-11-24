import { renderWithActor } from "@/__tests__/test-utils";
import type { SupportTicketView, backendInterface } from "@/backend";
import { TicketStatus } from "@/backend";
import SupportPage from "@/pages/SupportPage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const TICKET: SupportTicketView = {
  id: 1n,
  status: TicketStatus.open,
  subject: "Payment not credited",
  createdAt: 1_700_000_000_000_000_000n,
  updatedAt: 1_700_000_000_000_000_000n,
  message: "My UPI payment was deducted but membership is not active.",
};

type SupportActor = Pick<
  backendInterface,
  "listMySupportTickets" | "submitSupportTicket"
>;

function actor(overrides: Partial<SupportActor> = {}): SupportActor {
  return {
    listMySupportTickets: vi.fn(async () => [TICKET]),
    submitSupportTicket: vi.fn(async () => TICKET),
    ...overrides,
  };
}

describe("SupportPage", () => {
  it("shows contact channels, existing tickets and policies", async () => {
    renderWithActor(<SupportPage />, actor());

    expect(
      await screen.findByTestId("support.ticket.item.1"),
    ).toHaveTextContent("Payment not credited");
    expect(screen.getByTestId("support.email.link")).toHaveTextContent(
      "support@kuberx.in",
    );
    expect(screen.getByTestId("support.policy.item.1")).toHaveTextContent(
      "Terms and Conditions",
    );
  });

  it("submits a complaint and confirms it was received", async () => {
    const user = userEvent.setup();
    const submitSupportTicket = vi.fn(async () => TICKET);
    renderWithActor(<SupportPage />, actor({ submitSupportTicket }));

    await screen.findByTestId("support.ticket.item.1");
    await user.type(
      screen.getByTestId("support.subject.input"),
      "Withdrawal delayed",
    );
    await user.type(
      screen.getByTestId("support.message.textarea"),
      "My withdrawal has been pending for three days.",
    );
    await user.click(screen.getByTestId("support.submit_button"));

    expect(
      await screen.findByTestId("support.form.success_state"),
    ).toHaveTextContent(/complaint submitted/i);
    expect(submitSupportTicket).toHaveBeenCalledWith({
      subject: "Withdrawal delayed",
      message: "My withdrawal has been pending for three days.",
    });
  });
});
