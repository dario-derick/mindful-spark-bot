import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenText, CalendarDays, NotebookPen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog | Reflection Notes | MindTrackAI" },
      {
        name: "description",
        content:
          "Simple reflection notes from MindTrackAI: journaling prompts, mood check-in ideas, and plain privacy boundaries for early users.",
      },
      { property: "og:title", content: "MindTrackAI Blog" },
      {
        property: "og:description",
        content:
          "Simple reflection notes, mood check-in ideas, and privacy boundaries from MindTrackAI.",
      },
      { property: "og:url", content: SITE_URL + "/blog" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/blog" }],
  }),
  component: BlogPage,
});

const notes = [
  {
    icon: NotebookPen,
    title: "A weekly mirror prompt",
    body: "A quiet journaling cue for noticing what kept coming up this week, without asking you to share private details.",
  },
  {
    icon: CalendarDays,
    title: "A steadier mood check-in",
    body: "A short way to mark how you feel and what may be underneath it before the day gets too loud.",
  },
  {
    icon: ShieldCheck,
    title: "The product boundary",
    body: "MindTrackAI is for private reflection and pattern noticing. It is not therapy, diagnosis, treatment, or crisis support.",
  },
];

function BlogPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground">
          Reflection notes
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          A small blog for calmer self-reflection.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          MindTrackAI is early, so this space will start small: practical prompts, mood-tracking
          ideas, and plain notes about privacy and care boundaries.
        </p>
      </div>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card-gradient p-7 text-center shadow-soft backdrop-blur md:p-9">
        <BookOpenText className="mx-auto h-9 w-9 text-primary" />
        <h2 className="mt-4 font-display text-2xl md:text-3xl">Guides are being written now.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          Until the first full guide is ready, the clearest place to begin is one private check-in.
          Log how you feel, add the context you want to keep, and let MindTrackAI help you notice
          patterns over time.
        </p>
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start a free check-in
            </Button>
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {notes.map((note) => (
          <article
            key={note.title}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-soft backdrop-blur"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <note.icon className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl">{note.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.body}</p>
          </article>
        ))}
      </div>
    </MarketingShell>
  );
}
