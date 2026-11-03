import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { pipeline } from "@/lib/redis";
import { PageSpeedError, runPageSpeed, type HealthReport } from "@/lib/pagespeed";

export const dynamic = "force-dynamic";
// Lighthouse runs can take 20-40 seconds.
export const maxDuration = 60;

const CACHE_SECONDS = 6 * 60 * 60;
const hasRedis = Boolean(
  (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) &&
    (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)
);

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Accepts "example.co.uk", "www.example.co.uk/page" or a full URL; public websites only. */
function normalise(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 300) return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(u.protocol)) return null;
  const host = u.hostname.toLowerCase();
  if (!host.includes(".") || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) return null; // no raw IPs
  u.hash = "";
  return u.toString();
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const url = typeof body.url === "string" ? normalise(body.url) : null;
  if (!url) {
    return NextResponse.json({ error: "Please enter a valid website address, like example.co.uk." }, { status: 400 });
  }

  const key = `hc:${url.replace(/\/$/, "")}`;
  if (hasRedis) {
    try {
      const [cached] = await pipeline([["GET", key]]);
      if (typeof cached === "string") return NextResponse.json({ ...(JSON.parse(cached) as HealthReport), cached: true });
    } catch {
      /* cache is optional */
    }
  }

  const limit = rateLimit(`health:${clientIp(request)}`, { limit: 6, windowMs: 30 * 60 * 1000 });
  if (limit.limited) {
    return NextResponse.json(
      { error: "You've run a few checks in a short time. Please try again in a little while." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const report = await runPageSpeed(url);
    if (hasRedis) {
      try {
        await pipeline([["SET", key, JSON.stringify(report), "EX", CACHE_SECONDS]]);
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json(report);
  } catch (e) {
    if (e instanceof PageSpeedError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[health-check]", e);
    const timeout = e instanceof Error && e.name === "TimeoutError";
    return NextResponse.json(
      { error: timeout ? "That site took too long to load for the check. Please try again." : "Something went wrong running the check. Please try again." },
      { status: 504 }
    );
  }
}
