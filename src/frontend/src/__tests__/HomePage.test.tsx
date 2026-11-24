import { renderWithActor } from "@/__tests__/test-utils";
import HomePage from "@/pages/HomePage";
import { screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// jsdom lacks IntersectionObserver; framer-motion's whileInView needs it.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver ??=
  IntersectionObserverStub as unknown as typeof IntersectionObserver;

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
}));

describe("HomePage", () => {
  it("renders the public homepage with the seven-plan range and ₹500 popular tier", () => {
    renderWithActor(<HomePage />, {});

    expect(screen.getByTestId("home.page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /grow your rewards with kuberx/i }),
    ).toBeInTheDocument();

    const tiers = screen
      .getByTestId("home.plans_section")
      .querySelectorAll('[data-ocid^="home.plan_tier."]');
    expect(tiers).toHaveLength(7);

    const popular = screen.getByTestId("home.plan_tier.popular");
    expect(popular).toHaveTextContent("₹500");
    expect(popular).toHaveTextContent(/most popular/i);
  });

  it("links the primary calls to action to register and sign-in", () => {
    renderWithActor(<HomePage />, {});

    expect(screen.getByTestId("home.create_account_button")).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByTestId("home.sign_in_button")).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
