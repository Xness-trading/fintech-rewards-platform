import { RequireRole } from "@/components/RequireRole";
import { Layout } from "@/components/layout/Layout";
import AdminPage from "@/pages/AdminPage";
import DashboardPage from "@/pages/DashboardPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotificationsPage from "@/pages/NotificationsPage";
import PaymentPage from "@/pages/PaymentPage";
import PlansPage from "@/pages/PlansPage";
import ProfilePage from "@/pages/ProfilePage";
import ReferralPage from "@/pages/ReferralPage";
import RegisterPage from "@/pages/RegisterPage";
import SupportPage from "@/pages/SupportPage";
import TransactionsPage from "@/pages/TransactionsPage";
import WalletPage from "@/pages/WalletPage";
import WithdrawPage from "@/pages/WithdrawPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { ReactElement } from "react";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "shell",
  component: Layout,
});

function privatePage(component: () => ReactElement) {
  return () => <RequireRole>{component()}</RequireRole>;
}

const homeRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/register",
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/dashboard",
  component: privatePage(DashboardPage),
});

const plansRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/plans",
  component: PlansPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/payment",
  component: privatePage(PaymentPage),
});

const walletRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/wallet",
  component: privatePage(WalletPage),
});

const referralRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/referral",
  component: privatePage(ReferralPage),
});

const withdrawRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/withdraw",
  component: privatePage(WithdrawPage),
});

const profileRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/profile",
  component: privatePage(ProfilePage),
});

const alertsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/alerts",
  component: privatePage(NotificationsPage),
});

const transactionsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/transactions",
  validateSearch: (search: Record<string, unknown>): { filter?: string } => ({
    filter: typeof search.filter === "string" ? search.filter : undefined,
  }),
  component: privatePage(TransactionsPage),
});

const supportRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/support",
  component: privatePage(SupportPage),
});

const adminRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: "/admin",
  component: () => (
    <RequireRole adminOnly>
      <AdminPage />
    </RequireRole>
  ),
});

const routeTree = rootRoute.addChildren([
  shellRoute.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    dashboardRoute,
    plansRoute,
    paymentRoute,
    walletRoute,
    referralRoute,
    withdrawRoute,
    profileRoute,
    alertsRoute,
    transactionsRoute,
    supportRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
