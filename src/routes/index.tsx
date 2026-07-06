import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Sparkles, BookHeart, MessageCircle, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://mindful-spark-bot.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindTrackAI | Private Mood Tracking & Weekly Reflections" },
      {
        name: "description",
        content:
          "Log moods, journal privately, and see weekly AI reflections that help you notice patterns. Free to start, not a therapy replacement.",
      },
      { property: "og:title", content: "MindTrackAI | Private Mood Tracking & Weekly Reflections" },
      {
        property: "og:description",
        content:
          "Log moods, journal privately, and see weekly AI reflections that help you notice patterns. Free to start, not a therapy replacement.",
      },
      { property: "og:url", content: SITE_URL + "/" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": SITE_URL + "/#org",
              name: "MindTrackAI",
              url: SITE_URL,
              description: "Private mood tracking, journaling, and weekly AI reflections.",
            },
            {
              "@type": "WebSite",
              "@id": SITE_URL + "/#website",
              url: SITE_URL,
              name: "MindTrackAI",
              publisher: { "@id": SITE_URL + "/#org" },
            },
            {
              "@type": "SoftwareApplication",
              name: "MindTrackAI",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* nav */}
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
              <Button variant="ghost" size="sm">
                Features
              </Button>
            </Link>
            <Link to="/pricing" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Pricing
              </Button>
            </Link>
            <Link to="/faq" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                FAQ
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-aurora text-primary-foreground hover:opacity-90">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-24 md:pt-44">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-accent" />
            Supporting UN SDG 3: Good Health and Well being
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            MindTrackAI helps you notice
            <span className="text-aurora"> the patterns behind your moods</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Log a quick mood, write what happened, and get gentle AI reflections that turn scattered
            notes into a weekly picture.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth">
              <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
                Start your first free check-in
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="ghost">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            MindTrackAI is for private reflection, not diagnosis or professional mental health care.
          </p>
        </div>

        {/* feature grid */}
        <div className="mt-20 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookHeart,
              title: "Mood & journal",
              body: "Capture how you feel and what's behind it, in seconds.",
            },
            {
              icon: Sparkles,
              title: "AI reflections",
              body: "Each entry receives a gentle wellness analysis.",
            },
            {
              icon: LineChart,
              title: "Weekly insights",
              body: "See patterns across moods, themes, and habits.",
            },
            {
              icon: MessageCircle,
              title: "Wellness coach",
              body: "Chat with a supportive AI companion any time.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-card-gradient p-5 shadow-soft backdrop-blur"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="mb-1 font-display text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MindTrackAI &middot; Supporting UN SDG 3
            &middot;{" "}
            <a href="https://tin.computer" className="transition-colors hover:text-foreground">
              Growth by Tin
            </a>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link to="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link to="/faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
            <a
              href="mailto:mindful-spark-bot@mail.tin.computer"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
