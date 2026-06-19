import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { siteConfig } from "@/lib/site";
import { rateLimit } from "@/lib/rate-limit";

/** Submissions completed faster than this are almost certainly bots. */
const MIN_FILL_MS = 3000;
/** A genuine enquiry rarely contains this many links. */
const MAX_LINKS = 5;

/** Best-effort client IP from the proxy headers Vercel sets. */
function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Count URL-like tokens in a string. */
function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\.|\[url|<a\s/gi) ?? []).length;
}

/**
 * Contact form handler.
 *
 * Spam protection, in order: per-IP rate limit, honeypot, time-trap and a
 * link-flood heuristic - then strict Zod validation. Bot-like submissions are
 * accepted silently (so bots don't learn what tripped them) rather than erroring.
 *
 * Delivery: sends via the Resend REST API when RESEND_API_KEY is set, otherwise
 * logs the submission so the form still works in development and previews.
 */
export async function POST(request: Request) {
  // 1. Rate limit per IP (5 requests / 10 minutes per instance).
  const ip = clientIp(request);
  const limit = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many messages in a short time. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // 2. Honeypot tripped - silently accept to avoid tipping off bots.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  // 3. Time-trap - submitted impossibly fast for a human. Silently drop.
  if (parsed.data.elapsedMs !== undefined && parsed.data.elapsedMs < MIN_FILL_MS) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, company, phone, budget, service, message } = parsed.data;

  // 4. Link-flood heuristic - genuine enquiries rarely contain many links.
  if (countLinks(`${message} ${company ?? ""}`) > MAX_LINKS) {
    return NextResponse.json({ ok: true });
  }
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? siteConfig.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? `DCW Digital <noreply@${new URL(siteConfig.url).hostname}>`;

  const summary = [
    `New enquiry via ${siteConfig.name}`,
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    company ? `Company: ${company}` : null,
    phone ? `Phone:   ${phone}` : null,
    `Service: ${service}`,
    budget ? `Budget:  ${budget}` : null,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  if (!apiKey) {
    // Dev / preview fallback: log and succeed.
    console.info("[contact] (no RESEND_API_KEY - logging only)\n" + summary);
    return NextResponse.json({ ok: true, delivery: "logged" });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `New enquiry: ${service} - ${name}`,
        text: summary,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[contact] Resend error:", res.status, detail);
      return NextResponse.json(
        { error: "We couldn't send your message right now. Please email me directly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, delivery: "email" });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or email me directly." },
      { status: 500 }
    );
  }
}
