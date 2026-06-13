import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { siteConfig } from "@/lib/site";

/**
 * Contact form handler.
 *
 * Validates with the same Zod schema as the client, then delivers the message.
 * If a RESEND_API_KEY is configured, it sends an email via the Resend REST API
 * (no SDK dependency). Otherwise it logs the submission so the form still works
 * in development and previews.
 */
export async function POST(request: Request) {
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

  // Honeypot tripped — silently accept to avoid tipping off bots.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, company, phone, budget, service, message } = parsed.data;
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
    console.info("[contact] (no RESEND_API_KEY — logging only)\n" + summary);
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
        subject: `New enquiry: ${service} — ${name}`,
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
