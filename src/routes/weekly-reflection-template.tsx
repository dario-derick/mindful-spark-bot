import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CopyCheck, HeartHandshake, ListChecks, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

const metaDescription =
  "Use a private weekly reflection template to notice mood patterns, journal context, and one next check-in. Start free with MindTrackAI.";

const templateSections = [
  {
    title: "1. Your week at a glance",
    purpose: "Summarize the week without forcing a long review.",
    fields: [
      "Week of:",
      "Mood check-ins completed:",
      "Journal notes added:",
      "Most common mood or signal:",
      "One sentence about the week:",
    ],
    prompt:
      "What shaped the week most: schedule, sleep, work, relationships, movement, rest, uncertainty, or something else?",
  },
  {
    title: "2. What kept showing up",
    purpose: "Name repeated themes without turning them into clinical labels.",
    fields: ["Theme 1:", "Theme 2:", "Theme 3:", "Was this a clear pattern or an early signal?"],
    prompt: "Which theme would you want to notice sooner next week?",
  },
  {
    title: "3. Mood rhythm",
    purpose: "Connect check-ins to the shape of the week.",
    fields: [
      "Days I checked in:",
      "The week felt more steady, more variable, or not clear yet:",
      "A moment that felt lighter:",
      "A moment that felt heavier:",
    ],
    prompt: "What happened before your mood shifted?",
  },
  {
    title: "4. Notes and context",
    purpose: "Add meaning without asking for public sharing.",
    fields: [
      "What gave me energy:",
      "What took energy:",
      "What helped, even a little:",
      "One thing I want to remember:",
    ],
    prompt:
      "These notes can stay private. Short labels work when full journal details feel too personal.",
  },
  {
    title: "5. One next gentle cue",
    purpose: "Turn reflection into the next check-in.",
    fields: [
      "Next time I check in, I want to notice:",
      "One small condition I can watch for:",
      "One support I might need:",
    ],
    prompt:
      "Notice what happened before the mood shifted, or add one line about what gave you energy.",
  },
];

const faqs = [
  {
    q: "What is a weekly reflection template?",
    a: "A weekly reflection template is a simple way to look back at what shaped your week. It can include mood check-ins, journal context, repeated themes, and one cue for the next check-in.",
  },
  {
    q: "Do I need to share my journal to use this?",
    a: "No. You can keep personal details private. The template works with short labels, counts, and your own notes.",
  },
  {
    q: "How often should I do a weekly reflection?",
    a: "Once a week is enough for most people. The goal is a calm habit, not daily pressure.",
  },
  {
    q: "Is MindTrackAI therapy?",
    a: "No. MindTrackAI is for private reflection and personal wellness. It is not therapy, diagnosis, treatment, crisis support, or a replacement for professional mental health care.",
  },
  {
    q: "What should I do if I need urgent help?",
    a: "Use local emergency services, a crisis line, or a trusted professional. MindTrackAI is not built for urgent or crisis situations.",
  },
];

export const Route = createFileRoute("/weekly-reflection-template")({
  head: () => ({
    meta: [
      { title: "Weekly reflection template for private mood check-ins | MindTrackAI" },
      { name: "description", content: metaDescription },
      {
        property: "og:title",
        content: "Weekly reflection template for private mood check-ins | MindTrackAI",
      },
      {
        property: "og:description",
        content:
          "Use a private weekly reflection template to notice mood patterns and one next check-in.",
      },
      { property: "og:url", content: SITE_URL + "/weekly-reflection-template" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/weekly-reflection-template" }],
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
  component: WeeklyReflectionTemplatePage,
});

function WeeklyReflectionTemplatePage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Weekly reflection template
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Weekly reflection template for <span className="text-aurora">private mood check-ins</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Use this weekly reflection template to notice what shaped your mood, what repeated, and
          one gentle cue for the next check-in.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          You do not need to share private journal details to use it. Keep the personal context in
          your own notes, or use MindTrackAI to turn small check-ins into a private weekly
          reflection.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start a free check-in
            </Button>
          </Link>
          <a href="#template">
            <Button size="lg" variant="ghost">
              Use the template first
            </Button>
          </a>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-xs text-muted-foreground">
          MindTrackAI is for private reflection. It is not therapy, diagnosis, crisis support, or a
          replacement for professional mental health care.
        </p>
      </div>

      <section id="template" className="mt-14 scroll-mt-28">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-3xl">The template</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Copy the sections into a journal, notes app, or your first MindTrackAI check-in.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {templateSections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-border/60 bg-card-gradient p-6 shadow-soft backdrop-blur"
            >
              <h3 className="font-display text-xl">{section.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{section.purpose}</p>
              <ul className="mt-5 grid gap-2 text-sm md:grid-cols-2">
                {section.fields.map((field) => (
                  <li
                    key={field}
                    className="rounded-lg border border-border/50 bg-background/30 px-3 py-2"
                  >
                    {field}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                <span className="text-foreground">Prompt:</span> {section.prompt}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: CalendarCheck,
            title: "Keep it weekly",
            body: "Once a week is enough. This should feel like a calm review, not pressure to maintain a perfect streak.",
          },
          {
            icon: CopyCheck,
            title: "Keep details private",
            body: "Short labels, counts, and your own notes are enough. You do not need to publish moods or journal entries.",
          },
          {
            icon: HeartHandshake,
            title: "Keep care boundaries clear",
            body: "MindTrackAI can help you reflect on patterns. It cannot diagnose, treat, respond to emergencies, or replace a qualified professional.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card/40 p-8 text-center backdrop-blur">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <PenLine className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl">
          Turn one check-in into next week&apos;s reflection
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          MindTrackAI helps you build this kind of weekly reflection from small private check-ins.
          Start with one mood log, add journal context when you want to, and return later to see
          what kept showing up.
        </p>
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start a free check-in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-center font-display text-3xl">Weekly reflection questions</h2>
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
    </MarketingShell>
  );
}
