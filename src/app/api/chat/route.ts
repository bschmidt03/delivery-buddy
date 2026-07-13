import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, type ChatMessage, type ShiftContext } from "@/lib/chatContext";

export const runtime = "nodejs";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const body = await request.json();
  const messages = body.messages as ChatMessage[];
  const context = (body.context ?? null) as ShiftContext;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages.", { status: 400 });
  }

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: buildSystemPrompt(context),
    messages,
  });

  const encoder = new TextEncoder();
  let settled = false;
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (delta) => {
        if (!settled) controller.enqueue(encoder.encode(delta));
      });
      stream.on("end", () => {
        if (!settled) {
          settled = true;
          controller.close();
        }
      });
      stream.on("error", (err) => {
        if (!settled) {
          settled = true;
          controller.error(err);
        }
      });
    },
    cancel() {
      settled = true;
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
