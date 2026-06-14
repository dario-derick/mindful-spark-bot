import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, BookHeart, Sparkles, LineChart, MessageCircle, Lock, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Mood Tracking, Journaling & AI Insights | MindTrackAI" },
      {
        name: "description",
        content:
          "Explore MindTrackAI features: daily mood tracking, private journaling, AI-generated reflections, weekly insights, and a supportive wellness coach.",
      },
      { property: "og:title", content: "Features — MindTrackAI" },
      {
        property: "og:description",
        content:
          "Daily mood tracking, private journaling, AI reflections, and a supportive wellness coach.",
      },
      { property: "og:url", content: SITE_URL + "/features" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/features" }],
  }),
  component: FeaturesPage,
});

const features = [
  {
    icon: BookHeart,
    title: "Daily mood tracking",
    body: "Log how you feel in seconds with a gentle mood picker. No friction, no judgment, just a quiet check in.",
  },
  {
    icon: Sparkles,
    title: "AI reflections on every entry",
    body: "Each journal entry receives a soft, considered reflection that helps you notice what you might have missed.",
  },
  {
    icon: LineChart,
    title: "Weekly insights",
    body: "See your mood patterns, recurring themes, and small wins across the week, visualised clearly and calmly.",
  },
  {
    icon: MessageCircle,
    title: "Wellness coach chat",
    body: "Talk to a supportive AI companion any time. One rolling conversation that remembers context across sessions.",
  },
  {
    icon: Lock,
    title: "Private by design",
    body: "Your entries are scoped to your account with row level security. You own what you write.",
  },
  {
    icon: Moon,
    title: "Twilight serenity UI",
    body: "A dark, low stimulation interface designed to feel like a calm evening, not another loud productivity app.",
  },
];

function FeaturesPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Everything you need to <span className="text-aurora">know yourself</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          A small set of tools, chosen carefully. Each one designed to encourage reflection without
          demanding your attention.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border/60 bg-card-gradient p-6 shadow-soft backdrop-blur"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <f.icon className="h-4 w-4" />
            </div>
            <h2 className="mb-1 font-display text-xl">{f.title}</h2>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-border/60 bg-card/40 p-8 text-center backdrop-blur">
        <h2 className="font-display text-2xl md:text-3xl">Ready to start tracking?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Free to start. No credit card. <Check className="inline h-3 w-3 text-accent" /> Private by default.
        </p>
        <div className="mt-5">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Get started, it's free
            </Button>
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
