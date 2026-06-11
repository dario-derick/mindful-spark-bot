import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardData } from "@/lib/dashboard.functions";
import { createMoodEntry, MOOD_LABEL, type MoodLevel } from "@/lib/mood.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Flame, BookHeart, TrendingUp, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

function DashboardPage() {
  const qc = useQueryClient();
  const fetchDashboard = useServerFn(getDashboardData);
  const logMood = useServerFn(createMoodEntry);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  const mutation = useMutation({
    mutationFn: (v: { mood: MoodLevel; notes?: string; tags?: string[] }) =>
      logMood({ data: v }),
    onSuccess: () => {
      toast.success("Mood logged");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your space…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A gentle look at where you've been.
        </p>
      </div>

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
                <BarChart data={data.distribution.map((d) => ({ ...d, label: MOOD_LABEL[d.mood] }))}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
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
            <MoodPicker
              submitting={mutation.isPending}
              onSubmit={(v) => mutation.mutate(v)}
            />
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
                  <div className="mt-1 line-clamp-2 text-sm">
                    {j.summary ?? "Entry"}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
