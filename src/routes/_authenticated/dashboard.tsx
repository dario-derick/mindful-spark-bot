import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardData } from "@/lib/dashboard.functions";
import { createMoodEntry, MOOD_LABEL, type MoodLevel } from "@/lib/mood.functions";
import { updateOnboardingIntent, type OnboardingIntent } from "@/lib/profile.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoodPicker } from "@/components/MoodPicker";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Flame, BookHeart, TrendingUp, Heart, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MindTrackAI" }] }),
  component: DashboardPage,
});

const MOOD_COLORS: Record<MoodLevel, string> = {
  great: "var(--color-chart-5)",
  good: "var(--color-chart-1)",
  neutral: "var(--color-chart-2)",
  low: "var(--color-chart-3)",
  very_low: "var(--color-chart-4)",
};

const CHECK_IN_INTENT_OPTIONS: {
  label: string;
  value: OnboardingIntent;
  body: string;
}[] = [
  {
    label: "Patterns in my moods",
    value: "mood_patterns",
    body: "See how your mood changes over time.",
  },
  {
    label: "What lifts or drains me",
    value: "energy_drivers",
    body: "Notice activities, people, or situations that affect energy.",
  },
  {
    label: "Stress that keeps showing up",
    value: "recurring_stress",
    body: "Name repeated pressure points without making them clinical labels.",
  },
  {
    label: "How routines affect me",
    value: "routine_signals",
    body: "Connect sleep, habits, work, school, or rhythm to mood.",
  },
  {
    label: "I'm not sure yet",
    value: "not_sure",
    body: "Keep the first check-in open and low pressure.",
  },
];

function DashboardPage() {
  const qc = useQueryClient();
  const fetchDashboard = useServerFn(getDashboardData);
  const logMood = useServerFn(createMoodEntry);
  const saveOnboardingIntent = useServerFn(updateOnboardingIntent);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  const mutation = useMutation({
    mutationFn: (v: { mood: MoodLevel; notes?: string; tags?: string[] }) => logMood({ data: v }),
    onSuccess: () => {
      toast.success("Mood logged");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const intentMutation = useMutation({
    mutationFn: (v: { intent: OnboardingIntent; customText?: string }) =>
      saveOnboardingIntent({
        data: {
          onboarding_intent: v.intent,
          onboarding_intent_other_text: v.intent === "other" ? v.customText : null,
        },
      }),
    onSuccess: () => {
      toast.success("Check-in focus saved");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save focus"),
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your space…
      </div>
    );
  }

  const showIntentPrompt = !data.hasLoggedAnyMood && !data.profile?.onboarding_intent_selected_at;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">A gentle look at where you've been.</p>
      </div>

      {showIntentPrompt && (
        <CheckInIntentPrompt
          saving={intentMutation.isPending}
          onSubmit={(intent, customText) => intentMutation.mutate({ intent, customText })}
          onSkip={() => intentMutation.mutate({ intent: "skipped" })}
        />
      )}

      {/* stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Mood streak"
          value={`${data.moodStreak.current}d`}
          hint={`Longest ${data.moodStreak.longest}d`}
        />
        <StatCard
          icon={<BookHeart className="h-4 w-4" />}
          label="Journal entries"
          value={data.totals.journals.toString()}
          hint={`Streak ${data.journalStreak.current}d`}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Weekly mood avg"
          value={data.weeklyAvg ? data.weeklyAvg.toFixed(1) : "—"}
          hint="out of 5"
        />
        <StatCard
          icon={<Heart className="h-4 w-4" />}
          label="Wellness score"
          value={`${data.wellnessScore}`}
          hint="out of 100"
          accent
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* mood trend */}
        <Card className="border-border/60 bg-card-gradient shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Mood trend (last 14 days)</CardTitle>
            <CardDescription>Average mood score per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={data.dailySeries}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis domain={[1, 5]} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      color: "var(--color-popover-foreground)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--color-accent)", r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* mood distribution */}
        <Card className="border-border/60 bg-card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="font-display">Mood distribution</CardTitle>
            <CardDescription>Last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart
                  data={data.distribution.map((d) => ({ ...d, label: MOOD_LABEL[d.mood] }))}
                >
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.distribution.map((d) => (
                      <Cell key={d.mood} fill={MOOD_COLORS[d.mood]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card-gradient shadow-soft lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-display">Check in</CardTitle>
            <CardDescription>A quick mood log.</CardDescription>
          </CardHeader>
          <CardContent>
            <MoodPicker submitting={mutation.isPending} onSubmit={(v) => mutation.mutate(v)} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card-gradient shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Recent reflections</CardTitle>
            <CardDescription>Your latest journal entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentJournals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No entries yet.{" "}
                <Link to="/journal" className="text-primary underline">
                  Write your first
                </Link>
                .
              </p>
            ) : (
              data.recentJournals.map((j) => (
                <Link
                  key={j.id}
                  to="/journal/$id"
                  params={{ id: j.id }}
                  className="block rounded-xl border border-border/60 bg-background/30 p-4 transition-colors hover:border-primary/40 hover:bg-background/50"
                >
                  <div className="text-xs text-muted-foreground">
                    {new Date(j.created_at).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm">{j.summary ?? "Entry"}</div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckInIntentPrompt({
  saving,
  onSubmit,
  onSkip,
}: {
  saving: boolean;
  onSubmit: (intent: OnboardingIntent, customText?: string) => void;
  onSkip: () => void;
}) {
  const [selected, setSelected] = useState<OnboardingIntent>("mood_patterns");
  const [customText, setCustomText] = useState("");

  const customSelected = selected === "other";

  return (
    <Card className="border-primary/30 bg-card-gradient shadow-soft">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <CardTitle className="font-display text-2xl">Before your first check-in</CardTitle>
        <CardDescription>
          Choose what you want MindTrackAI to help you notice. Pick one for now, or skip and start
          logging.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h2 className="font-display text-xl">
            What would you like help noticing about your week?
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {CHECK_IN_INTENT_OPTIONS.map((option) => {
              const active = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={saving}
                  onClick={() => setSelected(option.value)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? "border-primary/70 bg-primary/15"
                      : "border-border/60 bg-background/30 hover:border-primary/40"
                  }`}
                >
                  <span className="block font-display text-base">{option.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                    {option.body}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              disabled={saving}
              onClick={() => setSelected("other")}
              className={`rounded-xl border p-4 text-left transition-colors ${
                customSelected
                  ? "border-primary/70 bg-primary/15"
                  : "border-border/60 bg-background/30 hover:border-primary/40"
              }`}
            >
              <span className="block font-display text-base">Something else I want to notice</span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                Keep it short. This is only to guide your private reflections.
              </span>
            </button>
          </div>
        </div>

        {customSelected && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="custom-intent">
              Something else I want to notice
            </label>
            <Input
              id="custom-intent"
              value={customText}
              maxLength={120}
              disabled={saving}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="A pattern I want to understand..."
            />
            <p className="text-xs text-muted-foreground">
              This text stays in your product profile and is not sent to analytics.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-background/30 p-4 text-xs leading-5 text-muted-foreground">
          MindTrackAI is for private reflection, not diagnosis or professional mental health care.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={saving}
            onClick={() => onSubmit(selected, customText)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-aurora px-8 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? "Saving..." : "Start my check-in"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSkip}
            className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card className="border-border/60 bg-card-gradient shadow-soft">
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className={accent ? "text-accent" : "text-primary"}>{icon}</span>
        </div>
        <div className={`mt-2 font-display text-3xl ${accent ? "text-aurora" : ""}`}>{value}</div>
        {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
