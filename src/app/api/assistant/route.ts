import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { pipeline } from "@/lib/redis";
import { assistantSystemPrompt } from "@/lib/assistant-knowledge";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.ASSISTANT_MODEL ?? "claude-opus-5-5";
const MAX_TURNS = 12;
const MAX_CHARS = 600;
/** Site-wide cap on assistant replies per day, to keep the API bill predictable. */
const DAILY_CAP = Number(process.env.ASSISTANT_DAILY_CAP ?? 400);

const enabled = Boolean(process.env.ANTHROPIC_API_KEY);
const hasRedis = Boolean(
  (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)
);

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ baseURL: process.env.ANTHROPIC_BASE_URL || undefined, maxRetries: 1 });
  return client;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

type Turn = { role: "user" | "assistant"; content: string };

function parseMessages(input: unknown): Turn[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const turns: Turn[] = [];
  for (const m of input.slice(-MAX_TURNS)) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, role === "user" ? MAX_CHARS : 2000);
    if (!text) continue;
    // Keep strict user/assistant alternation.
    if (turns.at(-1)?.role === role) turns[turns.length - 1] = { role, content: text };
    else turns.push({ role, content: text });
  }
  while (turns[0]?.role === "assistant") turns.shift();
  if (turns.at(-1)?.role !== "user") return null;
  return turns.length ? turns : null;
}

/** Lets the widget hide itself when the assistant isn't configured. */
export function GET() {
  return NextResponse.json({ enabled }, { headers: { "Cache-Control": "public, max-age=300" } });
}

export async function POST(request: Request) {
  if (!enabled) return NextResponse.json({ error: "The assistant isn't available right now." }, { status: 503 });

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const messages = parseMessages(body.messages);
  if (!messages) return NextResponse.json({ error: "Please type a question." }, { status: 400 });

  const limit = rateLimit(`assistant:${clientIp(request)}`, { limit: 20, windowMs: 15 * 60 * 1000 });
  if (limit.limited) {
    return NextResponse.json(
      { error: "You've asked a lot of questions in a short time. Please try again in a few minutes, or use the contact form." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  if (hasRedis && DAILY_CAP > 0) {
    try {
      const key = `ai:day:${new Date().toISOString().slice(0, 10)}`;
      const [count] = await pipeline([["INCR", key], ["EXPIRE", key, 172800]]);
      if (Number(count) > DAILY_CAP) {
        return NextResponse.json(
          { error: "The assistant has answered all it can for today. Please use the contact form and Daniel will get back to you." },
          { status: 429 }
        );
      }
    } catch {
      /* the cap is a safety net, not a requirement */
    }
  }

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, data: Record<string, unknown>) =>
    controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reply = getClient().beta.messages.stream(
          {
            model: MODEL,
            max_tokens: 2000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort: "low" },
            system: [{ type: "text", text: assistantSystemPrompt(), cache_control: { type: "ephemeral" } }],
            messages,
          },
          { signal: request.signal }
        );

        for await (const event of reply) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send(controller, { t: event.delta.text });
          }
        }
        const final = await reply.finalMessage();
        if (final.stop_reason === "refusal") {
          send(controller, {
            reset: true,
            t: "Sorry, I can't help with that one. For anything about Daniel's services, ask away or use the [contact form](/contact).",
          });
        }
        send(controller, { done: true });
      } catch (e) {
        if (request.signal.aborted) return controller.close();
        let msg = "Sorry, something went wrong. Please try again, or use the [contact form](/contact).";
        if (e instanceof Anthropic.RateLimitError || (e instanceof Anthropic.APIError && e.status === 529)) {
          msg = "I'm a bit busy right now. Please try again in a minute, or use the [contact form](/contact).";
        } else {
          console.error("[assistant]", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
        }
        send(controller, { error: msg });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
