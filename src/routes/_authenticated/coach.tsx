import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCoachMessages } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Brain, Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "Wellness Coach — MindTrackAI" }] }),
  component: CoachPage,
});

function CoachPage() {
  const listFn = useServerFn(listCoachMessages);
  const { data: history, isLoading } = useQuery({
    queryKey: ["coach-messages"],
    queryFn: () => listFn(),
  });

  if (isLoading || !history) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversation…
      </div>
    );
  }
  return <CoachChat history={history} />;
}

function CoachChat({
  history,
}: {
  history: { id: string; role: string; content: string }[];
}) {
  const initialMessages: UIMessage[] = useMemo(
    () =>
      history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          parts: [{ type: "text", text: m.content }],
        })),
    [history],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (input, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(input, { ...init, headers });
        },
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: "coach",
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <h1 className="font-display text-3xl md:text-4xl">Wellness Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A supportive AI companion. Not a substitute for professional care.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/60 bg-card-gradient shadow-soft">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-aurora shadow-glow">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="font-display text-lg">How are you, really?</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Share what's on your mind — a feeling, a moment, a question.
              </p>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-3", isUser && "justify-end")}>
                {!isUser && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Brain className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                    isUser
                      ? "bg-primary/90 text-primary-foreground"
                      : "bg-background/40 text-foreground",
                  )}
                >
                  {text || (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> thinking…
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {error && (
            <p className="text-center text-xs text-destructive">
              {error.message || "Something went wrong"}
            </p>
          )}
        </div>

        <div className="border-t border-border/60 bg-background/40 p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Type a message…"
              className="min-h-12 resize-none border-0 bg-transparent focus-visible:ring-0"
              maxLength={2000}
            />
            <Button
              size="icon"
              onClick={submit}
              disabled={busy || !input.trim()}
              className="bg-aurora text-primary-foreground hover:opacity-90"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
