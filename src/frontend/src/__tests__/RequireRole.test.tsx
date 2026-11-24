import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import { UserRole } from "@/backend";
import { RequireRole } from "@/components/RequireRole";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function identity(): NonNullable<InternetIdentityContext["identity"]> {
  return {
    getPrincipal: () => ({ isAnonymous: () => false }),
  } as unknown as NonNullable<InternetIdentityContext["identity"]>;
}

describe("RequireRole", () => {
  it("prompts a signed-out visitor to sign in instead of showing private content", () => {
    setIdentityForTest();
    renderWithActor(
      <RequireRole>
        <p>Secret dashboard</p>
      </RequireRole>,
      { getCallerUserRole: vi.fn(async () => UserRole.user) },
    );

    expect(screen.getByTestId("auth.panel")).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("denies a signed-in non-admin access to the admin console", async () => {
    setIdentityForTest({ identity: identity() });
    renderWithActor(
      <RequireRole adminOnly>
        <p>Admin console body</p>
      </RequireRole>,
      { getCallerUserRole: vi.fn(async () => UserRole.user) },
    );

    expect(await screen.findByTestId("auth.denied_state")).toBeInTheDocument();
    expect(screen.queryByText("Admin console body")).not.toBeInTheDocument();
  });

  it("renders the admin console for a signed-in admin", async () => {
    setIdentityForTest({ identity: identity() });
    renderWithActor(
      <RequireRole adminOnly>
        <p>Admin console body</p>
      </RequireRole>,
      { getCallerUserRole: vi.fn(async () => UserRole.admin) },
    );

    expect(await screen.findByText("Admin console body")).toBeInTheDocument();
    expect(screen.queryByTestId("auth.denied_state")).not.toBeInTheDocument();
  });
});
