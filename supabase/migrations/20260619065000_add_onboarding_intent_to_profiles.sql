ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_intent TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_intent_other_text TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_intent_selected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_prompt_version TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_intent_check,
  ADD CONSTRAINT profiles_onboarding_intent_check
    CHECK (
      onboarding_intent IS NULL OR onboarding_intent IN (
        'mood_patterns',
        'energy_drivers',
        'recurring_stress',
        'routine_signals',
        'not_sure',
        'other',
        'skipped'
      )
    );

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_intent_other_text_length_check,
  ADD CONSTRAINT profiles_onboarding_intent_other_text_length_check
    CHECK (onboarding_intent_other_text IS NULL OR char_length(onboarding_intent_other_text) <= 120);

CREATE INDEX IF NOT EXISTS profiles_onboarding_intent_idx
  ON public.profiles (onboarding_intent);
