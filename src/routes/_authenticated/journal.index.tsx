import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createJournalEntry, listJournalEntries } from "@/lib/journal.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/journal/")({
  head: () => ({ meta: [{ title: "Journal — MindTrackAI" }] }),
  component: JournalPage,
});

function JournalPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listJournalEntries);
  const createFn = useServerFn(createJournalEntry);
  const [content, setContent] = useState("");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => listFn(),
  });

  const create = useMutation({
    mutationFn: (c: string) => createFn({ data: { content: c } }),
    onSuccess: () => {
      toast.success("Saved — AI reflection added");
      setContent("");
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Journal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write freely. AI will offer a gentle reflection after you save.
        </p>
      </div>

      <Card className="border-border/60 bg-card-gradient shadow-soft">
        <CardHeader>
          <CardTitle className="font-display">New entry</CardTitle>
          <CardDescription>What's present for you right now?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing…"
            className="min-h-44 resize-none"
            maxLength={8000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.trim().length} chars</span>
            <Button
              disabled={content.trim().length < 5 || create.isPending}
              onClick={() => create.mutate(content.trim())}
              className="bg-aurora text-primary-foreground hover:opacity-90"
            >
              {create.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reflecting…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Save & reflect
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-display text-xl">History</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        )}
        <div className="grid gap-3">
          {entries.map((j) => (
            <Link
              key={j.id}
              to="/journal/$id"
              params={{ id: j.id }}
              className="rounded-xl border border-border/60 bg-card-gradient p-5 shadow-soft transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(j.created_at).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {j.ai_analysis ? (
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Sparkles className="h-3 w-3" /> reflected
                  </span>
                ) : null}
              </div>
              <div className="mt-2 line-clamp-2 text-sm">{j.summary ?? j.content.slice(0, 240)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
