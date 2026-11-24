import { renderWithActor } from "@/__tests__/test-utils";
import type { ReferralSummary, ReferralView } from "@/backend";
import { ReferralStatus } from "@/backend";
import ReferralPage from "@/pages/ReferralPage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const SUMMARY: ReferralSummary = {
  totalRewardEarned: 199n,
  referralCode: "ABCD2345",
  referralLink: "https://app.caffeine.ai/register?ref=ABCD2345",
  successfulReferrals: 1n,
  totalReferrals: 3n,
  pendingReferrals: 2n,
};

const REFERRAL: ReferralView = {
  id: 1n,
  status: ReferralStatus.rewarded,
  referrer: { toString: () => "aaaaa-aa" } as ReferralView["referrer"],
  referred: { toString: () => "bbbbb-bb" } as ReferralView["referred"],
  rewardAmount: 199n,
  createdAt: 1_700_000_000_000_000_000n,
};

function actor() {
  return {
    getReferralSummary: vi.fn(async () => SUMMARY),
    listMyReferrals: vi.fn(async () => [REFERRAL]),
  };
}

describe("ReferralPage", () => {
  it("shows the unique code, link, counts and reward history", async () => {
    renderWithActor(<ReferralPage />, actor());

    expect(await screen.findByText("ABCD2345")).toBeInTheDocument();
    expect(screen.getByTestId("referral.link_input")).toHaveValue(
      "https://app.caffeine.ai/register?ref=ABCD2345",
    );
    expect(
      screen.getByText("Total Referrals").closest("div"),
    ).toHaveTextContent("3");
    expect(screen.getByTestId("referral.item.1")).toHaveTextContent("₹199");
  });

  it("copies the referral link and opens a WhatsApp share", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const open = vi.spyOn(window, "open").mockImplementation(() => null);

    renderWithActor(<ReferralPage />, actor());
    await screen.findByTestId("referral.code");

    await user.click(screen.getByTestId("referral.copy_button"));
    expect(writeText).toHaveBeenCalledWith(
      "https://app.caffeine.ai/register?ref=ABCD2345",
    );

    await user.click(screen.getByTestId("referral.whatsapp_button"));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/?text="),
      "_blank",
      "noopener,noreferrer",
    );
    open.mockRestore();
  });
});
