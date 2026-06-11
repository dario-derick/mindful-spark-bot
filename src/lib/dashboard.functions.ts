import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MOOD_SCORE, type MoodLevel } from "./mood.functions";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function diffDays(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function computeStreak(dates: Date[]) {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const days = Array.from(new Set(dates.map((d) => startOfDay(d).getTime()))).sort((a, b) => b - a);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === 86_400_000) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  let current = 0;
  const today = startOfDay(new Date()).getTime();
  if (days[0] === today || days[0] === today - 86_400_000) {
    current = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i - 1] - days[i] === 86_400_000) current++;
      else break;
    }
  }
  return { current, longest };
}

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [{ data: moods }, { data: journals }] = await Promise.all([
      context.supabase
        .from("mood_entries")
        .select("id, mood, notes, created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true }),
      context.supabase
        .from("journal_entries")
        .select("id, summary, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const moodList = moods ?? [];
    const journalList = journals ?? [];

    const moodStreak = computeStreak(moodList.map((m) => new Date(m.created_at)));
    const journalStreak = computeStreak(journalList.map((j) => new Date(j.created_at)));

    // Last 7 days mood average
    const weekAgo = startOfDay(new Date());
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekMoods = moodList.filter((m) => new Date(m.created_at) >= weekAgo);
    const weeklyAvg =
      weekMoods.length === 0
        ? 0
        : weekMoods.reduce((s, m) => s + MOOD_SCORE[m.mood as MoodLevel], 0) / weekMoods.length;

    // Wellness score (0-100): blend mood avg, journal frequency, mood consistency
    const moodConsistency = Math.min(weekMoods.length / 7, 1);
    const journalsThisWeek = journalList.filter(
      (j) => new Date(j.created_at) >= weekAgo,
    ).length;
    const journalFreq = Math.min(journalsThisWeek / 4, 1);
    const moodComponent = weeklyAvg / 5;
    const wellnessScore = Math.round(
      (moodComponent * 0.5 + moodConsistency * 0.25 + journalFreq * 0.25) * 100,
    );

    // Daily mood series (last 14 days)
    const dailySeries: { date: string; score: number | null; label: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(new Date());
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const dayMoods = moodList.filter((m) => {
        const md = new Date(m.created_at);
        return md >= d && md < next;
      });
      const score =
        dayMoods.length === 0
          ? null
          : dayMoods.reduce((s, m) => s + MOOD_SCORE[m.mood as MoodLevel], 0) / dayMoods.length;
      dailySeries.push({
        date: d.toISOString().slice(0, 10),
        score,
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
      });
    }

    // Distribution
    const distribution = (["great", "good", "neutral", "low", "very_low"] as MoodLevel[]).map(
      (m) => ({
        mood: m,
        count: moodList.filter((x) => x.mood === m).length,
      }),
    );

    return {
      moodStreak,
      journalStreak,
      totals: {
        journals: journalList.length,
        moods: moodList.length,
      },
      weeklyAvg: Number(weeklyAvg.toFixed(2)),
      wellnessScore,
      dailySeries,
      distribution,
      recentJournals: journalList.slice(0, 5),
      recentMoods: [...moodList].reverse().slice(0, 5),
    };
  });
