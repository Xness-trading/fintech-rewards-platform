import { renderWithActor } from "@/__tests__/test-utils";
import type { NotificationView, backendInterface } from "@/backend";
import { NotificationKind } from "@/backend";
import NotificationsPage from "@/pages/NotificationsPage";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const UNREAD: NotificationView = {
  id: 1n,
  title: "Payment approved",
  body: "Your payment was verified and your membership is active.",
  kind: NotificationKind.paymentApproved,
  createdAt: 1_700_000_000_000_000_000n,
  read: false,
};

const READ: NotificationView = {
  id: 2n,
  title: "Welcome to KuberX",
  body: "Your account was created successfully.",
  kind: NotificationKind.registration,
  createdAt: 1_700_000_000_000_000_000n,
  read: true,
};

type NotificationsActor = Pick<
  backendInterface,
  "listMyNotifications" | "markNotificationRead" | "markAllNotificationsRead"
>;

function actor(
  overrides: Partial<NotificationsActor> = {},
): NotificationsActor {
  return {
    listMyNotifications: vi.fn(async () => [UNREAD, READ]),
    markNotificationRead: vi.fn(async () => true),
    markAllNotificationsRead: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("NotificationsPage", () => {
  it("lists notifications and marks an unread alert as read", async () => {
    const user = userEvent.setup();
    const markNotificationRead = vi.fn(async () => true);
    renderWithActor(<NotificationsPage />, actor({ markNotificationRead }));

    expect(await screen.findByTestId("notifications.item.1")).toHaveTextContent(
      "Payment approved",
    );
    expect(
      screen.getByTestId("notifications.unread_summary"),
    ).toHaveTextContent("1");

    await user.click(screen.getByTestId("notifications.mark_read_button.1"));
    expect(markNotificationRead).toHaveBeenCalledWith(1n);
  });

  it("marks all alerts as read", async () => {
    const user = userEvent.setup();
    const markAllNotificationsRead = vi.fn(async () => undefined);
    renderWithActor(<NotificationsPage />, actor({ markAllNotificationsRead }));

    await screen.findByTestId("notifications.item.1");
    await user.click(screen.getByTestId("notifications.mark_all_read_button"));
    expect(markAllNotificationsRead).toHaveBeenCalledTimes(1);
  });

  it("shows an empty state when there are no alerts", async () => {
    renderWithActor(
      <NotificationsPage />,
      actor({ listMyNotifications: vi.fn(async () => []) }),
    );

    expect(
      await screen.findByTestId("notifications.empty_state"),
    ).toBeInTheDocument();
  });
});
