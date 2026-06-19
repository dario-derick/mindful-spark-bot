import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  LayoutDashboard,
  BookHeart,
  Sparkles,
  MessageCircle,
  UserRound,
  LogOut,
  Menu,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/insights", label: "Reflection", icon: Sparkles },
  { to: "/coach", label: "Coach", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen">
      {/* sidebar — fixed on all breakpoints */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-5">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora shadow-glow">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">
              MindTrack<span className="text-aurora">AI</span>
            </span>
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* main — offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur-xl md:hidden">
          <Button size="icon" variant="ghost" onClick={() => setOpen((v) => !v)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display text-base">
            MindTrack<span className="text-aurora">AI</span>
          </span>
        </header>
        <main className="flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
        <footer className="border-t border-border/60 px-4 py-4 md:px-10">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} MindTrackAI. Built for wellness.
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <a href="#" className="transition-colors hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Terms
              </a>
              <a
                href="mailto:hello@mindtrackai.app"
                className="transition-colors hover:text-foreground"
              >
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
