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

function memExec(cmd: Cmd): unknown {
  const [op, key] = [String(cmd[0]).toUpperCase(), String(cmd[1])];
  const set = mem.get(key) ?? new Map<string, number>();
  mem.set(key, set);
  const sorted = () => [...set.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  switch (op) {
    case "ZADD": {
      // ZADD key GT score member
      const score = Number(cmd[3]);
      const member = String(cmd[4]);
      const prev = set.get(member);
      if (prev === undefined || score > prev) set.set(member, score);
      return 1;
    }
    case "ZREVRANGE": {
      const stop = Number(cmd[3]);
      return sorted()
        .slice(0, stop + 1)
        .flatMap(([m, s]) => [m, String(s)]);
    }
    case "ZREVRANK": {
      const i = sorted().findIndex(([m]) => m === String(cmd[2]));
      return i < 0 ? null : i;
    }
    case "ZSCORE": {
      const s = set.get(String(cmd[2]));
      return s === undefined ? null : String(s);
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
