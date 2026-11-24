import { UserRole } from "@/backend";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useCallerRole } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Outlet } from "@tanstack/react-router";

/** Shared application shell: sidebar on desktop, bottom nav on mobile. */
export function Layout() {
  const { identity } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: role } = useCallerRole();
  const isAdmin = role === UserRole.admin;

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar signedIn={signedIn} />
        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-border px-4 py-6 lg:px-8">
          <p className="mx-auto max-w-6xl text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
