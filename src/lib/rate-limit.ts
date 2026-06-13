/**
 * Minimal in-memory, per-key rate limiter.
 *
 * NOTE: state lives in the serverless instance's memory, so it limits bursts
 * per running instance rather than globally. It's a solid first line of defence
 * with zero infrastructure. For strict, distributed limiting, back this with
 * Upstash Redis or Vercel KV.
 */
interface Bucket {
  hits: number[];
}

const store = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000 }: { limit?: number; windowMs?: number } = {}
): RateLimitResult {
  const now = Date.now();

  // Prevent unbounded growth under attack.
  if (store.size > MAX_KEYS) store.clear();

  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  bucket.hits.push(now);
  store.set(key, bucket);

  const limited = bucket.hits.length > limit;
  const oldest = bucket.hits[0] ?? now;
  const retryAfterSeconds = limited
    ? Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
    : 0;

  return {
    limited,
    remaining: Math.max(0, limit - bucket.hits.length),
    retryAfterSeconds,
  };
}
