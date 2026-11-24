import {
  Bell,
  CreditCard,
  Gift,
  Headphones,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Requires a signed-in user. */
  private?: boolean;
  /** Requires the admin role. */
  admin?: boolean;
}

/** Primary destinations shown in the desktop sidebar. */
export const sidebarNav: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    private: true,
  },
  { to: "/plans", label: "Plans", icon: CreditCard },
  { to: "/wallet", label: "Wallet", icon: Wallet, private: true },
  { to: "/referral", label: "Referrals", icon: Users, private: true },
  { to: "/transactions", label: "Transactions", icon: Receipt, private: true },
  { to: "/withdraw", label: "Withdraw", icon: Gift, private: true },
  { to: "/alerts", label: "Alerts", icon: Bell, private: true },
  { to: "/support", label: "Support", icon: Headphones, private: true },
  { to: "/profile", label: "Profile", icon: User, private: true },
];

/** Admin-only destination, rendered separately with a divider. */
export const adminNavItem: NavItem = {
  to: "/admin",
  label: "Admin console",
  icon: ShieldCheck,
  private: true,
  admin: true,
};

/** Destinations shown in the mobile bottom navigation bar. */
export const bottomNav: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, private: true },
  { to: "/wallet", label: "Wallet", icon: Wallet, private: true },
  { to: "/plans", label: "Plans", icon: CreditCard },
  { to: "/referral", label: "Refer", icon: Users, private: true },
  { to: "/profile", label: "Profile", icon: User, private: true },
];
