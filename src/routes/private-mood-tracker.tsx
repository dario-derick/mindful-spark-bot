import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, CheckCircle2, LockKeyhole, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

const metaDescription =
  "Track moods privately, add journal notes, and notice weekly patterns with MindTrackAI. Free to start, not diagnosis or medical care.";

const flowSteps = [
  "Choose what you want help noticing.",
  "Log how you feel right now.",
  "Add a short note if context matters.",
  "Return later to see weekly patterns.",
];

const sections = [
  {
    icon: CheckCircle2,
    title: "Track the mood without turning it into a project",
    body: "Start with a simple check-in: how you feel, what might have shaped it, and any short note you want to remember later. Keep it brief when you are busy and add more context when something feels worth naming.",
  },
  {
    icon: PenLine,
    title: "Add journal context when it helps",
    body: "Some days need more than a mood score. Add a few lines about sleep, work, relationships, habits, or anything else that may have affected the day. The point is not to write perfectly. It is to give your future self enough context to see the pattern.",
  },
  {
    icon: CalendarDays,
    title: "Come back to the week, not just the moment",
    body: "MindTrackAI is built around reflection over time. After a few check-ins, weekly reflections can help you notice repeated moods, themes, and gentle prompts for what to watch next.",
  },
];

const faqs = [
  {
    q: "Is MindTrackAI a private mood tracker?",
    a: "MindTrackAI is designed for personal mood check-ins, journal notes, and private reflection. Your entries should help you understand your own patterns, not become public posts or testimonials.",
  },
  {
    q: "Is MindTrackAI therapy or medical care?",
    a: "No. MindTrackAI is for private reflection and wellness tracking. It does not diagnose, treat, provide crisis support, or replace professional mental health care.",
  },
  {
    q: "Do I have to journal every day?",
    a: "No. You can start with a quick mood check-in and add journal notes only when they help. The goal is a useful record, not a perfect streak.",
  },
  {
    q: "What happens after a few check-ins?",
    a: "MindTrackAI can help turn repeated mood logs and notes into weekly reflections, so you can see themes that may be hard to notice in the moment.",
  },
  {
    q: "What should I avoid putting in a mood tracker?",
    a: "Avoid using MindTrackAI for emergencies or urgent care needs. If you need immediate help, contact local emergency services or a qualified professional.",
  },
];

export const Route = createFileRoute("/private-mood-tracker")({
  head: () => ({
    meta: [
      { title: "Private Mood Tracker | MindTrackAI" },
      { name: "description", content: metaDescription },
      { property: "og:title", content: "Private Mood Tracker | MindTrackAI" },
      {
        property: "og:description",
        content:
          "Track moods privately, add journal notes, and notice weekly patterns with MindTrackAI.",
      },
      { property: "og:url", content: SITE_URL + "/private-mood-tracker" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/private-mood-tracker" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: PrivateMoodTrackerPage,
});

function PrivateMoodTrackerPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Private mood tracker
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          A private mood tracker for <span className="text-aurora">noticing your patterns</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Your moods can feel clearer when they have a place to land. MindTrackAI helps you log a
          quick mood, add a journal note when you want context, and return to weekly reflections
          that show what kept coming up.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start your first free check-in
            </Button>
          </Link>
          <Link to="/faq">
            <Button size="lg" variant="ghost">
              See how MindTrackAI handles privacy
            </Button>
          </Link>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-xs text-muted-foreground">
          MindTrackAI is for private reflection. It is not diagnosis, treatment, crisis support, or
          a replacement for professional mental health care.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-border/60 bg-card-gradient p-6 shadow-soft backdrop-blur"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <section.icon className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card/40 p-7 backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl">Your notes do not need to become public</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Mood check-ins and journal notes are personal reflection material. They belong in your
              account, are meant for your own reflection, and should not be turned into public
              content, ads, or testimonials.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/40 p-5 text-sm">
            <h3 className="font-display text-lg">First check-in flow</h3>
            <ol className="mt-4 space-y-3 text-muted-foreground">
              {flowSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-center font-display text-3xl">Questions before you start</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border/60 bg-card-gradient p-5 shadow-soft backdrop-blur open:bg-card/60"
            >
              <summary className="cursor-pointer list-none font-display text-lg marker:hidden">
                <span className="flex items-start justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="mt-1 select-none text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border/60 bg-card/40 p-8 text-center backdrop-blur">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl">Start with one private check-in</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Choose what you want help noticing, log how you feel, and keep the context as short or
          detailed as you want.
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
