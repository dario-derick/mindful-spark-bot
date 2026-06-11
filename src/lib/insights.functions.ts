import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL } from "./ai-gateway.server";
import { WEEKLY_INSIGHT_PROMPT } from "./ai-prompts";
import { MOOD_LABEL, type MoodLevel } from "./mood.functions";

export type WeeklyInsight = {
  headline: string;
  mood_trend: string;
  common_emotions: string[];
  positive_habits: string[];
  areas_to_watch: string[];
  recommendations: string[];
};

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
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
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
