import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const MOOD_LEVELS = ["great", "good", "neutral", "low", "very_low"] as const;
export type MoodLevel = (typeof MOOD_LEVELS)[number];

export const MOOD_SCORE: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  neutral: 3,
  low: 2,
  very_low: 1,
};

export const MOOD_LABEL: Record<MoodLevel, string> = {
  great: "Great",
  good: "Good",
  neutral: "Neutral",
  low: "Low",
  very_low: "Very Low",
};

export const listMoodEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mood_entries")
      .select("id, mood, notes, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createMoodEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        mood: z.enum(MOOD_LEVELS),
        notes: z.string().trim().max(500).optional().nullable(),
        tags: z.array(z.string().trim().max(30)).max(10).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { count: existingMoodCount, error: countError } = await context.supabase
      .from("mood_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);

    const { data: row, error } = await context.supabase
      .from("mood_entries")
      .insert({
        user_id: context.userId,
        mood: data.mood,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      ...row,
      is_first_for_user: !countError && (existingMoodCount ?? 0) === 0,
    };
  });
