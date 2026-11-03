import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { pipeline, redisConfigured } from "@/lib/redis";
import { PLAYER_ID_RE, playerName } from "@/lib/leaderboard";
import {
  EVENT_IDS,
  EVENTS,
  type EventId,
  type EventRecords,
  isEventId,
  plausibleMark,
  type RecordsResponse,
} from "@/lib/records";

export const dynamic = "force-dynamic";

const TOP_N = 5;
// No EXPIRE on these keys: world records are kept for good.
const boardKey = (e: EventId) => `rec:${e}`;
const datesKey = (e: EventId) => `rec:at:${e}`;

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

async function readAll(player: string | null): Promise<RecordsResponse> {
  const cmds: (string | number)[][] = [];
  for (const e of EVENT_IDS) {
    const asc = EVENTS[e].order === "asc";
    cmds.push([asc ? "ZRANGE" : "ZREVRANGE", boardKey(e), 0, TOP_N - 1, "WITHSCORES"]);
    if (player) cmds.push([asc ? "ZRANK" : "ZREVRANK", boardKey(e), player], ["ZSCORE", boardKey(e), player]);
  }
  const results = await pipeline(cmds);

  // Second round trip: when each top mark was set.
  const parsed: { e: EventId; ids: string[]; marks: number[]; rank: unknown; score: unknown }[] = [];
  let i = 0;
  for (const e of EVENT_IDS) {
    const flat = (results[i++] as string[] | null) ?? [];
    const rank = player ? results[i++] : null;
    const score = player ? results[i++] : null;
    const ids: string[] = [];
    const marks: number[] = [];
    for (let j = 0; j < flat.length; j += 2) {
      ids.push(flat[j]!);
      marks.push(Number(flat[j + 1]));
    }
    parsed.push({ e, ids, marks, rank, score });
  }
  const withIds = parsed.filter((p) => p.ids.length);
  const dates = withIds.length ? await pipeline(withIds.map((p) => ["HMGET", datesKey(p.e), ...p.ids])) : [];

  const out = {} as RecordsResponse;
  for (const p of parsed) {
    const d = (dates[withIds.indexOf(p)] as (string | null)[] | undefined) ?? [];
    const rec: EventRecords = {
      top: p.ids.map((id, k) => ({
        rank: k + 1,
        name: playerName(id),
        mark: p.marks[k]!,
        setAt: d[k] ? new Date(Number(d[k])).toISOString() : null,
        ...(id === player ? { you: true } : {}),
      })),
      you:
        player && p.rank !== null && p.rank !== undefined
          ? { rank: Number(p.rank) + 1, mark: Number(p.score) }
          : null,
    };
    out[p.e] = rec;
  }
  return out;
}

const unavailable = () => NextResponse.json({ error: "Records aren't available right now." }, { status: 503 });

export async function GET(request: Request) {
  if (!redisConfigured) return unavailable();
  const player = new URL(request.url).searchParams.get("player");
  try {
    const data = await readAll(player && PLAYER_ID_RE.test(player) ? player : null);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[records] read failed", e);
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!redisConfigured) return unavailable();

  const limit = rateLimit(`records:${clientIp(request)}`, { limit: 40, windowMs: 10 * 60 * 1000 });
  if (limit.limited) {
    return NextResponse.json({ error: "Too many results in a short time." }, { status: 429 });
  }

  let body: { event?: unknown; player?: unknown; mark?: unknown; durationMs?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { event, player, mark, durationMs } = body;
  if (!isEventId(event) || typeof player !== "string" || !PLAYER_ID_RE.test(player)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof mark !== "number" || typeof durationMs !== "number" || !plausibleMark(event, mark, durationMs)) {
    return NextResponse.json({ error: "That result doesn't look right." }, { status: 422 });
  }

  try {
    const asc = EVENTS[event].order === "asc";
    const key = boardKey(event);
    const [prevBest] = await pipeline([[asc ? "ZRANGE" : "ZREVRANGE", key, 0, 0, "WITHSCORES"]]);
    const best = Array.isArray(prevBest) && prevBest.length ? Number(prevBest[1]) : null;
    // LT/GT: only ever improves a player's personal best. CH: tells us if it did.
    const [changed] = await pipeline([["ZADD", key, asc ? "LT" : "GT", "CH", mark, player]]);
    const improved = Number(changed) > 0;
    if (improved) await pipeline([["HSET", datesKey(event), player, Date.now()]]);
    const data = await readAll(player);
    data.improved = improved;
    data.newRecord = improved && (best === null || (asc ? mark < best : mark > best));
    return NextResponse.json(data);
  } catch (e) {
    console.error("[records] write failed", e);
    return unavailable();
  }
}
