import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  deleteJournalEntry,
  getJournalEntry,
  updateJournalEntry,
  type JournalAnalysis,
} from "@/lib/journal.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/journal/$id")({
  head: () => ({ meta: [{ title: "Entry — MindTrackAI" }] }),
  component: EntryPage,
});

function EntryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getJournalEntry);
  const updateFn = useServerFn(updateJournalEntry);
  const deleteFn = useServerFn(deleteJournalEntry);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["journal", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [content, setContent] = useState("");
  useEffect(() => {
    if (entry?.content) setContent(entry.content);
  }, [entry?.content]);

  const update = useMutation({
    mutationFn: (c: string) => updateFn({ data: { id, content: c } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["journal", id] });
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Entry deleted");
      qc.invalidateQueries({ queryKey: ["journal-entries"] });
      navigate({ to: "/journal" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (!entry) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">Entry not found.</p>
      </div>
    );
  }

  const analysis = entry.ai_analysis as JournalAnalysis | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/journal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All entries
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">
            {new Date(entry.created_at).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => del.mutate()} disabled={del.isPending}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Card className="border-border/60 bg-card-gradient shadow-soft">
        <CardContent className="p-5">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-60 resize-none"
            maxLength={8000}
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={content.trim().length < 5 || content === entry.content || update.isPending}
              onClick={() => update.mutate(content.trim())}
              className="bg-aurora text-primary-foreground hover:opacity-90"
            >
              {update.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="border-border/60 bg-card-gradient shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Sparkles className="h-4 w-4 text-accent" /> AI reflection
            </CardTitle>
            <CardDescription>Not medical advice — a gentle perspective.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Section label="Summary">{analysis.summary}</Section>
            <Section label="Emotional tone">{analysis.emotional_tone}</Section>
            {analysis.themes?.length > 0 && (
              <Section label="Themes">
                <div className="flex flex-wrap gap-1.5">
                  {analysis.themes.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </Section>
            )}
            {analysis.positive_indicators?.length > 0 && (
              <Section label="Positive signs">
                <List items={analysis.positive_indicators} />
              </Section>
            )}
            {analysis.stress_indicators?.length > 0 && (
              <Section label="Stress signals">
                <List items={analysis.stress_indicators} />
              </Section>
            )}
            <Section label="Wellness observations">{analysis.wellness_observations}</Section>
            {analysis.recommendations?.length > 0 && (
              <Section label="Suggestions">
                <List items={analysis.recommendations} />
              </Section>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  );
}
