import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateWeeklyInsight, listInsights, type WeeklyInsight } from "@/lib/insights.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — MindTrackAI" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInsights);
  const genFn = useServerFn(generateWeeklyInsight);

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => listFn(),
  });

  const generate = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => {
      toast.success("Weekly report ready");
      qc.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Insights</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated reflections on your past week.
          </p>
        </div>
        <Button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="bg-aurora text-primary-foreground hover:opacity-90"
        >
          {generate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate weekly report
            </>
          )}
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && insights.length === 0 && (
        <Card className="border-border/60 bg-card-gradient shadow-soft">
          <CardContent className="p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-accent" />
            <p className="mt-3 text-sm text-muted-foreground">
              No reports yet. Generate your first weekly reflection above.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {insights.map((row) => {
          const c = row.content as WeeklyInsight;
          return (
            <Card key={row.id} className="border-border/60 bg-card-gradient shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-xl">{c.headline}</CardTitle>
                <CardDescription>
                  {row.period_start && row.period_end
                    ? `${new Date(row.period_start).toLocaleDateString()} – ${new Date(row.period_end).toLocaleDateString()}`
                    : new Date(row.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <Row label="Mood trend" value={c.mood_trend} />
                {c.common_emotions?.length > 0 && (
                  <Row label="Common emotions">
                    <div className="flex flex-wrap gap-1.5">
                      {c.common_emotions.map((e) => (
                        <Badge key={e} variant="secondary">{e}</Badge>
                      ))}
                    </div>
                  </Row>
                )}
                {c.positive_habits?.length > 0 && (
                  <Row label="Positive habits">
                    <ul className="list-disc space-y-1 pl-5">
                      {c.positive_habits.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </Row>
                )}
                {c.areas_to_watch?.length > 0 && (
                  <Row label="Areas to watch">
                    <ul className="list-disc space-y-1 pl-5">
                      {c.areas_to_watch.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </Row>
                )}
                {c.recommendations?.length > 0 && (
                  <Row label="Suggestions">
                    <ul className="list-disc space-y-1 pl-5">
                      {c.recommendations.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </Row>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>{value ?? children}</div>
    </div>
  );
}
