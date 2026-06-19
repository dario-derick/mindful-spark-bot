import { createFileRoute, Link } from "@tanstack/react-router";
import { BookHeart, HeartHandshake, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MindTrackAI | Private Mood Tracking" },
      {
        name: "description",
        content:
          "MindTrackAI is a private reflection app for mood check-ins, journaling, AI reflections, and weekly patterns. It is not medical care.",
      },
      { property: "og:title", content: "About MindTrackAI" },
      {
        property: "og:description",
        content:
          "A private reflection app for mood check-ins, journaling, AI reflections, and weekly patterns.",
      },
      { property: "og:url", content: SITE_URL + "/about" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/about" }],
  }),
  component: AboutPage,
});

const principles = [
  {
    icon: BookHeart,
    title: "Simple check-ins first",
    body: "MindTrackAI is designed to make the first mood check-in easy, then make the weekly pattern useful enough to return to.",
  },
  {
    icon: Sparkles,
    title: "Gentle reflection",
    body: "AI reflections should help you notice themes in your own words without turning private notes into clinical claims.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Your entries are scoped to your account. Reflections belong to the person who wrote them, not advertisers or public model training sets.",
  },
  {
    icon: HeartHandshake,
    title: "A clear care boundary",
    body: "MindTrackAI is not a medical service, crisis service, diagnosis tool, or replacement for professional mental health care.",
  },
];

function AboutPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          MindTrackAI is a quieter way to notice what keeps showing up.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          MindTrackAI helps people keep a private record of moods, journal entries, and small
          patterns that are easy to miss in the middle of a busy week. It is built for reflection,
          not diagnosis.
        </p>
      </div>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card-gradient p-7 shadow-soft backdrop-blur md:p-9">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">What it is</p>
        <h2 className="mt-2 font-display text-2xl md:text-3xl">
          A personal wellness tool for private reflection.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
          You can check in, write what happened, and come back later to see the themes that keep
          repeating. MindTrackAI combines mood tracking, private journaling, AI reflections, weekly
          reports, and a supportive wellness coach in one calm place.
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {principles.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-soft backdrop-blur"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <item.icon className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card/30 p-7 text-center backdrop-blur md:p-9">
        <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          If you are in crisis or feel unsafe, contact a qualified professional, local emergency
          services, or a local crisis line.
        </p>
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start your first free check-in
            </Button>
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
