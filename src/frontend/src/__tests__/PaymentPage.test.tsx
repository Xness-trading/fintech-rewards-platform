import { renderWithActor } from "@/__tests__/test-utils";
import type {
  AdminSettings,
  MembershipPlan,
  PaymentInput,
  PaymentView,
  backendInterface,
} from "@/backend";
import { PaymentStatus } from "@/backend";
import PaymentPage from "@/pages/PaymentPage";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const search = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

// jsdom does not implement object URLs; the page previews the chosen screenshot.
URL.createObjectURL ??= () => "blob:test-preview";
URL.revokeObjectURL ??= () => {};

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => search.current,
  useNavigate: () => vi.fn(),
}));

const PLAN: MembershipPlan = {
  id: 3n,
  name: "Popular Plan",
  price: 500n,
  validityDays: 30n,
  benefits: ["All Basic benefits"],
  rewardDetails: "Boosted reward",
  popular: true,
};

const SETTINGS: AdminSettings = {
  companyUpiId: "kuberx@upi",
  minWithdrawalAmount: 100n,
};

const PENDING_PAYMENT: PaymentView = {
  id: 1n,
  utr: "402312345678",
  status: PaymentStatus.pending,
  planId: 3n,
  user: { toString: () => "aaaaa-aa" } as PaymentView["user"],
  submittedAt: 1_700_000_000_000_000_000n,
  amount: 500n,
  planName: "Popular Plan",
};

type PaymentActor = Pick<
  backendInterface,
  "getPlan" | "getAdminSettings" | "submitPayment"
>;

function actor(overrides: Partial<PaymentActor> = {}): PaymentActor {
  return {
    getPlan: vi.fn(async () => PLAN),
    getAdminSettings: vi.fn(async () => SETTINGS),
    submitPayment: vi.fn<backendInterface["submitPayment"]>(async () => ({
      __kind__: "ok",
      ok: PENDING_PAYMENT,
    })),
    ...overrides,
  };
}

function screenshotFile() {
  const file = new File([new Uint8Array([1, 2, 3])], "proof.png", {
    type: "image/png",
  });
  // jsdom's File does not implement arrayBuffer(); the page reads the bytes.
  file.arrayBuffer = async () => new Uint8Array([1, 2, 3]).buffer;
  return file;
}

describe("PaymentPage", () => {
  it("shows the selected plan, company UPI ID and QR image", async () => {
    search.current = { planId: "3" };
    renderWithActor(<PaymentPage />, actor());

    expect(await screen.findByText("Popular Plan")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByTestId("payment.upi_id")).toHaveTextContent(
      "kuberx@upi",
    );
    expect(screen.getByTestId("payment.qr_image")).toBeInTheDocument();
  });

  it("submits a UTR and screenshot and shows the pending success state", async () => {
    search.current = { planId: "3" };
    const user = userEvent.setup();
    const submitPayment = vi.fn<backendInterface["submitPayment"]>(
      async () => ({ __kind__: "ok", ok: PENDING_PAYMENT }),
    );
    renderWithActor(<PaymentPage />, actor({ submitPayment }));

    await screen.findByText("Popular Plan");
    await user.type(screen.getByTestId("payment.utr_input"), "402312345678");
    await user.upload(
      screen.getByTestId("payment.screenshot_input"),
      screenshotFile(),
    );
    await user.click(screen.getByTestId("payment.submit_button"));

    expect(
      await screen.findByText("Payment Submitted Successfully"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pending Verification")).toBeInTheDocument();

    await waitFor(() => expect(submitPayment).toHaveBeenCalledTimes(1));
    const input: PaymentInput = submitPayment.mock.calls[0][0];
    expect(input.utr).toBe("402312345678");
    expect(input.planId).toBe(3n);
  });

  it("surfaces a duplicate UTR rejection from the backend", async () => {
    search.current = { planId: "3" };
    const user = userEvent.setup();
    const submitPayment = vi.fn<backendInterface["submitPayment"]>(
      async () => ({
        __kind__: "err",
        err: "This UTR / Transaction ID has already been submitted",
      }),
    );
    renderWithActor(<PaymentPage />, actor({ submitPayment }));

    await screen.findByText("Popular Plan");
    await user.type(screen.getByTestId("payment.utr_input"), "402312345678");
    await user.upload(
      screen.getByTestId("payment.screenshot_input"),
      screenshotFile(),
    );
    await user.click(screen.getByTestId("payment.submit_button"));

    expect(
      await screen.findByText(
        "This UTR / Transaction ID has already been submitted",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Payment Submitted Successfully"),
    ).not.toBeInTheDocument();
  });

  it("requires a screenshot before submitting", async () => {
    search.current = { planId: "3" };
    const user = userEvent.setup();
    const submitPayment = vi.fn<backendInterface["submitPayment"]>();
    renderWithActor(<PaymentPage />, actor({ submitPayment }));

    await screen.findByText("Popular Plan");
    await user.type(screen.getByTestId("payment.utr_input"), "402312345678");
    await user.click(screen.getByTestId("payment.submit_button"));

    expect(
      await screen.findByText("Upload a screenshot of your payment."),
    ).toBeInTheDocument();
    expect(submitPayment).not.toHaveBeenCalled();
  });
});
