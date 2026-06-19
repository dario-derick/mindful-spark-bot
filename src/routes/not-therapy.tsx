import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

const metaDescription =
  "MindTrackAI helps with private mood check-ins and reflection. It is not therapy, diagnosis, crisis support, or medical care.";

const usefulFor = [
  "Log a mood in a minute or two.",
  "Add a private journal note when context matters.",
  "Notice repeated themes across a week.",
  "Ask a supportive AI coach to help you reflect on a pattern.",
  "Build a calmer check-in habit over time.",
];

const notFor = [
  "Diagnose mental health conditions.",
  "Provide therapy, treatment, or medical advice.",
  "Replace a therapist, doctor, counselor, or other qualified professional.",
  "Monitor risk or respond in a crisis.",
  "Promise that a reflection, report, or AI response is medically correct.",
  "Make workplace, school, legal, insurance, or care decisions for you.",
];

const professionalSupportSignals = [
  "You feel unsafe or may hurt yourself or someone else.",
  "You need urgent help right now.",
  "Your mood, stress, sleep, or thoughts are disrupting daily life.",
  "You are making decisions about medication, diagnosis, treatment, leave, school accommodations, or clinical care.",
  "Someone else is depending on you to assess risk or provide care.",
];

const faqs = [
  {
    q: "Is MindTrackAI therapy?",
    a: "No. MindTrackAI is a private reflection and wellness tool. It is not therapy, diagnosis, treatment, crisis support, or medical care.",
  },
  {
    q: "Can MindTrackAI diagnose me?",
    a: "No. MindTrackAI does not diagnose conditions, assess clinical risk, or decide what care you need.",
  },
  {
    q: "Can I use MindTrackAI with a therapist or doctor?",
    a: "You can use your own notes to prepare for a conversation with a qualified professional. MindTrackAI should not replace that professional's guidance.",
  },
  {
    q: "What should I do if I feel unsafe?",
    a: "Do not rely on MindTrackAI. Contact local emergency services, a crisis line, or a trusted qualified professional.",
  },
  {
    q: "What is MindTrackAI useful for?",
    a: "It is useful for private mood check-ins, journaling, weekly reflection, and noticing personal patterns over time.",
  },
];

export const Route = createFileRoute("/not-therapy")({
  head: () => ({
    meta: [
      { title: "MindTrackAI is for reflection, not therapy" },
      { name: "description", content: metaDescription },
      { property: "og:title", content: "MindTrackAI is for reflection, not therapy" },
      {
        property: "og:description",
        content:
          "MindTrackAI helps with private mood check-ins and reflection. It is not therapy or medical care.",
      },
      { property: "og:url", content: SITE_URL + "/not-therapy" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/not-therapy" }],
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
  component: NotTherapyPage,
});

function NotTherapyPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Care boundary</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-6xl">
          MindTrackAI is for <span className="text-aurora">reflection, not therapy</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          MindTrackAI helps you check in with your mood, write private notes, and notice patterns
          that may be easy to miss during the week.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          It is a wellness and reflection tool. It is not therapy, diagnosis, treatment, crisis
          support, medical advice, or a replacement for a qualified professional.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start a free check-in
            </Button>
          </Link>
          <a href="#what-its-for">
            <Button size="lg" variant="ghost">
              See what MindTrackAI is for
            </Button>
          </a>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-xs text-muted-foreground">
          If you need care, feel unsafe, or are dealing with something urgent, use professional or
          emergency support instead.
        </p>
      </div>

      <section id="what-its-for" className="mt-14 grid scroll-mt-28 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card-gradient p-6 shadow-soft backdrop-blur">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl">What MindTrackAI is for</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            MindTrackAI is useful for personal reflection and low-pressure self-awareness. The
            product works best when the question is simple: what kept showing up for me this week?
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {usefulFor.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl">What MindTrackAI is not</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            MindTrackAI should not be used as a clinical or emergency tool. If you are not sure
            whether you need professional support, choose the safer path and talk with a qualified
            person.
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {notFor.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card-gradient p-7 shadow-soft backdrop-blur">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl">When to seek professional help</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Use professional or urgent support when the situation is bigger than private reflection.
          MindTrackAI is not built for those moments.
        </p>
        <ul className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          {professionalSupportSignals.map((signal) => (
            <li
              key={signal}
              className="rounded-lg border border-border/50 bg-background/30 px-3 py-2"
            >
              {signal}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          If there is immediate danger, contact local emergency services. If you are in emotional
          crisis, contact a local crisis line or a qualified professional.
        </p>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
          <h2 className="font-display text-2xl">Why the boundary matters</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            MindTrackAI can be useful because it stays focused. It gives you a private place to log
            what happened, come back later, and see what kept showing up. That is different from
            clinical care.
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
          <h2 className="font-display text-2xl">Your reflection can stay private</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            You can use short labels, private notes, or mood check-ins without sharing your journal
            with anyone. MindTrackAI should not ask you to publish private mood data or journal
            details as proof.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-center font-display text-3xl">Care-boundary questions</h2>
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
          <HeartPulse className="h-5 w-5" />
        </div>
        <h2 className="font-display text-2xl md:text-3xl">Start with one private check-in</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Create a free account, log one mood, and start a private reflection habit. No credit card
          required.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground">
          MindTrackAI is for noticing patterns in your own words. It is not therapy or crisis
          support.
        </p>
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-aurora text-primary-foreground hover:opacity-90">
              Start a free check-in
            </Button>
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
