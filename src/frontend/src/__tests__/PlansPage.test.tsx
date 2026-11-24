import { renderWithActor } from "@/__tests__/test-utils";
import type { MembershipPlan } from "@/backend";
import PlansPage from "@/pages/PlansPage";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));

const PLANS: MembershipPlan[] = [
  {
    id: 1n,
    name: "Starter Plan",
    price: 150n,
    validityDays: 30n,
    benefits: ["Welcome reward eligibility"],
    rewardDetails: "Welcome reward",
    popular: false,
  },
  {
    id: 2n,
    name: "Basic Plan",
    price: 300n,
    validityDays: 30n,
    benefits: ["All Starter benefits"],
    rewardDetails: "Referral rewards",
    popular: false,
  },
  {
    id: 3n,
    name: "Popular Plan",
    price: 500n,
    validityDays: 30n,
    benefits: ["All Basic benefits"],
    rewardDetails: "Boosted reward",
    popular: true,
  },
  {
    id: 4n,
    name: "Silver Plan",
    price: 999n,
    validityDays: 30n,
    benefits: ["All Popular benefits"],
    rewardDetails: "Silver reward",
    popular: false,
  },
  {
    id: 5n,
    name: "Gold Plan",
    price: 1999n,
    validityDays: 30n,
    benefits: ["All Silver benefits"],
    rewardDetails: "Gold reward",
    popular: false,
  },
  {
    id: 6n,
    name: "Premium Plan",
    price: 4999n,
    validityDays: 30n,
    benefits: ["All Gold benefits"],
    rewardDetails: "Premium reward",
    popular: false,
  },
  {
    id: 7n,
    name: "VIP Plan",
    price: 9999n,
    validityDays: 30n,
    benefits: ["All Premium benefits"],
    rewardDetails: "VIP reward",
    popular: false,
  },
];

function actorWithPlans(plans: MembershipPlan[]) {
  return {
    listPlans: vi.fn<() => Promise<MembershipPlan[]>>(async () =>
      structuredClone(plans),
    ),
  };
}

describe("PlansPage", () => {
  it("renders exactly seven plans with the ₹500 plan marked most popular", async () => {
    renderWithActor(<PlansPage />, actorWithPlans(PLANS));

    const list = await screen.findByTestId("plans.list");
    const items = list.querySelectorAll('[data-ocid^="plans.item."]');
    expect(items).toHaveLength(7);

    const popularBadge = screen.getByTestId("plans.popular_badge");
    expect(popularBadge).toHaveTextContent(/most popular/i);

    // The popular badge sits inside the ₹500 plan card.
    const popularCard = popularBadge.closest("li");
    expect(popularCard).not.toBeNull();
    expect(popularCard).toHaveTextContent("Popular Plan");
    expect(popularCard).toHaveTextContent("₹500");
  });

  it("navigates to the payment page with the chosen plan id on Buy now", async () => {
    const user = userEvent.setup();
    renderWithActor(<PlansPage />, actorWithPlans(PLANS));

    await screen.findByTestId("plans.list");
    // Cards are sorted by price ascending, so the ₹500 plan is the third.
    await user.click(screen.getByTestId("plans.buy_button.3"));

    expect(navigate).toHaveBeenCalledWith({
      to: "/payment",
      search: { planId: "3" },
    });
  });

  it("shows an empty state when no plans are published", async () => {
    renderWithActor(<PlansPage />, actorWithPlans([]));

    expect(await screen.findByTestId("plans.empty_state")).toBeInTheDocument();
    expect(screen.queryByTestId("plans.list")).not.toBeInTheDocument();
  });
});
