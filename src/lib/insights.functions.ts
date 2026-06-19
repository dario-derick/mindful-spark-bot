import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL } from "./ai-gateway.server";
import { WEEKLY_INSIGHT_PROMPT } from "./ai-prompts";
import { MOOD_LABEL, MOOD_SCORE, type MoodLevel } from "./mood.functions";

export type WeeklyInsight = {
  headline: string;
  mood_trend: string;
  common_emotions: string[];
  positive_habits: string[];
  areas_to_watch: string[];
  recommendations: string[];
};

export type WeeklyReflectionTier = "empty_state" | "starter" | "full";

export type WeeklyReflectionReason =
  | "no_check_ins"
  | "thin_data"
  | "mood_without_journal"
  | "journal_without_mood"
  | null;

export type WeeklyReflectionShell = {
  window_start: string;
  window_end: string;
  tier: WeeklyReflectionTier;
  reason: WeeklyReflectionReason;
  mood_count: number;
  journal_count: number;
  coach_message_count: number;
  common_mood_label: string | null;
  mood_read: "not_enough_yet" | "more_steady" | "more_variable";
  theme_labels: string[];
  headline: string;
  summary_line: string;
  context_line: string;
  coach_line: string;
  next_cue: string;
};

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

function makeSafeThemes({
  moods,
  journalCount,
  coachMessageCount,
}: {
  moods: { mood: string }[];
  journalCount: number;
  coachMessageCount: number;
}) {
  const hasGood = moods.some((m) => m.mood === "great" || m.mood === "good");
  const hasLow = moods.some((m) => m.mood === "low" || m.mood === "very_low");
  const hasNeutral = moods.some((m) => m.mood === "neutral");

  const labels = [
    hasGood ? "Brighter moments" : null,
    hasLow ? "Harder moments" : null,
    hasNeutral ? "Steady middle" : null,
    journalCount > 0 ? "Journal context" : null,
    coachMessageCount > 0 ? "Coach thread" : null,
  ].filter(Boolean) as string[];

  return labels.slice(0, 4);
}

export const listInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_insights")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getWeeklyReflectionShell = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const [{ data: moods }, { data: journals }, { data: coachMessages }] = await Promise.all([
      context.supabase
        .from("mood_entries")
        .select("id, mood, created_at")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: true }),
      context.supabase
        .from("journal_entries")
        .select("id, summary, created_at")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: false }),
      context.supabase
        .from("coach_messages")
        .select("id, role, created_at")
        .eq("role", "user")
        .gte("created_at", start.toISOString()),
    ]);

    const moodList = moods ?? [];
    const journalList = journals ?? [];
    const coachList = coachMessages ?? [];
    const moodCount = moodList.length;
    const journalCount = journalList.length;
    const coachMessageCount = coachList.length;

    const countsByMood = moodList.reduce<Record<string, number>>((acc, row) => {
      acc[row.mood] = (acc[row.mood] ?? 0) + 1;
      return acc;
    }, {});
    const commonMood = Object.entries(countsByMood).sort((a, b) => b[1] - a[1])[0]?.[0] as
      | MoodLevel
      | undefined;
    const averageMood =
      moodCount === 0
        ? 0
        : moodList.reduce((sum, row) => sum + MOOD_SCORE[row.mood as MoodLevel], 0) / moodCount;
    const distinctMoodCount = Object.keys(countsByMood).length;
    const moodRead =
      moodCount < 3 ? "not_enough_yet" : distinctMoodCount >= 3 ? "more_variable" : "more_steady";

    const tier: WeeklyReflectionTier =
      moodCount === 0
        ? "empty_state"
        : moodCount >= 3 || (moodCount >= 2 && journalCount >= 1)
          ? "full"
          : "starter";
    const reason: WeeklyReflectionReason =
      moodCount === 0 && journalCount === 0
        ? "no_check_ins"
        : moodCount === 0 && journalCount > 0
          ? "journal_without_mood"
          : moodCount > 0 && journalCount === 0
            ? "mood_without_journal"
            : tier === "starter"
              ? "thin_data"
              : null;

    const commonMoodLabel = commonMood ? MOOD_LABEL[commonMood] : null;
    const moodTone =
      averageMood >= 4
        ? "mostly lighter"
        : averageMood > 0 && averageMood <= 2.4
          ? "mostly heavier"
          : averageMood > 0
            ? "mixed"
            : "not started";

    const headline =
      tier === "full"
        ? "Your weekly reflection is taking shape"
        : tier === "starter"
          ? "Your first signal is starting"
          : reason === "journal_without_mood"
            ? "Add a mood to connect the dots"
            : "Build your first weekly reflection";

    const summaryLine =
      moodCount === 0
        ? journalCount > 0
          ? `You added ${pluralize(journalCount, "journal entry", "journal entries")} this week. A mood check-in can help connect those notes to a weekly pattern.`
          : "Start with one quick mood check-in. After a few entries, MindTrackAI can help you notice what keeps shaping your week."
        : `You checked in ${moodCount} ${moodCount === 1 ? "time" : "times"} this week${
            commonMoodLabel
              ? `, with mood logs most often around ${commonMoodLabel.toLowerCase()}`
              : ""
          }. The week looks ${moodTone}.`;

    const contextLine =
      journalCount > 0
        ? `${pluralize(journalCount, "journal entry", "journal entries")} can add context to this reflection without showing raw notes here.`
        : moodCount > 0
          ? "Mood check-ins show the rhythm. A short journal note can make next week's reflection clearer."
          : "A mood check-in gives MindTrackAI a first signal. Journal notes can come later if they help.";

    const coachLine =
      coachMessageCount > 0
        ? `You also talked with the coach ${coachMessageCount} ${coachMessageCount === 1 ? "time" : "times"} this week. The next version can hand this context into a coach session.`
        : "No coach messages this week. If something kept showing up, you can talk through one pattern privately.";

    const nextCue =
      moodCount === 0
        ? "Start with how you feel right now."
        : journalCount === 0
          ? "Next time you check in, add one line about what was happening around it."
          : moodCount < 3
            ? "One more check-in this week will make the next reflection clearer."
            : "Next time you check in, notice what happened before your mood shifted.";

    return {
      window_start: start.toISOString(),
      window_end: end.toISOString(),
      tier,
      reason,
      mood_count: moodCount,
      journal_count: journalCount,
      coach_message_count: coachMessageCount,
      common_mood_label: commonMoodLabel,
      mood_read: moodRead,
      theme_labels: makeSafeThemes({ moods: moodList, journalCount, coachMessageCount }),
      headline,
      summary_line: summaryLine,
      context_line: contextLine,
      coach_line: coachLine,
      next_cue: nextCue,
    } satisfies WeeklyReflectionShell;
  });

export const generateWeeklyInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured.");

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const [{ data: moods }, { data: journals }] = await Promise.all([
      context.supabase
        .from("mood_entries")
        .select("mood, notes, created_at")
        .gte("created_at", start.toISOString()),
      context.supabase
        .from("journal_entries")
        .select("summary, content, created_at")
        .gte("created_at", start.toISOString()),
    ]);

    const moodSummary = (moods ?? [])
      .map(
        (m) =>
          `${new Date(m.created_at).toLocaleDateString()}: ${MOOD_LABEL[m.mood as MoodLevel]}${m.notes ? ` — ${m.notes.slice(0, 120)}` : ""}`,
      )
      .join("\n");
    const journalSummary = (journals ?? [])
      .map(
        (j) =>
          `${new Date(j.created_at).toLocaleDateString()}: ${j.summary ?? j.content.slice(0, 200)}`,
      )
      .join("\n");

    const userPrompt = `Week of ${start.toDateString()} – ${end.toDateString()}.

Mood logs (${moods?.length ?? 0}):
${moodSummary || "(none)"}

Journal entries (${journals?.length ?? 0}):
${journalSummary || "(none)"}`;

    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(DEFAULT_CHAT_MODEL),
      system: WEEKLY_INSIGHT_PROMPT,
      prompt: userPrompt,
    });
    const cleaned = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    let parsed: WeeklyInsight;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned an unexpected response. Please try again.");
    }

    const { data: row, error } = await context.supabase
      .from("ai_insights")
      .insert({
        user_id: context.userId,
        kind: "weekly_report",
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        content: parsed,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
