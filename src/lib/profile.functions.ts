import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const ONBOARDING_PROMPT_VERSION = "first_check_in_v1";
export const ONBOARDING_INTENTS = [
  "mood_patterns",
  "energy_drivers",
  "recurring_stress",
  "routine_signals",
  "not_sure",
  "other",
  "skipped",
] as const;
export type OnboardingIntent = (typeof ONBOARDING_INTENTS)[number];

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      profile: data,
      email: (context.claims.email as string | undefined) ?? null,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ display_name: z.string().trim().min(1).max(60) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, display_name: data.display_name })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateOnboardingIntent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        onboarding_intent: z.enum(ONBOARDING_INTENTS),
        onboarding_intent_other_text: z.string().trim().max(120).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const otherText =
      data.onboarding_intent === "other" ? data.onboarding_intent_other_text?.trim() || null : null;

    const { data: row, error } = await context.supabase
      .from("profiles")
      .upsert({
        id: context.userId,
        onboarding_intent: data.onboarding_intent,
        onboarding_intent_other_text: otherText,
        onboarding_intent_selected_at: new Date().toISOString(),
        onboarding_prompt_version: ONBOARDING_PROMPT_VERSION,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
