import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora shadow-glow">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">
              MindTrack<span className="text-aurora">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/features" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">Features</Button>
            </Link>
            <Link to="/pricing" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link to="/faq" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">FAQ</Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-aurora text-primary-foreground hover:opacity-90">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24 md:pt-40">{children}</main>

      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MindTrackAI &middot; Supporting UN SDG 3
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/features" className="transition-colors hover:text-foreground">Features</Link>
            <Link to="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
            <Link to="/faq" className="transition-colors hover:text-foreground">FAQ</Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">Sign in</Link>
            <a href="mailto:mindful-spark-bot@mail.tin.computer" className="transition-colors hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const SITE_URL = "https://mindful-spark-bot.lovable.app";
