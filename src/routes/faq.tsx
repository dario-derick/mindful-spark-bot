import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

const faqs = [
  {
    q: "Who can see my journal entries?",
    a: "Only you. Entries are stored against your account and protected with row-level security in our database, so other users — and the rest of the internet — can't read them.",
  },
  {
    q: "Do you sell or share my data?",
    a: "No. We don't sell your data, share it with advertisers, or use your entries to train public AI models. Your reflections belong to you.",
  },
  {
    q: "How does the AI process my entries?",
    a: "When you ask for a reflection or chat with the coach, the relevant entry or recent conversation is sent to our AI gateway over an encrypted connection to generate a response. Content is not retained beyond what's needed to serve your request.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can delete individual journal entries any time. To delete your full account and all associated data, email hello@mindtrackai.app and we'll process the request promptly.",
  },
  {
    q: "Is MindTrackAI a replacement for therapy?",
    a: "No. MindTrackAI is a reflective wellness tool, not a medical service. If you're struggling, please reach out to a qualified mental health professional or a local crisis line.",
  },
  {
    q: "Where is my data stored?",
    a: "Your data is stored in our managed backend with encryption at rest and in transit. Access is restricted to authenticated requests from your account.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Privacy, Data & How It Works | MindTrackAI" },
      {
        name: "description",
        content:
          "Answers to common privacy questions about MindTrackAI: who can see your journal entries, how AI processes your data, and how to delete your account.",
      },
      { property: "og:title", content: "FAQ — MindTrackAI" },
      {
        property: "og:description",
        content:
          "Privacy, data handling, and how MindTrackAI works — answered.",
      },
      { property: "og:url", content: SITE_URL + "/faq" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/faq" }],
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
  component: FaqPage,
});

function FaqPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Frequently asked <span className="text-aurora">questions</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Mostly about privacy — because that's what matters most when you're writing things down.
        </p>
      </div>

      <div className="mt-14 space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-border/60 bg-card-gradient p-5 shadow-soft backdrop-blur open:bg-card/60"
          >
            <summary className="cursor-pointer list-none font-display text-lg marker:hidden">
              <span className="flex items-start justify-between gap-4">
                <span>{f.q}</span>
                <span className="mt-1 select-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Still have a question? Email <a className="underline hover:text-foreground" href="mailto:hello@mindtrackai.app">hello@mindtrackai.app</a>.
      </p>
    </MarketingShell>
  );
}
