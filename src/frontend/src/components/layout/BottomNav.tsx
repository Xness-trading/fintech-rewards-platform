import { bottomNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

/** Mobile bottom navigation bar with the neon-cyan active state. */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      data-ocid="nav.bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                data-ocid={`nav.tab.${item.label.toLowerCase()}`}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-smooth",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
