import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL } from "@/lib/ai-gateway.server";
import { COACH_SYSTEM_PROMPT } from "@/lib/ai-prompts";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice("Bearer ".length);

        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claimsData?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claimsData.claims.sub as string;

        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response("Messages required", { status: 400 });
        }

        // Persist most recent user message
        const last = messages[messages.length - 1];
        if (last?.role === "user") {
          const text = last.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("")
            .trim();
          if (text) {
            await supabase.from("coach_messages").insert({
              user_id: userId,
              role: "user",
              content: text,
            });
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(DEFAULT_CHAT_MODEL),
          system: COACH_SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
          onFinish: async ({ text }) => {
            if (text?.trim()) {
              await supabase.from("coach_messages").insert({
                user_id: userId,
                role: "assistant",
                content: text,
              });
            }
          },
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
