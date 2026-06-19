import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  generateWeeklyInsight,
  getWeeklyReflectionShell,
  listInsights,
  type WeeklyInsight,
  type WeeklyReflectionShell,
} from "@/lib/insights.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookHeart,
  CalendarDays,
  Heart,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Weekly reflection - MindTrackAI" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInsights);
  const genFn = useServerFn(generateWeeklyInsight);
  const reflectionFn = useServerFn(getWeeklyReflectionShell);

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => listFn(),
  });
  const { data: reflection, isLoading: isReflectionLoading } = useQuery({
    queryKey: ["weekly-reflection-shell"],
    queryFn: () => reflectionFn(),
  });

  const generate = useMutation({
    mutationFn: () => genFn(),
    onSuccess: () => {
      toast.success("Weekly report ready");
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["weekly-reflection-shell"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Weekly reflection</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See what shaped your week, what repeated, and one gentle cue for your next check-in.
          </p>
        </div>
        <Button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="bg-aurora text-primary-foreground hover:opacity-90"
        >
          {generate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate weekly report
            </>
          )}
        </Button>
      </div>

      {isReflectionLoading && (
        <Card className="border-border/60 bg-card-gradient shadow-soft">
          <CardContent className="flex min-h-48 items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your reflection...
          </CardContent>
        </Card>
      )}
      {reflection && <WeeklyReflectionShellCard reflection={reflection} />}

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl">Saved reports</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-generated weekly reports you have already created.
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
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
                      ? `${new Date(row.period_start).toLocaleDateString()} to ${new Date(row.period_end).toLocaleDateString()}`
                      : new Date(row.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <Row label="Mood trend" value={c.mood_trend} />
                  {c.common_emotions?.length > 0 && (
                    <Row label="Common emotions">
                      <div className="flex flex-wrap gap-1.5">
                        {c.common_emotions.map((e) => (
                          <Badge key={e} variant="secondary">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </Row>
                  )}
                  {c.positive_habits?.length > 0 && (
                    <Row label="Positive habits">
                      <ul className="list-disc space-y-1 pl-5">
                        {c.positive_habits.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </Row>
                  )}
                  {c.areas_to_watch?.length > 0 && (
                    <Row label="Areas to watch">
                      <ul className="list-disc space-y-1 pl-5">
                        {c.areas_to_watch.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </Row>
                  )}
                  {c.recommendations?.length > 0 && (
                    <Row label="Suggestions">
                      <ul className="list-disc space-y-1 pl-5">
                        {c.recommendations.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </Row>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function WeeklyReflectionShellCard({ reflection }: { reflection: WeeklyReflectionShell }) {
  const tierLabel =
    reflection.tier === "full"
      ? "Full reflection"
      : reflection.tier === "starter"
        ? "Starter reflection"
        : "Getting started";
  const moodReadLabel = {
    not_enough_yet: "Not enough yet",
    more_steady: "More steady",
    more_variable: "More variable",
  }[reflection.mood_read];

  return (
    <Card className="overflow-hidden border-border/60 bg-card-gradient shadow-soft">
      <CardHeader className="border-b border-border/60 bg-background/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={reflection.tier === "empty_state" ? "secondary" : "default"}>
                {tierLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatWindow(reflection.window_start, reflection.window_end)}
              </span>
            </div>
            <CardTitle className="font-display text-2xl">{reflection.headline}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">{reflection.summary_line}</CardDescription>
          </div>
          <Button asChild className="bg-aurora text-primary-foreground hover:opacity-90">
            <Link
              to="/dashboard"
              data-event="weekly_reflection_next_check_in_clicked"
              data-weekly-reflection-tier={reflection.tier}
            >
              Start next check-in <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <ReflectionMetric
            icon={<Heart className="h-4 w-4" />}
            label="Mood check-ins"
            value={reflection.mood_count.toString()}
            hint={moodReadLabel}
          />
          <ReflectionMetric
            icon={<BookHeart className="h-4 w-4" />}
            label="Journal context"
            value={reflection.journal_count.toString()}
            hint={
              reflection.journal_count > 0 ? "Included this week" : "Optional for richer context"
            }
          />
          <ReflectionMetric
            icon={<MessageCircle className="h-4 w-4" />}
            label="Coach thread"
            value={reflection.coach_message_count.toString()}
            hint={
              reflection.coach_message_count > 0 ? "Ready for handoff" : "Available if you want it"
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border border-border/60 bg-background/25 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-accent" />
              What kept showing up
            </div>
            {reflection.theme_labels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reflection.theme_labels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                A few check-ins will give MindTrackAI more to reflect back.
              </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">{reflection.context_line}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/25 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-accent" />
              Next gentle cue
            </div>
            <p className="text-sm text-muted-foreground">{reflection.next_cue}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link
                  to="/journal"
                  data-event="weekly_reflection_journal_clicked"
                  data-weekly-reflection-tier={reflection.tier}
                >
                  Add a note
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  to="/coach"
                  data-event="weekly_reflection_coach_clicked"
                  data-weekly-reflection-tier={reflection.tier}
                >
                  Talk through a pattern
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-background/25 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <BookHeart className="h-4 w-4 text-accent" />
              Notes and context
            </div>
            <p className="text-sm text-muted-foreground">{reflection.context_line}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/25 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4 text-accent" />
              Coach handoff
            </div>
            <p className="text-sm text-muted-foreground">{reflection.coach_line}</p>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-border/60 bg-background/25 p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            MindTrackAI is for private reflection, not diagnosis, treatment, crisis support, or a
            replacement for professional mental health care.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReflectionMetric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/25 p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <div className="mt-2 font-display text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function formatWindow(start: string, end: string) {
  return `${new Date(start).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} to ${new Date(end).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
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
