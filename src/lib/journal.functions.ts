import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL } from "./ai-gateway.server";
import { JOURNAL_ANALYSIS_PROMPT } from "./ai-prompts";

export type JournalAnalysis = {
  summary: string;
  emotional_tone: string;
  themes: string[];
  positive_indicators: string[];
  stress_indicators: string[];
  wellness_observations: string;
  recommendations: string[];
};

async function analyzeContent(content: string): Promise<JournalAnalysis | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  try {
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(DEFAULT_CHAT_MODEL),
      system: JOURNAL_ANALYSIS_PROMPT,
      prompt: content.slice(0, 6000),
    });
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as JournalAnalysis;
  } catch (e) {
    console.error("journal analysis failed", e);
    return null;
  }
}

export const listJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("journal_entries")
      .select("id, content, summary, ai_analysis, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getJournalEntry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("journal_entries")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const createJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ content: z.string().trim().min(5).max(8000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const analysis = await analyzeContent(data.content);
    const { data: row, error } = await context.supabase
      .from("journal_entries")
      .insert({
        user_id: context.userId,
        content: data.content,
        summary: analysis?.summary ?? null,
        ai_analysis: analysis ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), content: z.string().trim().min(5).max(8000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const analysis = await analyzeContent(data.content);
    const { data: row, error } = await context.supabase
      .from("journal_entries")
      .update({
        content: data.content,
        summary: analysis?.summary ?? null,
        ai_analysis: analysis ?? null,
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("journal_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
