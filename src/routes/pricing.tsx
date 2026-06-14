import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, SITE_URL } from "@/components/MarketingShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free Forever | MindTrackAI" },
      {
        name: "description",
        content:
          "MindTrackAI pricing: free mood tracking, journaling, AI reflections, and wellness coach chat. No credit card required.",
      },
      { property: "og:title", content: "Pricing — MindTrackAI" },
      {
        property: "og:description",
        content:
          "Free mood tracking, journaling, and AI wellness insights. No credit card required.",
      },
      { property: "og:url", content: SITE_URL + "/pricing" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "MindTrackAI",
          description: "AI-guided mood tracking, journaling, and wellness insights.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: SITE_URL + "/pricing",
          },
        }),
      },
    ],
  }),
  component: PricingPage,
});

const features = [
  "Unlimited mood logs",
  "Unlimited journal entries",
  "AI reflection on every entry",
  "Weekly insights & patterns",
  "Rolling wellness coach chat",
  "Private by design (row-level security)",
];

function PricingPage() {
  return (
    <MarketingShell>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Simple, <span className="text-aurora">honest pricing</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          MindTrackAI is free while we're in early access. No credit card, no trial games, no
          surprise upsells.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card-gradient p-8 shadow-soft backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Personal</p>
          <h2 className="mt-1 font-display text-3xl">Free</h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything, for everyone, while in early access.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 flex-none text-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link to="/auth">
              <Button className="w-full bg-aurora text-primary-foreground hover:opacity-90">
                Get started — free
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border/40 bg-card/30 p-8 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Future Pro</p>
          <h2 className="mt-1 font-display text-3xl text-muted-foreground">Coming later</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If we ever add paid features (advanced analytics, longer chat memory, export tools),
            we'll tell early users first and keep a generous free tier.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" /> Deep mood analytics</li>
            <li className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" /> Long-term chat memory</li>
            <li className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" /> Data export & integrations</li>
          </ul>
          <div className="mt-8">
            <Button variant="ghost" className="w-full" disabled>Not available yet</Button>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        MindTrackAI is a wellness companion, not a substitute for professional mental health care.
      </p>
    </MarketingShell>
  );
}
