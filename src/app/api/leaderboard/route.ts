import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { pipeline, redisConfigured } from "@/lib/redis";
import {
  type BoardResponse,
  type GameId,
  isGameId,
  PLAYER_ID_RE,
  plausible,
  playerName,
  weekInfo,
} from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

const TOP_N = 10;
/** Boards are kept for five weeks, then Redis deletes them automatically. */
const KEEP_SECONDS = 5 * 7 * 24 * 60 * 60;

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const keyFor = (game: GameId, week: string) => `lb:${game}:${week}`;

async function readBoard(game: GameId, player: string | null): Promise<BoardResponse> {
  const { id: week, resetsAt } = weekInfo();
  const key = keyFor(game, week);
  const cmds: (string | number)[][] = [["ZREVRANGE", key, 0, TOP_N - 1, "WITHSCORES"]];
  if (player) cmds.push(["ZREVRANK", key, player], ["ZSCORE", key, player]);
  const [range, rank, score] = await pipeline(cmds);

  const flat = (range as string[] | null) ?? [];
  const top = [];
  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i]!;
    top.push({
      rank: i / 2 + 1,
      name: playerName(id),
      score: Number(flat[i + 1]),
      ...(id === player ? { you: true } : {}),
    });
  }

  return {
    game,
    week,
    resetsAt: resetsAt.toISOString(),
    top,
    you: player && rank !== null && rank !== undefined ? { rank: Number(rank) + 1, score: Number(score) } : null,
  };
}

const unavailable = () =>
  NextResponse.json({ error: "Leaderboards aren't available right now." }, { status: 503 });

export async function GET(request: Request) {
  if (!redisConfigured) return unavailable();
  const params = new URL(request.url).searchParams;
  const game = params.get("game");
  const player = params.get("player");
  if (!isGameId(game)) return NextResponse.json({ error: "Unknown game." }, { status: 400 });
  try {
    const board = await readBoard(game, player && PLAYER_ID_RE.test(player) ? player : null);
    return NextResponse.json(board, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[leaderboard] read failed", e);
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!redisConfigured) return unavailable();

  const limit = rateLimit(`leaderboard:${clientIp(request)}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (limit.limited) {
    return NextResponse.json(
      { error: "Too many scores in a short time." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: { game?: unknown; player?: unknown; score?: unknown; durationMs?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { game, player, score, durationMs } = body;
  if (!isGameId(game) || typeof player !== "string" || !PLAYER_ID_RE.test(player)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof score !== "number" || typeof durationMs !== "number" || !plausible(game, score, durationMs)) {
    return NextResponse.json({ error: "That score doesn't look right." }, { status: 422 });
  }

  try {
    const key = keyFor(game, weekInfo().id);
    // GT: only ever raises a player's weekly best, never lowers it.
    await pipeline([
      ["ZADD", key, "GT", score, player],
      ["EXPIRE", key, KEEP_SECONDS],
    ]);
    return NextResponse.json(await readBoard(game, player));
  } catch (e) {
    console.error("[leaderboard] write failed", e);
    return unavailable();
  }
}
