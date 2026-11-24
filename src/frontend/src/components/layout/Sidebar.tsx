import { adminNavItem, sidebarNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

interface SidebarProps {
  isAdmin: boolean;
}

/** Persistent desktop sidebar with the neon-cyan active state. */
export function Sidebar({ isAdmin }: SidebarProps) {
  return (
    <aside
      data-ocid="nav.sidebar"
      className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-sidebar-foreground">
          Kuber<span className="text-primary">X</span>
        </span>
      </div>

      <nav
        aria-label="Primary"
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        {sidebarNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        {isAdmin && (
          <>
            <div className="my-2 h-px bg-sidebar-border" />
            <SidebarLink item={adminNavItem} />
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground">
          Premium rewards, transparent payouts.
        </p>
      </div>
    </aside>
  );
}

function SidebarLink({ item }: { item: (typeof sidebarNav)[number] }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      data-ocid={`nav.link.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
      activeProps={{
        className:
          "bg-sidebar-accent text-primary shadow-[inset_2px_0_0_0_oklch(var(--primary))]",
      }}
      inactiveProps={{ className: "text-sidebar-foreground/70" }}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
