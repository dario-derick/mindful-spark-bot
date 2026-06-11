import { useState } from "react";
import { MOOD_LABEL, MOOD_LEVELS, type MoodLevel } from "@/lib/mood.functions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const FACES: Record<MoodLevel, string> = {
  great: "😊",
  good: "🙂",
  neutral: "😐",
  low: "😕",
  very_low: "😢",
};

export function MoodPicker({
  onSubmit,
  submitting,
}: {
  onSubmit: (v: { mood: MoodLevel; notes?: string; tags?: string[] }) => void;
  submitting?: boolean;
}) {
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [notes, setNotes] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-sm text-muted-foreground">How are you feeling right now?</p>
        <div className="grid grid-cols-5 gap-2">
          {MOOD_LEVELS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={cn(
                "group flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/50 p-3 transition-all hover:border-primary/50 hover:bg-card",
                mood === m && "border-primary bg-primary/10 shadow-glow ring-1 ring-primary/50",
              )}
            >
              <span className="text-2xl">{FACES[m]}</span>
              <span className="text-[11px] text-muted-foreground group-hover:text-foreground">
                {MOOD_LABEL[m]}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Textarea
        placeholder="Anything on your mind? (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={500}
        className="min-h-20"
      />
      <Input
        placeholder="Tags (comma-separated, optional)"
        value={tagsRaw}
        onChange={(e) => setTagsRaw(e.target.value)}
      />
      <Button
        className="w-full bg-aurora text-primary-foreground hover:opacity-90"
        disabled={!mood || submitting}
        onClick={() => {
          if (!mood) return;
          const tags = tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 10);
          onSubmit({ mood, notes: notes.trim() || undefined, tags });
        }}
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log mood
      </Button>
    </div>
  );
}
