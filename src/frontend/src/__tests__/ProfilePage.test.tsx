import { renderWithActor } from "@/__tests__/test-utils";
import type { UserProfileView, backendInterface } from "@/backend";
import ProfilePage from "@/pages/ProfilePage";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

type ProfileActor = Pick<
  backendInterface,
  "getCallerProfile" | "listMyPayments" | "listPlans" | "updateCallerProfile"
>;

function actor(overrides: Partial<ProfileActor> = {}): ProfileActor {
  return {
    getCallerProfile: vi.fn(async () => PROFILE),
    listMyPayments: vi.fn(async () => []),
    listPlans: vi.fn(async () => []),
    updateCallerProfile: vi.fn(async () => PROFILE),
    ...overrides,
  };
}

describe("ProfilePage", () => {
  it("shows the user's details and membership status", async () => {
    renderWithActor(<ProfilePage />, actor());

    expect(await screen.findByTestId("profile.card")).toHaveTextContent(
      "Aarav Sharma",
    );
    const details = screen.getByTestId("profile.details_card");
    expect(details).toHaveTextContent("aarav@example.com");
    expect(details).toHaveTextContent("9876543210");
    expect(details).toHaveTextContent("ABCD2345");
    expect(screen.getByTestId("profile.membership_badge")).toHaveTextContent(
      /no active membership/i,
    );
  });

  it("saves an edited full name", async () => {
    const user = userEvent.setup();
    const updateCallerProfile = vi.fn(async () => PROFILE);
    renderWithActor(<ProfilePage />, actor({ updateCallerProfile }));

    const nameInput = await screen.findByTestId("profile.name_input");
    fireEvent.change(nameInput, { target: { value: "Aarav S Sharma" } });
    await user.click(screen.getByTestId("profile.save_button"));

    expect(
      await screen.findByTestId("profile.success_state"),
    ).toBeInTheDocument();
    expect(updateCallerProfile).toHaveBeenCalledWith({
      fullName: "Aarav S Sharma",
      profilePicture: undefined,
    });
  });
});
