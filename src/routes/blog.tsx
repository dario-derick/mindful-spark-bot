import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpenText,
  BriefcaseBusiness,
  GraduationCap,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "MindTrackAI Blog | Private Reflection Guides" },
      {
        name: "description",
        content:
          "Reflection prompts, mood-tracking guides, and privacy-first journaling ideas from MindTrackAI.",
      },
      { property: "og:title", content: "MindTrackAI Blog" },
      {
        property: "og:description",
        content: "Reflection prompts, mood-tracking guides, and privacy-first journaling ideas.",
      },
      { property: "og:url", content: SITE_URL + "/blog" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/blog" }],
  }),
  component: BlogPage,
});

const lanes = [
  {
    icon: NotebookPen,
    title: "Weekly reflection prompts",
    body: "For people who already journal and want a steadier way to make sense of the week.",
  },
  {
    icon: GraduationCap,
    title: "High-stress check-ins",
    body: "Exam-week and pressure-period prompts that stay practical, calm, and non-clinical.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Work-stress patterns",
    body: "Guides for noticing the situations, habits, and rhythms that keep showing up at work.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy and product boundaries",
    body: "Plain-language explainers about private reflection, data use, and what MindTrackAI is not for.",
  },
];

function BlogPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Practical reflection guides, without the noise.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          The MindTrackAI blog will start as a small library of check-in prompts, mood-tracking
          guides, and privacy-first reflection templates.
        </p>
      </div>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card-gradient p-7 text-center shadow-soft backdrop-blur md:p-9">
        <BookOpenText className="mx-auto h-9 w-9 text-primary" />
        <h2 className="mt-4 font-display text-2xl md:text-3xl">Guides are coming soon.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          For now, start with a private check-in and let MindTrackAI help you notice the patterns
          behind your moods.
        </p>
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start a free check-in
            </Button>
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {lanes.map((lane) => (
          <div
            key={lane.title}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-soft backdrop-blur"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <lane.icon className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl">{lane.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{lane.body}</p>
          </div>
        ))}
      </div>
    </MarketingShell>
  );
}
