/**
 * Minimal Upstash Redis client over its REST API (no SDK needed).
 *
 * Reads the credentials Vercel's Upstash integration adds to a project:
 * KV_REST_API_URL / KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN. In local development without credentials it
 * falls back to an in-memory store so the leaderboards still work.
 */

type Cmd = (string | number)[];

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisConfigured = Boolean(url && token) || process.env.NODE_ENV !== "production";

/* ── In-memory fallback (development only) ──────────────────────────────── */

const mem = new Map<string, Map<string, number>>();
const hashes = new Map<string, Map<string, string>>();

function memExec(cmd: Cmd): unknown {
  const [op, key] = [String(cmd[0]).toUpperCase(), String(cmd[1])];
  const set = mem.get(key) ?? new Map<string, number>();
  mem.set(key, set);
  const desc = () => [...set.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const asc = () => [...set.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  const range = (list: [string, number][]) =>
    list.slice(Number(cmd[2]), Number(cmd[3]) + 1).flatMap(([m, s]) => [m, String(s)]);
  switch (op) {
    case "ZADD": {
      // ZADD key [GT|LT] [CH] score member
      const flags = cmd.slice(2, -2).map((f) => String(f).toUpperCase());
      const score = Number(cmd[cmd.length - 2]);
      const member = String(cmd[cmd.length - 1]);
      const prev = set.get(member);
      const better =
        prev === undefined || (flags.includes("LT") ? score < prev : flags.includes("GT") ? score > prev : score !== prev);
      if (better) set.set(member, score);
      return better ? 1 : 0;
    }
    case "ZREVRANGE":
      return range(desc());
    case "ZRANGE":
      return range(asc());
    case "ZREVRANK":
    case "ZRANK": {
      const i = (op === "ZRANK" ? asc() : desc()).findIndex(([m]) => m === String(cmd[2]));
      return i < 0 ? null : i;
    }
    case "ZSCORE": {
      const s = set.get(String(cmd[2]));
      return s === undefined ? null : String(s);
    }
    case "HSET": {
      const h = hashes.get(key) ?? new Map<string, string>();
      hashes.set(key, h);
      for (let i = 2; i + 1 < cmd.length; i += 2) h.set(String(cmd[i]), String(cmd[i + 1]));
      return 1;
    }
    case "HMGET": {
      const h = hashes.get(key);
      return cmd.slice(2).map((f) => h?.get(String(f)) ?? null);
    }
    case "EXPIRE":
      return 1;
    default:
      throw new Error(`Unsupported command in memory store: ${op}`);
  }
}

/** Run several commands in one round trip. Returns each command's result. */
export async function pipeline(cmds: Cmd[]): Promise<unknown[]> {
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") throw new Error("Redis is not configured");
    return cmds.map(memExec);
  }
  const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  return data.map((d) => {
    if (d.error) throw new Error(d.error);
    return d.result;
  });
}
