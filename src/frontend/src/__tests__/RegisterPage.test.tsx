import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type { UserProfileView, backendInterface } from "@/backend";
import RegisterPage from "@/pages/RegisterPage";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const navigate = vi.hoisted(() => vi.fn());

// jsdom lacks ResizeObserver; the Radix checkbox measures its size.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

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
  useNavigate: () => navigate,
}));

function signedInIdentity(): NonNullable<InternetIdentityContext["identity"]> {
  return {
    getPrincipal: () => ({ isAnonymous: () => false }),
  } as unknown as NonNullable<InternetIdentityContext["identity"]>;
}

type RegisterActor = Pick<backendInterface, "registerUser">;

const PROFILE: UserProfileView = {
  principal: { toString: () => "aaaaa-aa" } as UserProfileView["principal"],
  referralCode: "KUBERX1",
  emailVerified: false,
  blocked: false,
  fullName: "Aarav Sharma",
  mobileVerified: false,
  email: "aarav@example.com",
  mobile: "9876543210",
  registeredAt: 1_700_000_000_000_000_000n,
};

function actor(overrides: Partial<RegisterActor> = {}): RegisterActor {
  return {
    registerUser: vi.fn<backendInterface["registerUser"]>(async () => ({
      __kind__: "ok",
      ok: PROFILE,
    })),
    ...overrides,
  };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByTestId("register.full_name_input"),
    "Aarav Sharma",
  );
  await user.type(
    screen.getByTestId("register.email_input"),
    "aarav@example.com",
  );
  await user.type(screen.getByTestId("register.mobile_input"), "9876543210");
  await user.click(screen.getByTestId("register.terms_checkbox"));
}

describe("RegisterPage", () => {
  it("validates the required fields before submitting", async () => {
    setIdentityForTest({ identity: signedInIdentity() });
    const user = userEvent.setup();
    const registerUser = vi.fn<backendInterface["registerUser"]>();
    renderWithActor(<RegisterPage />, actor({ registerUser }));

    await user.click(screen.getByTestId("register.submit_button"));

    expect(screen.getByTestId("register.full_name_error")).toBeInTheDocument();
    expect(screen.getByTestId("register.email_error")).toBeInTheDocument();
    expect(screen.getByTestId("register.mobile_error")).toBeInTheDocument();
    expect(screen.getByTestId("register.terms_error")).toBeInTheDocument();
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email or mobile with the backend message", async () => {
    setIdentityForTest({ identity: signedInIdentity() });
    const user = userEvent.setup();
    const registerUser = vi.fn<backendInterface["registerUser"]>(async () => ({
      __kind__: "err",
      err: "An account with this email already exists",
    }));
    renderWithActor(<RegisterPage />, actor({ registerUser }));

    await fillValidForm(user);
    await user.click(screen.getByTestId("register.submit_button"));

    expect(await screen.findByTestId("register.error_state")).toHaveTextContent(
      "An account with this email already exists",
    );
    expect(registerUser).toHaveBeenCalledWith({
      fullName: "Aarav Sharma",
      email: "aarav@example.com",
      mobile: "9876543210",
      referralCode: undefined,
    });
  });

  it("registers a new user and navigates to the dashboard", async () => {
    setIdentityForTest({ identity: signedInIdentity() });
    const user = userEvent.setup();
    const registerUser = vi.fn<backendInterface["registerUser"]>(async () => ({
      __kind__: "ok",
      ok: PROFILE,
    }));
    renderWithActor(<RegisterPage />, actor({ registerUser }));

    await fillValidForm(user);
    await user.click(screen.getByTestId("register.submit_button"));

    expect(
      await screen.findByTestId("register.success_state"),
    ).toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });
});
